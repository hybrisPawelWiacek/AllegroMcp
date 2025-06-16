"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockApiError = exports.InvalidParameterError = exports.ReturnNotFoundError = exports.DisputeNotFoundError = exports.OrderNotFoundError = exports.AllegroMCPError = void 0;
exports.handleToolError = handleToolError;
class AllegroMCPError extends Error {
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
exports.AllegroMCPError = AllegroMCPError;
class OrderNotFoundError extends AllegroMCPError {
    constructor(orderId) {
        super(`Order ${orderId} not found`, 'ORDER_NOT_FOUND', 404, 'The specified order ID does not exist in the system');
    }
}
exports.OrderNotFoundError = OrderNotFoundError;
class DisputeNotFoundError extends AllegroMCPError {
    constructor(disputeId) {
        super(`Dispute ${disputeId} not found`, 'DISPUTE_NOT_FOUND', 404, 'The specified dispute ID does not exist in the system');
    }
}
exports.DisputeNotFoundError = DisputeNotFoundError;
class ReturnNotFoundError extends AllegroMCPError {
    constructor(returnId) {
        super(`Return ${returnId} not found`, 'RETURN_NOT_FOUND', 404, 'The specified return ID does not exist in the system');
    }
}
exports.ReturnNotFoundError = ReturnNotFoundError;
class InvalidParameterError extends AllegroMCPError {
    constructor(parameter, reason) {
        super(`Invalid parameter: ${parameter}`, 'INVALID_PARAMETER', 400, reason);
    }
}
exports.InvalidParameterError = InvalidParameterError;
class MockApiError extends AllegroMCPError {
    constructor(message, originalError) {
        super(`Mock API error: ${message}`, 'MOCK_API_ERROR', 500, originalError?.message);
    }
}
exports.MockApiError = MockApiError;
function handleToolError(error, toolName) {
    if (error instanceof AllegroMCPError) {
        throw error;
    }
    if (error instanceof Error) {
        throw new AllegroMCPError(`Tool ${toolName} failed: ${error.message}`, 'TOOL_EXECUTION_ERROR', 500, error.stack);
    }
    throw new AllegroMCPError(`Tool ${toolName} failed with unknown error`, 'UNKNOWN_ERROR', 500, String(error));
}
