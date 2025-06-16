export declare class AllegroMCPError extends Error {
    code: string;
    statusCode: number;
    details?: string;
    constructor(message: string, code: string, statusCode?: number, details?: string);
}
export declare class OrderNotFoundError extends AllegroMCPError {
    constructor(orderId: string);
}
export declare class DisputeNotFoundError extends AllegroMCPError {
    constructor(disputeId: string);
}
export declare class ReturnNotFoundError extends AllegroMCPError {
    constructor(returnId: string);
}
export declare class InvalidParameterError extends AllegroMCPError {
    constructor(parameter: string, reason: string);
}
export declare class MockApiError extends AllegroMCPError {
    constructor(message: string, originalError?: Error);
}
export declare function handleToolError(error: unknown, toolName: string): never;
//# sourceMappingURL=errors.d.ts.map