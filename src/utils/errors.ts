export class AllegroMCPError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: string
  ) {
    super(message);
    this.name = 'AllegroMCPError';
  }
}

export class OrderNotFoundError extends AllegroMCPError {
  constructor(orderId: string) {
    super(
      `Order ${orderId} not found`,
      'ORDER_NOT_FOUND',
      404,
      'The specified order ID does not exist in the system'
    );
  }
}

export class DisputeNotFoundError extends AllegroMCPError {
  constructor(disputeId: string) {
    super(
      `Dispute ${disputeId} not found`,
      'DISPUTE_NOT_FOUND',
      404,
      'The specified dispute ID does not exist in the system'
    );
  }
}

export class ReturnNotFoundError extends AllegroMCPError {
  constructor(returnId: string) {
    super(
      `Return ${returnId} not found`,
      'RETURN_NOT_FOUND',
      404,
      'The specified return ID does not exist in the system'
    );
  }
}

export class InvalidParameterError extends AllegroMCPError {
  constructor(parameter: string, reason: string) {
    super(
      `Invalid parameter: ${parameter}`,
      'INVALID_PARAMETER',
      400,
      reason
    );
  }
}

export class MockApiError extends AllegroMCPError {
  constructor(message: string, originalError?: Error) {
    super(
      `Mock API error: ${message}`,
      'MOCK_API_ERROR',
      500,
      originalError?.message
    );
  }
}

export function handleToolError(error: unknown, toolName: string): never {
  if (error instanceof AllegroMCPError) {
    throw error;
  }
  
  if (error instanceof Error) {
    throw new AllegroMCPError(
      `Tool ${toolName} failed: ${error.message}`,
      'TOOL_EXECUTION_ERROR',
      500,
      error.stack
    );
  }
  
  throw new AllegroMCPError(
    `Tool ${toolName} failed with unknown error`,
    'UNKNOWN_ERROR',
    500,
    String(error)
  );
}
