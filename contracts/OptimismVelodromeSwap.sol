// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

/**
 * @title OptimismVelodromeSwap
 * @dev Production-ready contract for swapping ETH or any ERC20 token to agEUR (EURA) on Velodrome (Optimism network)
 * Includes security features, take rate functionality, and simplified interface
 */
interface IRouter {
    struct Route {
        address from;
        address to;
        bool stable;
        address factory;
    }
    
    function swapExactETHForTokens(
        uint amountOutMin, 
        Route[] calldata routes,
        address to, 
        uint deadline
    ) external payable returns (uint[] memory amounts);
    
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        Route[] calldata routes,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

contract OptimismVelodromeSwap is ReentrancyGuard, Ownable {
    // Constants
    IRouter public immutable router;
    address public immutable FACTORY_V1 = 0x25CbdDb98b35ab1FF77413456B31EC81A6B6B746; // Velodrome V1 Factory
    address public immutable FACTORY_V2 = 0xF1046053aa5682b4F9a81b5481394DA16BE5FF5a; // Velodrome V2 Factory
    address public immutable AGEUR = 0x9485aca5bbBE1667AD97c7fE7C4531a624C8b1ED; // agEUR on Optimism
    address public constant WETH = 0x4200000000000000000000000000000000000006; // Optimism WETH
    
    // Variables
    bool public useV2Router = true; // Default to using V2 router
    uint256 public takeRateBps = 25; // 0.25% fee by default 
    uint256 public constant MAX_TAKE_RATE_BPS = 100; // Max 1% fee allowed
    
    // Custom error declarations
    error InsufficientAmount();
    error InvalidAddress();
    error InvalidToken();
    error SameTokenSwap();
    error MaxRateExceeded();
    error InsufficientBalance();
    error TransferFailed();
    
    // Events
    event SwapExecuted(address indexed user, address indexed tokenIn, uint256 amountIn, uint256 euraAmount);
    event TakeRateUpdated(uint256 newRateBps);
    event FeesWithdrawn(address token, uint256 amount);
    event RouterVersionToggled(bool useV2);
    
    /**
     * @dev Constructor sets router address and transfers ownership to deployer
     * @param _routerAddress Velodrome Router address on Optimism (V1 or V2)
     * @param _useV2 Whether to use V2 or V1 factory for routes
     */
    constructor(address _routerAddress, bool _useV2) Ownable(msg.sender) {
        if (_routerAddress == address(0)) revert InvalidAddress();
        router = IRouter(_routerAddress);
        useV2Router = _useV2;
    }
    
    /**
     * @notice Swaps ETH for agEUR and sends tokens to user
     * @dev Includes take rate calculation and nonReentrant guard
     * @param _amountOutMin Minimum agEUR to receive
     * @return euraReceived The amount of agEUR received
     */
    function swapETHForEURA(uint256 _amountOutMin) 
        external 
        payable 
        nonReentrant
        returns (uint256 euraReceived) 
    {
        if (msg.value == 0) revert InsufficientAmount();
        
        // Calculate the take rate amount
        uint256 feeAmount = (msg.value * takeRateBps) / 10000;
        uint256 swapAmount = msg.value - feeAmount;
        
        // Create route for ETH to agEUR swap via Velodrome
        IRouter.Route[] memory routes = new IRouter.Route[](1);
        routes[0] = IRouter.Route({
            from: WETH,
            to: AGEUR,
            stable: false,
            factory: useV2Router ? FACTORY_V2 : FACTORY_V1
        });
        
        // Get initial agEUR balance of user to calculate exact received amount
        uint256 initialEuraBalance = IERC20(AGEUR).balanceOf(msg.sender);
        
        // Execute the swap
        router.swapExactETHForTokens{value: swapAmount}(
            _amountOutMin,
            routes,
            msg.sender, // Tokens go directly to user
            block.timestamp + 300 // 5 minute deadline
        );
        
        // Calculate actual agEUR received
        euraReceived = IERC20(AGEUR).balanceOf(msg.sender) - initialEuraBalance;
        
        emit SwapExecuted(msg.sender, address(0), msg.value, euraReceived);
        return euraReceived;
    }
    
    /**
     * @notice Swaps any ERC20 token for agEUR and sends tokens to user
     * @dev Token must be approved by user before calling this function
     * @param _tokenIn Address of token to swap from
     * @param _amountIn Amount of token to swap
     * @param _amountOutMin Minimum agEUR to receive
     * @param _useDirectRoute If true, uses direct tokenIn->agEUR route. If false, routes through WETH
     * @return euraReceived The amount of agEUR received
     */
    function swapTokenForEURA(
        address _tokenIn,
        uint256 _amountIn,
        uint256 _amountOutMin,
        bool _useDirectRoute
    ) 
        external 
        nonReentrant
        returns (uint256 euraReceived) 
    {
        if (_tokenIn == address(0)) revert InvalidAddress();
        if (_amountIn == 0) revert InsufficientAmount();
        if (_tokenIn == AGEUR) revert SameTokenSwap();
        
        // Transfer tokens from user to contract
        TransferHelper.safeTransferFrom(_tokenIn, msg.sender, address(this), _amountIn);
        
        // Calculate the take rate amount
        uint256 feeAmount = (_amountIn * takeRateBps) / 10000;
        uint256 swapAmount = _amountIn - feeAmount;
        
        // Approve router to spend tokens
        TransferHelper.safeApprove(_tokenIn, address(router), swapAmount);
        
        IRouter.Route[] memory routes;
        
        // Get initial agEUR balance of user to calculate exact received amount
        uint256 initialEuraBalance = IERC20(AGEUR).balanceOf(msg.sender);
        
        address factoryAddress = useV2Router ? FACTORY_V2 : FACTORY_V1;
        
        if (_useDirectRoute) {
            // Direct route: tokenIn -> agEUR
            routes = new IRouter.Route[](1);
            routes[0] = IRouter.Route({
                from: _tokenIn,
                to: AGEUR,
                stable: false,
                factory: factoryAddress
            });
        } else {
            // Two-hop route: tokenIn -> WETH -> agEUR
            routes = new IRouter.Route[](2);
            routes[0] = IRouter.Route({
                from: _tokenIn,
                to: WETH,
                stable: false,
                factory: factoryAddress
            });
            routes[1] = IRouter.Route({
                from: WETH,
                to: AGEUR,
                stable: false,
                factory: factoryAddress
            });
        }
        
        // Execute the swap
        router.swapExactTokensForTokens(
            swapAmount,
            _amountOutMin,
            routes,
            msg.sender, // Tokens go directly to user
            block.timestamp + 300 // 5 minute deadline
        );
        
        // Calculate actual agEUR received
        euraReceived = IERC20(AGEUR).balanceOf(msg.sender) - initialEuraBalance;
        
        emit SwapExecuted(msg.sender, _tokenIn, _amountIn, euraReceived);
        return euraReceived;
    }
    
    /**
     * @notice Toggles between Velodrome V1 and V2 router for routes
     * @dev Only owner can call this function
     * @param _useV2 Whether to use V2 factory
     */
    function toggleRouterVersion(bool _useV2) external onlyOwner {
        useV2Router = _useV2;
        emit RouterVersionToggled(_useV2);
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
     * @notice Allows owner to withdraw collected fees
     * @dev Can withdraw ETH or any ERC20 token that might have been sent to contract
     * @param _token Address of token to withdraw (address(0) for ETH)
     */
    function withdrawFees(address _token) external onlyOwner nonReentrant {
        if (_token == address(0)) {
            // Withdraw ETH
            uint256 balance = address(this).balance;
            if (balance == 0) revert InsufficientBalance();
            
            (bool success, ) = owner().call{value: balance}("");
            if (!success) revert TransferFailed();
            
            emit FeesWithdrawn(address(0), balance);
        } else {
            // Withdraw ERC20 tokens
            uint256 balance = IERC20(_token).balanceOf(address(this));
            if (balance == 0) revert InsufficientBalance();
            
            TransferHelper.safeTransfer(_token, owner(), balance);
            
            emit FeesWithdrawn(_token, balance);
        }
    }
    
    /**
     * @notice Rescues tokens accidentally sent to the contract
     * @dev Only owner can call this function
     * @param _token Address of token to rescue
     * @param _amount Amount to rescue
     */
    function rescueTokens(address _token, uint256 _amount) external onlyOwner nonReentrant {
        if (_token == address(0)) {
            // Rescue ETH
            if (_amount > address(this).balance) revert InsufficientBalance();
            (bool success, ) = owner().call{value: _amount}("");
            if (!success) revert TransferFailed();
        } else {
            // Rescue ERC20 tokens
            uint256 balance = IERC20(_token).balanceOf(address(this));
            if (_amount > balance) revert InsufficientBalance();
            TransferHelper.safeTransfer(_token, owner(), _amount);
        }
    }
    
    /**
     * @notice Returns the current fee for a given amount
     * @dev Useful for frontends to display fee information
     * @param _amount Amount to calculate fee for
     * @return fee The calculated fee amount
     */
    function calculateFee(uint256 _amount) external view returns (uint256 fee) {
        return (_amount * takeRateBps) / 10000;
    }
    
    /**
     * @notice Allows contract to receive ETH
     * @dev Required for collecting fees and other operations
     */
    receive() external payable {}
}