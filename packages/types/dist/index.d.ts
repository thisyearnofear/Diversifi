import { Message as Message$1 } from 'ai';
import { Address } from 'viem';

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: number;
}
/**
 * Paginated response
 */
interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
/**
 * Chat message extending AI SDK message
 */
interface Message extends Message$1 {
    userActions?: UserAction[];
}
/**
 * User action tracking
 */
interface UserAction {
    type: string;
    timestamp: number;
    data?: Record<string, unknown>;
}
/**
 * Request/Response for SIWE (Sign in With Ethereum)
 */
interface SiweChallenge {
    nonce: string;
    message: string;
}
interface SiweVerifyRequest {
    message: string;
    signature: string;
}
interface SiweVerifyResponse {
    address: string;
    chainId: number;
}

/**
 * Supported blockchain networks
 */
type ChainId = 8453 | 84532 | 42220;
interface ChainConfig {
    id: ChainId;
    name: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    rpcUrls: {
        default: {
            http: string[];
        };
        public: {
            http: string[];
        };
    };
}
/**
 * Wallet connection state
 */
type WalletStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
interface WalletAccount {
    address: Address;
    isConnected: boolean;
    isConnecting: boolean;
    status: WalletStatus;
    chainId?: ChainId;
}
/**
 * Swap data
 */
interface SwapQuote {
    inputToken: Address;
    outputToken: Address;
    inputAmount: string;
    outputAmount: string;
    slippagePercentage: number;
    priceImpact: number;
}
interface SwapTransaction {
    to: Address;
    data: `0x${string}`;
    value?: string;
    gasEstimate?: string;
}
/**
 * Token data
 */
interface Token {
    address: Address;
    symbol: string;
    name: string;
    decimals: number;
    logoUrl?: string;
    chainId: ChainId;
}
/**
 * Transaction state
 */
type TransactionStatus = 'idle' | 'pending' | 'success' | 'error';
interface TransactionState {
    hash?: `0x${string}`;
    status: TransactionStatus;
    error?: string;
    blockNumber?: number;
}

/**
 * User profile
 */
interface User {
    id: string;
    address: Address;
    email?: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Region/Market data
 */
interface Region {
    code: string;
    name: string;
    country: string;
    currency: string;
    timezone: string;
}
/**
 * Currency performance data
 */
interface CurrencyPerformance {
    symbol: string;
    name: string;
    currentPrice: number;
    change24h: number;
    changePercent24h: number;
    marketCap?: number;
    volume24h?: number;
    timestamp: number;
}
/**
 * Commerce/Commerce related types
 */
interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    image?: string;
}
interface Charge {
    id: string;
    productId: string;
    amount: number;
    currency: string;
    status: 'pending' | 'confirmed' | 'failed' | 'resolved';
    chargeCode?: string;
    createdAt: Date;
}
/**
 * Reward system
 */
interface Reward {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    reason: string;
    claimedAt?: Date;
    createdAt: Date;
}
/**
 * Voting system
 */
interface Vote {
    id: string;
    userId: string;
    proposalId: string;
    choice: number;
    weight: number;
    timestamp: Date;
}
interface Proposal {
    id: string;
    title: string;
    description: string;
    options: string[];
    voteCount: number[];
    status: 'active' | 'closed' | 'passed' | 'failed';
    createdAt: Date;
    endsAt: Date;
}

/**
 * UI Component Props and styling types
 */
/**
 * Common button variants
 */
type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';
/**
 * Common states
 */
type LoadingState = 'idle' | 'loading' | 'success' | 'error';
/**
 * Chart data
 */
interface ChartDataPoint {
    timestamp: number;
    value: number;
    label?: string;
}
/**
 * Toast notification
 */
interface Toast {
    id: string;
    title: string;
    description?: string;
    type: 'default' | 'success' | 'error' | 'info';
    duration?: number;
}

export type { ApiResponse, ButtonSize, ButtonVariant, ChainConfig, ChainId, Charge, ChartDataPoint, CurrencyPerformance, LoadingState, Message, PaginatedResponse, Product, Proposal, Region, Reward, SiweChallenge, SiweVerifyRequest, SiweVerifyResponse, SwapQuote, SwapTransaction, Toast, Token, TransactionState, TransactionStatus, User, UserAction, Vote, WalletAccount, WalletStatus };
