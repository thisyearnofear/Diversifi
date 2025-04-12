// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title SimpleCeloSwap
 * @dev Simplified contract for swapping CELO to cUSD on Celo
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

    function exactInputSingle(ExactInputSingleParams calldata params) external returns (uint256 amountOut);
}

contract SimpleCeloSwap is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    // Constants
    IV3SwapRouter public immutable swapRouter;
    address public immutable CUSD = 0x765DE816845861e75A25fCA122bb6898B8B1282a; // cUSD on Celo
    address public immutable CELO = 0x471EcE3750Da237f93B8E339c536989b8978a438; // Native CELO token

    // Default fee tier for Uniswap V3 (0.3%)
    uint24 public constant DEFAULT_FEE_TIER = 3000;

    // Fee rate (0.25%)
    uint256 public feeRate = 25;

    // Events
    event SwapExecuted(address indexed user, uint256 celoAmount, uint256 cusdReceived);
    event FeeWithdrawn(uint256 amount);

    /**
     * @dev Constructor sets swap router address and transfers ownership to deployer
     */
    constructor() Ownable(msg.sender) {
        // Uniswap V3 SwapRouter address on Celo
        address swapRouterAddress = 0x5615CDAb10dc425a742d643d949a7F474C01abc4;
        require(swapRouterAddress != address(0), "Invalid router address");
        swapRouter = IV3SwapRouter(swapRouterAddress);
    }

    /**
     * @notice Swaps CELO for cUSD with minimal validation
     * @dev CELO is an ERC20 token on Celo, not a native asset
     * @return cusdReceived The amount of cUSD received
     */
    function swapCELOForCUSD(uint256 celoAmount)
        external
        nonReentrant
        returns (uint256 cusdReceived)
    {
        require(celoAmount > 0, "Must send CELO");

        // Calculate fee (0.25%)
        uint256 feeAmount = celoAmount.mul(feeRate).div(10000);
        uint256 swapAmount = celoAmount.sub(feeAmount);

        // Get initial cUSD balance
        uint256 initialBalance = IERC20(CUSD).balanceOf(msg.sender);

        // Transfer CELO tokens from sender to this contract
        // Note: On Celo, the native asset is already an ERC20 token
        bool transferSuccess = IERC20(CELO).transferFrom(msg.sender, address(this), celoAmount);
        require(transferSuccess, "CELO transfer failed");

        // Keep the fee in the contract
        uint256 contractBalanceBefore = IERC20(CELO).balanceOf(address(this));

        // Approve router to spend CELO tokens
        IERC20(CELO).approve(address(swapRouter), swapAmount);

        // Set extremely low minAmountOut to ensure transaction success
        uint256 minAmountOut = 1; // Absolute minimum possible

        try swapRouter.exactInputSingle(
            IV3SwapRouter.ExactInputSingleParams({
                tokenIn: CELO,
                tokenOut: CUSD,
                fee: DEFAULT_FEE_TIER,
                recipient: msg.sender,
                amountIn: swapAmount,
                amountOutMinimum: minAmountOut,
                sqrtPriceLimitX96: 0
            })
        ) {
            // Calculate actual cUSD received
            cusdReceived = IERC20(CUSD).balanceOf(msg.sender).sub(initialBalance);
            emit SwapExecuted(msg.sender, celoAmount, cusdReceived);
            return cusdReceived;
        } catch {
            // If swap fails, refund the user (minus fee)
            uint256 refundAmount = IERC20(CELO).balanceOf(address(this)).sub(contractBalanceBefore.sub(swapAmount));
            bool refundSuccess = IERC20(CELO).transfer(msg.sender, refundAmount);
            require(refundSuccess, "Refund failed");
            return 0;
        }
    }

    /**
     * @notice Allows owner to withdraw collected fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = IERC20(CELO).balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");

        bool success = IERC20(CELO).transfer(owner(), balance);
        require(success, "Withdrawal failed");

        emit FeeWithdrawn(balance);
    }

    /**
     * @notice Updates the fee rate
     * @param _newFeeRate New fee rate in basis points (1 bp = 0.01%)
     */
    function setFeeRate(uint256 _newFeeRate) external onlyOwner {
        require(_newFeeRate <= 100, "Fee rate too high"); // Max 1%
        feeRate = _newFeeRate;
    }

    /**
     * @notice Returns the current fee for a given amount
     * @param _amount Amount to calculate fee for
     * @return fee The calculated fee amount
     */
    function calculateFee(uint256 _amount) external view returns (uint256) {
        return _amount.mul(feeRate).div(10000);
    }

    /**
     * @notice Rescue any ERC20 tokens accidentally sent to this contract
     * @param token Address of the token to rescue
     */
    function rescueTokens(address token) external onlyOwner {
        require(token != CELO, "Use withdrawFees for CELO");
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No tokens to rescue");

        IERC20(token).safeTransfer(owner(), balance);
    }
}
