// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title PolygonAllbridgeSwap
 * @dev Contract for swapping MATIC to USDT on Polygon using Allbridge Core
 * Includes platform fee functionality and integrates Allbridge Core's liquidity pool and messaging protocols.
 */
contract PolygonAllbridgeSwap is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Constants
    address public immutable ALLBRIDGE_CORE = 0x7775d63836987f444E2F14AA0fA2602204D7D3E0; // Allbridge Core contract on Polygon
    address public immutable USDT = 0xc2132D05D31c914a87C6611C10748AEb04B58e8F; // USDT token on Polygon
    address public immutable USDT_POOL = 0x0394c4f17738A10096510832beaB89a9DD090791; // USDT liquidity pool on Polygon

    // Platform fee variables
    uint256 public takeRateBps = 25; // Default fee: 0.25%
    uint256 public constant MAX_TAKE_RATE_BPS = 100; // Maximum fee: 1%

    // Events
    event SwapInitiated(address indexed user, uint256 amountIn, uint256 amountOutMin);
    event SwapCompleted(address indexed user, uint256 amountIn, uint256 amountOut);
    event FeeCollected(address indexed owner, uint256 feeAmount);
    event TakeRateUpdated(uint256 newRate);

    constructor() Ownable(msg.sender) {
        // No need for the _transferOwnership call anymore
    }

    /**
     * @notice Swaps MATIC for USDT using Allbridge Core and sends tokens to the user.
     * @param _amountOutMin Minimum amount of USDT expected by the user.
     */
    function swapMATICForUSDT(uint256 _amountOutMin)
        external
        payable
        nonReentrant
        returns (uint256 usdtReceived)
    {
        if (msg.value == 0) revert("Insufficient MATIC sent");

        // Calculate platform fee and swap amount
        uint256 feeAmount = (msg.value * takeRateBps) / 10000;
        uint256 swapAmount = msg.value - feeAmount;

        // Get initial USDT balance of the user
        uint256 initialUSDTBalance = IERC20(USDT).balanceOf(msg.sender);

        // Emit event for swap initiation
        emit SwapInitiated(msg.sender, swapAmount, _amountOutMin);

        // Interact with Allbridge Core to initiate the swap
        (bool success, ) = ALLBRIDGE_CORE.call{value: swapAmount}(
            abi.encodeWithSignature(
                "swap(address,uint256,address,uint256)",
                USDT_POOL,
                swapAmount,
                msg.sender,
                _amountOutMin
            )
        );
        if (!success) revert("Swap failed");

        // Calculate USDT received by checking the difference in user's balance
        uint256 newUSDTBalance = IERC20(USDT).balanceOf(msg.sender);
        usdtReceived = newUSDTBalance - initialUSDTBalance;

        // Emit event for swap completion
        emit SwapCompleted(msg.sender, swapAmount, usdtReceived);

        // Transfer platform fee to owner
        if (feeAmount > 0) {
            (bool feeTransferSuccess, ) = payable(owner()).call{value: feeAmount}("");
            if (!feeTransferSuccess) revert("Fee transfer failed");
            emit FeeCollected(owner(), feeAmount);
        }

        return usdtReceived;
    }

    /**
     * @notice Updates the platform's take rate.
     * @param _newRate New take rate in basis points.
     */
    function updateTakeRate(uint256 _newRate) external onlyOwner {
        if (_newRate > MAX_TAKE_RATE_BPS) revert("Take rate exceeds maximum limit");
        takeRateBps = _newRate;
        emit TakeRateUpdated(_newRate);
    }

    /**
     * @notice Allows the owner to withdraw any accidentally sent ERC20 tokens
     * @param _token Address of the token to withdraw
     */
    function withdrawERC20(address _token) external onlyOwner {
        uint256 balance = IERC20(_token).balanceOf(address(this));
        if (balance > 0) {
            IERC20(_token).safeTransfer(owner(), balance);
        }
    }

    /**
     * @notice Allows the owner to withdraw any accidentally sent ETH
     */
    function withdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            (bool success, ) = payable(owner()).call{value: balance}("");
            require(success, "ETH withdrawal failed");
        }
    }
}