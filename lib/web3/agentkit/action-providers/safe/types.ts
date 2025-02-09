type CreateSafeReturnType = {
    safeAddress: string;
    transactionHash: string;
    threshold: number;
    owners: string[]
} | {
    error: Error;
};