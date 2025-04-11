// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

/**
 * @title BaseAerodromeSwap
 * @dev Production-ready contract for swapping ETH or any ERC20 token to USDBC on Aerodrome (Base network)
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

contract BaseAerodromeSwap is ReentrancyGuard, Ownable {
    // Constants
    IRouter public immutable router;
    address public immutable AERODROME_FACTORY = 0x420DD381b31aEf6683db6B902084cB0FFECe40Da;
    address public immutable USDBC = 0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA;
    address public constant WETH = 0x4200000000000000000000000000000000000006; // Base WETH
    
    // Variables for take rate
    uint256 public takeRateBps = 25; // 0.25% fee by default 
    uint256 public constant MAX_TAKE_RATE_BPS = 100; // Max 1% fee allowed
    
    // Custom error declarations - more gas efficient than revert strings
    error InsufficientAmount();
    error InvalidAddress();
    error InvalidToken();
    error SameTokenSwap();
    error MaxRateExceeded();
    error InsufficientBalance();
    error TransferFailed();
    
    // Events
    event SwapExecuted(address indexed user, address indexed tokenIn, uint256 amountIn, uint256 usdcAmount);
    event TakeRateUpdated(uint256 newRateBps);
    event FeesWithdrawn(address token, uint256 amount);
    
    /**
     * @dev Constructor sets router address and transfers ownership to deployer
     * @param _routerAddress Aerodrome Router address on Base
     */
    constructor(address _routerAddress) Ownable(msg.sender) {
        if (_routerAddress == address(0)) revert InvalidAddress();
        router = IRouter(_routerAddress);
    }
    
    /**
     * @notice Swaps ETH for USDBC and sends tokens to user
     * @dev Includes take rate calculation and nonReentrant guard
     * @param _amountOutMin Minimum USDBC to receive
     * @return usdcReceived The amount of USDBC received
     */
    function swapETHForUSDBC(uint256 _amountOutMin) 
        external 
        payable 
        nonReentrant
        returns (uint256 usdcReceived) 
    {
        if (msg.value == 0) revert InsufficientAmount();
        
        // Calculate the take rate amount
        uint256 feeAmount = (msg.value * takeRateBps) / 10000;
        uint256 swapAmount = msg.value - feeAmount;
        
        // Create route for ETH to USDBC swap via Aerodrome
        IRouter.Route[] memory routes = new IRouter.Route[](1);
        routes[0] = IRouter.Route({
            from: WETH,
            to: USDBC,
            stable: false,
            factory: AERODROME_FACTORY
        });
        
        // Get initial USDBC balance of user to calculate exact received amount
        uint256 initialUsdcBalance = IERC20(USDBC).balanceOf(msg.sender);
        
        // Execute the swap
        router.swapExactETHForTokens{value: swapAmount}(
            _amountOutMin,
            routes,
            msg.sender, // Tokens go directly to user
            block.timestamp + 300 // 5 minute deadline
        );
        
        // Calculate actual USDBC received
        usdcReceived = IERC20(USDBC).balanceOf(msg.sender) - initialUsdcBalance;
        
        emit SwapExecuted(msg.sender, address(0), msg.value, usdcReceived);
        return usdcReceived;
    }
    
    /**
     * @notice Swaps any ERC20 token for USDBC and sends tokens to user
     * @dev Token must be approved by user before calling this function
     * @param _tokenIn Address of token to swap from
     * @param _amountIn Amount of token to swap
     * @param _amountOutMin Minimum USDBC to receive
     * @param _useDirectRoute If true, uses direct tokenIn->USDBC route. If false, routes through WETH
     * @return usdcReceived The amount of USDBC received
     */
    function swapTokenForUSDBC(
        address _tokenIn,
        uint256 _amountIn,
        uint256 _amountOutMin,
        bool _useDirectRoute
    ) 
        external 
        nonReentrant
        returns (uint256 usdcReceived) 
    {
        if (_tokenIn == address(0)) revert InvalidAddress();
        if (_amountIn == 0) revert InsufficientAmount();
        if (_tokenIn == USDBC) revert SameTokenSwap();
        
        // Transfer tokens from user to contract
        TransferHelper.safeTransferFrom(_tokenIn, msg.sender, address(this), _amountIn);
        
        // Calculate the take rate amount
        uint256 feeAmount = (_amountIn * takeRateBps) / 10000;
        uint256 swapAmount = _amountIn - feeAmount;
        
        // Approve router to spend tokens
        TransferHelper.safeApprove(_tokenIn, address(router), swapAmount);
        
        IRouter.Route[] memory routes;
        
        // Get initial USDBC balance of user to calculate exact received amount
        uint256 initialUsdcBalance = IERC20(USDBC).balanceOf(msg.sender);
        
        if (_useDirectRoute) {
            // Direct route: tokenIn -> USDBC
            routes = new IRouter.Route[](1);
            routes[0] = IRouter.Route({
                from: _tokenIn,
                to: USDBC,
                stable: false,
                factory: AERODROME_FACTORY
            });
        } else {
            // Two-hop route: tokenIn -> WETH -> USDBC
            routes = new IRouter.Route[](2);
            routes[0] = IRouter.Route({
                from: _tokenIn,
                to: WETH,
                stable: false,
                factory: AERODROME_FACTORY
            });
            routes[1] = IRouter.Route({
                from: WETH,
                to: USDBC,
                stable: false,
                factory: AERODROME_FACTORY
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
        
        // Calculate actual USDBC received
        usdcReceived = IERC20(USDBC).balanceOf(msg.sender) - initialUsdcBalance;
        
        emit SwapExecuted(msg.sender, _tokenIn, _amountIn, usdcReceived);
        return usdcReceived;
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