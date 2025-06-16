export class AllegroMCPError extends Error {
    code;
    statusCode;
    details;
    constructor(message, code, statusCode = 500, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'AllegroMCPError';
    }
}
export class OrderNotFoundError extends AllegroMCPError {
    constructor(orderId) {
        super(`Order ${orderId} not found`, 'ORDER_NOT_FOUND', 404, 'The specified order ID does not exist in the system');
    }
}
export class DisputeNotFoundError extends AllegroMCPError {
    constructor(disputeId) {
        super(`Dispute ${disputeId} not found`, 'DISPUTE_NOT_FOUND', 404, 'The specified dispute ID does not exist in the system');
    }
}
export class ReturnNotFoundError extends AllegroMCPError {
    constructor(returnId) {
        super(`Return ${returnId} not found`, 'RETURN_NOT_FOUND', 404, 'The specified return ID does not exist in the system');
    }
}
export class InvalidParameterError extends AllegroMCPError {
    constructor(parameter, reason) {
        super(`Invalid parameter: ${parameter}`, 'INVALID_PARAMETER', 400, reason);
    }
}
export class MockApiError extends AllegroMCPError {
    constructor(message, originalError) {
        super(`Mock API error: ${message}`, 'MOCK_API_ERROR', 500, originalError?.message);
    }
}
export function handleToolError(error, toolName) {
    if (error instanceof AllegroMCPError) {
        throw error;
    }
    if (error instanceof Error) {
        throw new AllegroMCPError(`Tool ${toolName} failed: ${error.message}`, 'TOOL_EXECUTION_ERROR', 500, error.stack);
    }
    throw new AllegroMCPError(`Tool ${toolName} failed with unknown error`, 'UNKNOWN_ERROR', 500, String(error));
}
//# sourceMappingURL=errors.js.map