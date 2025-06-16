"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockReturnStore = exports.mockDisputeStore = exports.mockOrderStore = exports.mockApi = exports.MockApiService = void 0;
const orders_js_1 = require("./orders.js");
Object.defineProperty(exports, "mockOrderStore", { enumerable: true, get: function () { return orders_js_1.mockOrderStore; } });
const disputes_js_1 = require("./disputes.js");
Object.defineProperty(exports, "mockDisputeStore", { enumerable: true, get: function () { return disputes_js_1.mockDisputeStore; } });
const returns_js_1 = require("./returns.js");
Object.defineProperty(exports, "mockReturnStore", { enumerable: true, get: function () { return returns_js_1.mockReturnStore; } });
const logger_js_1 = require("../utils/logger.js");
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
            logger_js_1.logger.error('Mock API operation failed:', error);
            throw error;
        }
    }
    get orders() {
        return orders_js_1.mockOrderStore;
    }
    get disputes() {
        return disputes_js_1.mockDisputeStore;
    }
    get returns() {
        return returns_js_1.mockReturnStore;
    }
}
exports.MockApiService = MockApiService;
exports.mockApi = MockApiService.getInstance();
