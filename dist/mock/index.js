import { mockOrderStore } from './orders.js';
import { mockDisputeStore } from './disputes.js';
import { mockReturnStore } from './returns.js';
import { logger } from '../utils/logger.js';
class MockApiService {
    static instance;
    delayMs;
    errorRate;
    constructor() {
        this.delayMs = parseInt(process.env.MOCK_DELAY_MS || '200');
        this.errorRate = parseFloat(process.env.MOCK_ERROR_RATE || '0.05');
    }
    static getInstance() {
        if (!MockApiService.instance) {
            MockApiService.instance = new MockApiService();
        }
        return MockApiService.instance;
    }
    async simulateApiCall(operation) {
        // Simulate network delay
        if (this.delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, this.delayMs));
        }
        // Simulate random API errors
        if (Math.random() < this.errorRate) {
            throw new Error('Simulated API error - please retry');
        }
        try {
            return await operation();
        }
        catch (error) {
            logger.error('Mock API operation failed:', error);
            throw error;
        }
    }
    get orders() {
        return mockOrderStore;
    }
    get disputes() {
        return mockDisputeStore;
    }
    get returns() {
        return mockReturnStore;
    }
}
export { MockApiService };
export const mockApi = MockApiService.getInstance();
export { mockOrderStore, mockDisputeStore, mockReturnStore };
//# sourceMappingURL=index.js.map