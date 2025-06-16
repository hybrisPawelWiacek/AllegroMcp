import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.USE_MOCK_API = 'true';
process.env.MOCK_DELAY_MS = '0'; // No delay in tests
process.env.MOCK_ERROR_RATE = '0'; // No random errors in tests
process.env.LOG_LEVEL = 'error'; // Minimize log output during tests

// Global test setup
beforeAll(async () => {
  // Global setup before all tests
  console.log('🧪 Starting AllegroMCP test suite...');
});

afterAll(async () => {
  // Global cleanup after all tests
  console.log('✅ AllegroMCP test suite completed');
});

beforeEach(async () => {
  // Setup before each test
  // Reset any global state if needed
});

afterEach(async () => {
  // Cleanup after each test
  // Clear any test data if needed
});

// Test utilities
export const testUtils = {
  /**
   * Generate a test UUID
   */
  generateTestId: (): string => {
    return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Create a mock progress reporter for testing
   */
  createMockProgressReporter: () => {
    return {
      reportProgress: async ({ progress, total }: { progress: number; total: number }) => {
        // Mock implementation - just validate parameters
        if (progress < 0 || progress > total) {
          throw new Error(`Invalid progress: ${progress}/${total}`);
        }
      }
    };
  },

  /**
   * Create mock tool execution context
   */
  createMockExecutionContext: () => {
    return {
      session: {
        id: testUtils.generateTestId()
      },
      reportProgress: testUtils.createMockProgressReporter().reportProgress
    };
  },

  /**
   * Wait for a specified amount of time
   */
  wait: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Validate UUID format
   */
  isValidUUID: (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  /**
   * Validate Polish postal code format
   */
  isValidPolishPostalCode: (code: string): boolean => {
    const postCodeRegex = /^\d{2}-\d{3}$/;
    return postCodeRegex.test(code);
  },

  /**
   * Validate PLN currency format
   */
  isValidPLNAmount: (amount: string): boolean => {
    const amountRegex = /^\d+\.\d{2}$/;
    return amountRegex.test(amount);
  },

  /**
   * Extract order ID from mock data response
   */
  extractOrderId: (response: string): string | null => {
    const match = response.match(/Order ID:\s*([a-f0-9-]+)/);
    return match ? match[1] : null;
  },

  /**
   * Extract dispute ID from mock data response
   */
  extractDisputeId: (response: string): string | null => {
    const match = response.match(/Dispute ID:\s*([a-f0-9-]+)/);
    return match ? match[1] : null;
  },

  /**
   * Count occurrences of a string in text
   */
  countOccurrences: (text: string, substring: string): number => {
    return (text.match(new RegExp(substring, 'g')) || []).length;
  },

  /**
   * Validate that response contains expected Polish terms
   */
  validatePolishContent: (response: string): boolean => {
    const polishIndicators = [
      'PLN', 'Warszawa', 'Kraków', 'ul.', 'Witam', 'Dziękuję', 
      'zamówieni', 'produkt', 'dostaw', 'zwrot'
    ];
    return polishIndicators.some(indicator => response.includes(indicator));
  },

  /**
   * Mock successful API response
   */
  mockApiSuccess: <T>(data: T): Promise<T> => {
    return Promise.resolve(data);
  },

  /**
   * Mock API error
   */
  mockApiError: (message: string): Promise<never> => {
    return Promise.reject(new Error(message));
  }
};

// Export commonly used test data
export const testData = {
  validOrderId: 'test-order-12345678-1234-4567-8901-123456789012',
  validDisputeId: 'test-dispute-12345678-1234-4567-8901-123456789012',
  validReturnId: 'test-return-12345678-1234-4567-8901-123456789012',
  validPaymentId: 'test-payment-12345678-1234-4567-8901-123456789012',
  validLineItemId: 'test-lineitem-12345678-1234-4567-8901-123456789012',
  
  samplePolishAddress: {
    street: 'ul. Marszałkowska 123',
    city: 'Warszawa',
    postCode: '00-001',
    countryCode: 'PL' as const
  },

  sampleBuyer: {
    id: 'test-buyer-id',
    email: 'test.buyer@example.pl',
    login: 'test.buyer',
    firstName: 'Jan',
    lastName: 'Kowalski'
  },

  sampleLineItem: {
    id: 'test-lineitem-id',
    offer: {
      id: 'test-offer-id',
      name: 'Test Product Name',
      isAllegroStandardProgram: true
    },
    quantity: 1,
    price: {
      amount: '99.99',
      currency: 'PLN' as const
    }
  }
};

// Global error handler for unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
