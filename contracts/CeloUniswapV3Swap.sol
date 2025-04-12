// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title CeloUniswapV3Swap
 * @dev Contract for swapping ETH or any ERC20 token to cUSD and cREAL on Celo using Uniswap V3
 * Includes security features, take rate functionality, and simplified interface
 */
interface IV3SwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    struct ExactInputParams {
        bytes path;
        address recipient;
        uint256 amountIn;
        uint256 amountOutMinimum;
    }

    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);
    function exactInput(ExactInputParams calldata params) external payable returns (uint256 amountOut);
    function WETH9() external view returns (address);
    function unwrapWETH9(uint256 amountMinimum, address recipient) external payable;
}

interface IPriceOracle {
    function getPrice(address token) external view returns (uint256);
}

contract CeloUniswapV3Swap is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    // Constants
    IV3SwapRouter public immutable swapRouter;
    address public immutable CUSD = 0x765DE816845861e75A25fCA122bb6898B8B1282a; // cUSD on Celo
    address public immutable CREAL = 0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787; // cREAL on Celo
    address public immutable CELO; // Native CELO - initialized via router.WETH9()
    
    // Default fee tier for Uniswap V3 (0.3%)
    uint24 public constant DEFAULT_FEE_TIER = 3000;
    
    // Variables
    uint256 public takeRateBps = 25; // 0.25% fee by default 
    uint256 public constant MAX_TAKE_RATE_BPS = 100; // Max 1% fee allowed
    uint256 public maxSlippageBps = 500; // 5% maximum allowed slippage
    
    // Fee accounting
    mapping(address => uint256) public accumulatedFees;
    
    // Optional price oracle for price validation
    IPriceOracle public priceOracle;
    bool public priceValidationEnabled = false;
    uint256 public priceValidationThreshold = 1 ether; // Only validate prices for swaps above this amount
    uint256 public maxPriceDeviationBps = 300; // 3% maximum allowed price deviation
    
    // Discounts for specific addresses (e.g., partners or high-volume traders)
    mapping(address => uint256) public feeDiscountsBps;
    
    // Custom error declarations
    error InsufficientAmount();
    error InvalidAddress();
    error InvalidToken();
    error SameTokenSwap();
    error MaxRateExceeded();
    error InsufficientBalance();
    error TransferFailed();
    error DeadlineExpired();
    error SlippageTooHigh(uint256 expected, uint256 received);
    error PriceDeviationTooHigh(uint256 expectedPrice, uint256 actualPrice);
    error ZeroAmount();
    error InvalidBatchLength();
    error BatchOperationFailed();
    error UnexpectedSwapOutput(uint256 expected, uint256 received);
    
    // Events
    event SwapExecuted(address indexed user, address indexed tokenIn, uint256 amountIn, uint256 stablecoinAmount, address stablecoin, uint256 feeAmount);
    event TakeRateUpdated(uint256 newRateBps);
    event MaxSlippageUpdated(uint256 newSlippageBps);
    event FeesWithdrawn(address token, uint256 amount);
    event FeeDiscountSet(address indexed user, uint256 discountBps);
    event PriceOracleSet(address indexed oracle);
    event PriceValidationToggled(bool enabled);
    event BatchSwapExecuted(address indexed user, uint256 batchSize);
    
    /**
     * @dev Constructor sets swap router address and transfers ownership to deployer
     * @param _swapRouterAddress Uniswap V3 SwapRouter address on Celo
     */
    constructor(address _swapRouterAddress) Ownable(msg.sender) {
        if (_swapRouterAddress == address(0)) revert InvalidAddress();
        swapRouter = IV3SwapRouter(_swapRouterAddress);
        CELO = swapRouter.WETH9(); // Get CELO address from router
    }
    
    /**
     * @dev Internal function to calculate effective take rate with discounts
     * @param _sender Address of the sender to check for discounts
     * @return effectiveTakeRate The effective take rate after discounts
     */
    function _getEffectiveTakeRate(address _sender) internal view returns (uint256) {
        uint256 discount = feeDiscountsBps[_sender];
        
        // If discount >= takeRateBps, fee is 0
        if (discount >= takeRateBps) {
            return 0;
        }
        
        return takeRateBps - discount;
    }
    
    /**
     * @dev Internal function to validate the expected price from oracle
     * @param _tokenIn Input token address
     * @param _tokenOut Output token address
     * @param _amountIn Input amount
     * @param _amountOut Output amount
     */
    function _validatePrice(
        address _tokenIn, 
        address _tokenOut, 
        uint256 _amountIn, 
        uint256 _amountOut
    ) internal view {
        // Skip validation if disabled or below threshold
        if (!priceValidationEnabled || _amountIn < priceValidationThreshold || address(priceOracle) == address(0)) {
            return;
        }

        uint256 oracleInputPrice = priceOracle.getPrice(_tokenIn);
        uint256 oracleOutputPrice = priceOracle.getPrice(_tokenOut);
        
        // Calculate expected output based on oracle prices
        uint256 expectedOutput = (_amountIn * oracleInputPrice) / oracleOutputPrice;
        
        // Calculate the deviation
        uint256 deviation;
        if (_amountOut > expectedOutput) {
            deviation = ((_amountOut - expectedOutput) * 10000) / expectedOutput;
        } else {
            deviation = ((expectedOutput - _amountOut) * 10000) / expectedOutput;
        }
        
        // Revert if deviation exceeds threshold
        if (deviation > maxPriceDeviationBps) {
            revert PriceDeviationTooHigh(expectedOutput, _amountOut);
        }
    }
    
    /**
     * @dev Internal function to validate and check slippage
     * @param _expectedAmount Expected amount
     * @param _actualAmount Actual amount received
     */
    function _validateSlippage(uint256 _expectedAmount, uint256 _actualAmount) internal view {
        if (_actualAmount == 0) revert ZeroAmount();
        
        // Calculate slippage: ((expected - actual) / expected) * 10000
        if (_expectedAmount > _actualAmount) {
            uint256 slippage = ((_expectedAmount - _actualAmount) * 10000) / _expectedAmount;
            if (slippage > maxSlippageBps) {
                revert SlippageTooHigh(_expectedAmount, _actualAmount);
            }
        }
    }
    
    /**
     * @dev Internal function to safely reset approvals to zero before approving new amount
 * @param _token Token address
 * @param _spender Spender address
 * @param _amount Amount to approve
 */
function _safeApprove(address _token, address _spender, uint256 _amount) internal {
    // Reset approval to 0 first if current allowance is not 0
    uint256 currentAllowance = IERC20(_token).allowance(address(this), _spender);
    if (currentAllowance > 0) {
        IERC20(_token).approve(_spender, 0);
    }
    
    // Approve new amount
    IERC20(_token).approve(_spender, _amount);
}
    
    /**
     * @dev Internal function to handle fee collection and accounting
     * @param _token Token address (address(0) for CELO)
     * @param _amount Amount to take fee from
     * @param _sender Sender address to check for discounts
     * @return feeAmount Fee amount collected
     * @return remainingAmount Remaining amount after fee
     */
    function _handleFees(
        address _token, 
        uint256 _amount, 
        address _sender
    ) internal returns (uint256 feeAmount, uint256 remainingAmount) {
        uint256 effectiveTakeRate = _getEffectiveTakeRate(_sender);
        feeAmount = (_amount * effectiveTakeRate) / 10000;
        remainingAmount = _amount - feeAmount;
        
        // Track accumulated fees
        if (feeAmount > 0) {
            accumulatedFees[_token] += feeAmount;
        }
        
        return (feeAmount, remainingAmount);
    }
    
    /**
     * @dev Internal function to perform token to stablecoin swap
     * @param _tokenIn Input token address
     * @param _stablecoin Stablecoin address (CUSD or CREAL)
     * @param _amountIn Input amount
     * @param _amountOutMin Minimum output amount
     * @param _useMultihop Whether to use multi-hop routing
     * @return amountOut Amount of stablecoin received
     */
    function _swapTokenForStablecoin(
        address _tokenIn,
        address _stablecoin,
        uint256 _amountIn,
        uint256 _amountOutMin,
        bool _useMultihop
    ) internal returns (uint256 amountOut) {
        // Approve router to spend tokens
        _safeApprove(_tokenIn, address(swapRouter), _amountIn);
        
        uint256 initialBalance = IERC20(_stablecoin).balanceOf(msg.sender);
        
        if (_useMultihop && _tokenIn != CELO) {
            // Multi-hop route: tokenIn -> CELO -> stablecoin
            bytes memory path = abi.encodePacked(
                _tokenIn, 
                uint24(DEFAULT_FEE_TIER), 
                CELO, 
                uint24(DEFAULT_FEE_TIER), 
                _stablecoin
            );
            
            IV3SwapRouter.ExactInputParams memory params = IV3SwapRouter.ExactInputParams({
                path: path,
                recipient: msg.sender,
                amountIn: _amountIn,
                amountOutMinimum: _amountOutMin
            });
            
            uint256 routerOutput = swapRouter.exactInput(params);
            
            // Verify router output meets minimum
            if (routerOutput < _amountOutMin) {
                revert UnexpectedSwapOutput(_amountOutMin, routerOutput);
            }
        } else {
            // Direct route: tokenIn -> stablecoin
            IV3SwapRouter.ExactInputSingleParams memory params = IV3SwapRouter.ExactInputSingleParams({
                tokenIn: _tokenIn,
                tokenOut: _stablecoin,
                fee: DEFAULT_FEE_TIER,
                recipient: msg.sender,
                amountIn: _amountIn,
                amountOutMinimum: _amountOutMin,
                sqrtPriceLimitX96: 0
            });
            
            uint256 routerOutput = swapRouter.exactInputSingle(params);
            
            // Verify router output meets minimum
            if (routerOutput < _amountOutMin) {
                revert UnexpectedSwapOutput(_amountOutMin, routerOutput);
            }
        }
        
        // Calculate actual stablecoin received
        amountOut = IERC20(_stablecoin).balanceOf(msg.sender) - initialBalance;
        
        // Validate price if enabled
        _validatePrice(_tokenIn, _stablecoin, _amountIn, amountOut);
        
        return amountOut;
    }
    
    /**
     * @notice Swaps CELO for cUSD and sends tokens to user
     * @dev Includes take rate calculation and nonReentrant guard
     * @param _amountOutMin Minimum cUSD to receive
     * @param _deadline Deadline for the transaction
     * @param _expectedOutput Expected output amount for slippage validation
     * @return stablecoinReceived The amount of cUSD received
     */
    function swapCELOForCUSD(
        uint256 _amountOutMin, 
        uint256 _deadline,
        uint256 _expectedOutput
    ) 
        external 
        payable 
        nonReentrant
        whenNotPaused
        returns (uint256 stablecoinReceived) 
    {
        if (msg.value == 0) revert InsufficientAmount();
        if (block.timestamp > _deadline) revert DeadlineExpired();
        
        // Calculate the take rate amount
        (uint256 feeAmount, uint256 swapAmount) = _handleFees(address(0), msg.value, msg.sender);
        
        // Get initial cUSD balance of user to calculate exact received amount
        uint256 initialBalance = IERC20(CUSD).balanceOf(msg.sender);
        
        // Perform the swap
        IV3SwapRouter.ExactInputSingleParams memory params = IV3SwapRouter.ExactInputSingleParams({
            tokenIn: CELO,
            tokenOut: CUSD,
            fee: DEFAULT_FEE_TIER,
            recipient: msg.sender,
            amountIn: swapAmount,
            amountOutMinimum: _amountOutMin,
            sqrtPriceLimitX96: 0
        });
        
        // Execute the swap (wraps CELO internally)
        uint256 routerOutput = swapRouter.exactInputSingle{value: swapAmount}(params);
        
        // Verify router output meets minimum
        if (routerOutput < _amountOutMin) {
            revert UnexpectedSwapOutput(_amountOutMin, routerOutput);
        }
        
        // Calculate actual cUSD received
        stablecoinReceived = IERC20(CUSD).balanceOf(msg.sender) - initialBalance;
        
        // Validate the actual received amount against expected output
        if (_expectedOutput > 0) {
            _validateSlippage(_expectedOutput, stablecoinReceived);
        }
        
        // Validate price if enabled
        _validatePrice(CELO, CUSD, swapAmount, stablecoinReceived);
        
        emit SwapExecuted(msg.sender, address(0), msg.value, stablecoinReceived, CUSD, feeAmount);
        return stablecoinReceived;
    }
    
    /**
     * @notice Swaps CELO for cREAL and sends tokens to user
     * @dev Includes take rate calculation and nonReentrant guard
     * @param _amountOutMin Minimum cREAL to receive
     * @param _deadline Deadline for the transaction
     * @param _expectedOutput Expected output amount for slippage validation
     * @return stablecoinReceived The amount of cREAL received
     */
    function swapCELOForCREAL(
        uint256 _amountOutMin, 
        uint256 _deadline,
        uint256 _expectedOutput
    ) 
        external 
        payable 
        nonReentrant
        whenNotPaused
        returns (uint256 stablecoinReceived) 
    {
        if (msg.value == 0) revert InsufficientAmount();
        if (block.timestamp > _deadline) revert DeadlineExpired();
        
        // Calculate the take rate amount
        (uint256 feeAmount, uint256 swapAmount) = _handleFees(address(0), msg.value, msg.sender);
        
        // Get initial cREAL balance of user to calculate exact received amount
        uint256 initialBalance = IERC20(CREAL).balanceOf(msg.sender);
        
        // Perform the swap
        IV3SwapRouter.ExactInputSingleParams memory params = IV3SwapRouter.ExactInputSingleParams({
            tokenIn: CELO,
            tokenOut: CREAL,
            fee: DEFAULT_FEE_TIER,
            recipient: msg.sender,
            amountIn: swapAmount,
            amountOutMinimum: _amountOutMin,
            sqrtPriceLimitX96: 0
        });
        
        // Execute the swap (wraps CELO internally)
        uint256 routerOutput = swapRouter.exactInputSingle{value: swapAmount}(params);
        
        // Verify router output meets minimum
        if (routerOutput < _amountOutMin) {
            revert UnexpectedSwapOutput(_amountOutMin, routerOutput);
        }
        
        // Calculate actual cREAL received
        stablecoinReceived = IERC20(CREAL).balanceOf(msg.sender) - initialBalance;
        
        // Validate the actual received amount against expected output
        if (_expectedOutput > 0) {
            _validateSlippage(_expectedOutput, stablecoinReceived);
        }
        
        // Validate price if enabled
        _validatePrice(CELO, CREAL, swapAmount, stablecoinReceived);
        
        emit SwapExecuted(msg.sender, address(0), msg.value, stablecoinReceived, CREAL, feeAmount);
        return stablecoinReceived;
    }
    
    /**
     * @notice Swaps any ERC20 token for cUSD and sends tokens to user
     * @dev Token must be approved by user before calling this function
     * @param _tokenIn Address of token to swap from
     * @param _amountIn Amount of token to swap
     * @param _amountOutMin Minimum cUSD to receive
     * @param _deadline Deadline for the transaction
     * @param _useMultihop If true, routes through CELO for better liquidity if needed
     * @param _expectedOutput Expected output amount for slippage validation
     * @return stablecoinReceived The amount of cUSD received
     */
    function swapTokenForCUSD(
        address _tokenIn,
        uint256 _amountIn,
        uint256 _amountOutMin,
        uint256 _deadline,
        bool _useMultihop,
        uint256 _expectedOutput
    ) 
        external 
        nonReentrant
        whenNotPaused
        returns (uint256 stablecoinReceived) 
    {
        if (_tokenIn == address(0)) revert InvalidAddress();
        if (_amountIn == 0) revert InsufficientAmount();
        if (_tokenIn == CUSD) revert SameTokenSwap();
        if (block.timestamp > _deadline) revert DeadlineExpired();
        
        // Transfer tokens from user to contract
        IERC20(_tokenIn).safeTransferFrom(msg.sender, address(this), _amountIn);
        
        // Calculate the take rate amount
        (uint256 feeAmount, uint256 swapAmount) = _handleFees(_tokenIn, _amountIn, msg.sender);
        
        // Perform the swap
        stablecoinReceived = _swapTokenForStablecoin(
            _tokenIn,
            CUSD,
            swapAmount,
            _amountOutMin,
            _useMultihop
        );
        
        // Validate the actual received amount against expected output
        if (_expectedOutput > 0) {
            _validateSlippage(_expectedOutput, stablecoinReceived);
        }
        
        emit SwapExecuted(msg.sender, _tokenIn, _amountIn, stablecoinReceived, CUSD, feeAmount);
        return stablecoinReceived;
    }
    
    /**
     * @notice Swaps any ERC20 token for cREAL and sends tokens to user
     * @dev Token must be approved by user before calling this function
     * @param _tokenIn Address of token to swap from
     * @param _amountIn Amount of token to swap
     * @param _amountOutMin Minimum cREAL to receive
     * @param _deadline Deadline for the transaction
     * @param _useMultihop If true, routes through CELO for better liquidity if needed
     * @param _expectedOutput Expected output amount for slippage validation
     * @return stablecoinReceived The amount of cREAL received
     */
    function swapTokenForCREAL(
        address _tokenIn,
        uint256 _amountIn,
        uint256 _amountOutMin,
        uint256 _deadline,
        bool _useMultihop,
        uint256 _expectedOutput
    ) 
        external 
        nonReentrant
        whenNotPaused
        returns (uint256 stablecoinReceived) 
    {
        if (_tokenIn == address(0)) revert InvalidAddress();
        if (_amountIn == 0) revert InsufficientAmount();
        if (_tokenIn == CREAL) revert SameTokenSwap();
        if (block.timestamp > _deadline) revert DeadlineExpired();
        
        // Transfer tokens from user to contract
        IERC20(_tokenIn).safeTransferFrom(msg.sender, address(this), _amountIn);
        
        // Calculate the take rate amount
        (uint256 feeAmount, uint256 swapAmount) = _handleFees(_tokenIn, _amountIn, msg.sender);
        
        // Perform the swap
        stablecoinReceived = _swapTokenForStablecoin(
            _tokenIn,
            CREAL,
            swapAmount,
            _amountOutMin,
            _useMultihop
        );
        
        // Validate the actual received amount against expected output
        if (_expectedOutput > 0) {
            _validateSlippage(_expectedOutput, stablecoinReceived);
        }
        
        emit SwapExecuted(msg.sender, _tokenIn, _amountIn, stablecoinReceived, CREAL, feeAmount);
        return stablecoinReceived;
    }
    
    /**
     * @notice Batch swap function for multiple tokens to cUSD
     * @dev All tokens must be approved before calling
     * @param _tokensIn Array of token addresses to swap (address(0) for CELO)
     * @param _amountsIn Array of amounts to swap
     * @param _amountsOutMin Array of minimum amounts to receive
     * @param _deadline Deadline for all transactions
     * @param _useMultihop Array of flags for multi-hop routing
     * @return totalReceived Total cUSD received from all swaps
     */
    function batchSwapForCUSD(
        address[] calldata _tokensIn,
        uint256[] calldata _amountsIn,
        uint256[] calldata _amountsOutMin,
        uint256 _deadline,
        bool[] calldata _useMultihop
    )
        external
        payable
        nonReentrant
        whenNotPaused
        returns (uint256 totalReceived)
    {
        // Validate input arrays
        uint256 length = _tokensIn.length;
        if (length == 0 || 
            length != _amountsIn.length || 
            length != _amountsOutMin.length || 
            length != _useMultihop.length) {
            revert InvalidBatchLength();
        }
        
        if (block.timestamp > _deadline) revert DeadlineExpired();
        
        uint256 celoRemaining = msg.value;
        uint256 initialCUSDBalance = IERC20(CUSD).balanceOf(msg.sender);
        
        // Process each swap
        for (uint256 i = 0; i < length; i++) {
            address tokenIn = _tokensIn[i];
            uint256 amountIn = _amountsIn[i];
            uint256 amountOutMin = _amountsOutMin[i];
            bool useMultihop = _useMultihop[i];
            
            if (tokenIn == address(0)) {
                // CELO swap
                if (amountIn > celoRemaining) revert InsufficientAmount();
                celoRemaining -= amountIn;
                
                // Calculate the take rate amount
                (uint256 feeAmount, uint256 swapAmount) = _handleFees(address(0), amountIn, msg.sender);
                
                // Perform the swap
                IV3SwapRouter.ExactInputSingleParams memory params = IV3SwapRouter.ExactInputSingleParams({
                    tokenIn: CELO,
                    tokenOut: CUSD,
                    fee: DEFAULT_FEE_TIER,
                    recipient: msg.sender,
                    amountIn: swapAmount,
                    amountOutMinimum: amountOutMin,
                    sqrtPriceLimitX96: 0
                });
                
                // Execute the swap
                swapRouter.exactInputSingle{value: swapAmount}(params);
                
                emit SwapExecuted(msg.sender, address(0), amountIn, 0, CUSD, feeAmount);
            } else {
                // ERC20 swap
                if (amountIn == 0) continue;
                
                // Transfer tokens from user to contract
                IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
                
                // Calculate the take rate amount
                (uint256 feeAmount, uint256 swapAmount) = _handleFees(tokenIn, amountIn, msg.sender);
                
                // Perform the swap
                _swapTokenForStablecoin(
                    tokenIn,
                    CUSD,
                    swapAmount,
                    amountOutMin,
                    useMultihop
                );
                
                emit SwapExecuted(msg.sender, tokenIn, amountIn, 0, CUSD, feeAmount);
            }
        }
        
        // Calculate total received
        totalReceived = IERC20(CUSD).balanceOf(msg.sender) - initialCUSDBalance;
        
        // Return any unused CELO
        if (celoRemaining > 0) {
            (bool success,) = msg.sender.call{value: celoRemaining}("");
            if (!success) revert TransferFailed();
        }
        
        emit BatchSwapExecuted(msg.sender, length);
        return totalReceived;
    }
    
    /**
     * @notice Updates the fee rate charged on swaps
     * @dev Only callable by owner, with maximum cap
     * @param _newRateBps New fee rate in basis points (1 bp = 0.01%)
     */
    function setTakeRate(uint256 _newRateBps) external onlyOwner {
        if (_newRateBps > MAX_TAKE_RATE_BPS) revert MaxRateExceeded();
        takeRateBps = _newRateBps;
        emit TakeRateUpdated(_newRateBps);
    }
    
    /**
     * @notice Updates the maximum slippage allowed
     * @dev Only callable by owner
     * @param _newSlippageBps New maximum slippage in basis points
     */
    function setMaxSlippage(uint256 _newSlippageBps) external onlyOwner {
        maxSlippageBps = _newSlippageBps;
        emit MaxSlippageUpdated(_newSlippageBps);
    }
    
    /**
     * @notice Sets fee discount for specific address
     * @dev Only callable by owner
     * @param _user User address
     * @param _discountBps Discount in basis points
     */
    function setFeeDiscount(address _user, uint256 _discountBps) external onlyOwner {
        if (_discountBps > takeRateBps) {
            _discountBps = takeRateBps;
        }
        
        feeDiscountsBps[_user] = _discountBps;
        emit FeeDiscountSet(_user, _discountBps);
    }
    
    /**
     * @notice Sets the price oracle address
     * @dev Only callable by owner
     * @param _oracle Oracle address
     */
    function setPriceOracle(address _oracle) external onlyOwner {
        priceOracle = IPriceOracle(_oracle);
        emit PriceOracleSet(_oracle);
    }
    
    /**
     * @notice Toggles price validation
     * @dev Only callable by owner
     * @param _enabled Whether to enable price validation
     */
    function togglePriceValidation(bool _enabled) external onlyOwner {
        priceValidationEnabled = _enabled;
        emit PriceValidationToggled(_enabled);
    }
    
    /**
     * @notice Sets price validation threshold
     * @dev Only callable by owner
     * @param _threshold New threshold
     */
    function setPriceValidationThreshold(uint256 _threshold) external onlyOwner {
        priceValidationThreshold = _threshold;
    }
    
    /**
     * @notice Sets maximum price deviation
     * @dev Only callable by owner
     * @param _maxDeviationBps Maximum deviation in basis points
     */
    function setMaxPriceDeviation(uint256 _maxDeviationBps) external onlyOwner {
        maxPriceDeviationBps = _maxDeviationBps;
    }
    
    /**
     * @notice Pauses contract functions
     * @dev Only callable by owner
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpauses contract functions
     * @dev Only callable by owner
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Allows owner to withdraw collected fees
     * @dev Can withdraw CELO or any ERC20 token that might have been sent to contract
     * @param _token Address of token to withdraw (address(0) for CELO)
     */
    function withdrawFees(address _token) external onlyOwner nonReentrant {
        uint256 feeAmount;
        
        if (_token == address(0)) {
            // Withdraw CELO
            feeAmount = accumulatedFees[address(0)];
            if (feeAmount == 0) revert InsufficientBalance();
            
            // Reset accumulated fee before transfer
            accumulatedFees[address(0)] = 0;
            
            (bool success, ) = msg.sender.call{value: feeAmount}("");
            if (!success) revert TransferFailed();
        } else {
            // Withdraw ERC20 token
            feeAmount = accumulatedFees[_token];
            if (feeAmount == 0) revert InsufficientBalance();
            
            // Reset accumulated fee before transfer
            accumulatedFees[_token] = 0;
            
            // Transfer tokens to owner
            IERC20(_token).safeTransfer(msg.sender, feeAmount);
        }
        
        emit FeesWithdrawn(_token, feeAmount);
    }
    
    /**
     * @notice Function to recover any ERC20 tokens sent to contract by mistake
     * @dev Only callable by owner
     * @param _token Address of token to recover
     * @param _amount Amount to recover
     */
    function recoverERC20(address _token, uint256 _amount) external onlyOwner nonReentrant {
        if (_token == address(0)) revert InvalidAddress();
        IERC20(_token).safeTransfer(msg.sender, _amount);
    }
    
    /**
     * @notice Function to recover CELO sent to contract by mistake
     * @dev Only callable by owner
     * @param _amount Amount to recover
     */
    function recoverCELO(uint256 _amount) external onlyOwner nonReentrant {
        if (_amount == 0 || _amount > address(this).balance - accumulatedFees[address(0)]) {
            revert InsufficientBalance();
        }
        
        (bool success, ) = msg.sender.call{value: _amount}("");
        if (!success) revert TransferFailed();
    }
    
    /**
     * @dev Function to receive CELO
     */
    receive() external payable {}
    
    /**
     * @dev Fallback function
     */
    fallback() external payable {}
}