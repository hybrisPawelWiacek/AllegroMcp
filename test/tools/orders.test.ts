import { describe, it, expect, beforeEach } from 'vitest';
import { mockApi } from '../../src/mock/index.js';
import { 
  monitorOrderEventsTool,
  getOrderDetailsTool,
  updateOrderStatusTool,
  addTrackingNumberTool
} from '../../src/tools/orders/index.js';
import { testUtils, testData } from '../setup.js';

describe('Order Management Tools', () => {
  const mockContext = testUtils.createMockExecutionContext();

  beforeEach(() => {
    // Reset any mock state between tests
  });

  describe('monitor_order_events', () => {
    it('should retrieve order events successfully', async () => {
      const params = {
        limit: 10,
        from_event_id: undefined,
        event_type: undefined
      };

      const result = await monitorOrderEventsTool.execute(params, mockContext);

      expect(typeof result).toBe('string');
      expect(result).toContain('Order Event Monitor');
      expect(result).toContain('events') || expect(result).toContain('No new events');
    });

    it('should filter events by type', async () => {
      const params = {
        limit: 10,
        from_event_id: undefined,
        event_type: 'ORDER_STATUS_CHANGED' as const
      };

      const result = await monitorOrderEventsTool.execute(params, mockContext);

      expect(typeof result).toBe('string');
      expect(result).toContain('Order Event Monitor');
      if (result.includes('Found')) {
        expect(result).toContain('ORDER_STATUS_CHANGED');
      }
    });

    it('should handle pagination with from_event_id', async () => {
      const params = {
        limit: 5,
        from_event_id: 'test-event-id',
        event_type: undefined
      };

      const result = await monitorOrderEventsTool.execute(params, mockContext);

      expect(typeof result).toBe('string');
      expect(result).toContain('Order Event Monitor');
      expect(result).toContain('test-event-id') || expect(result).toContain('No new events');
    });

    it('should validate limit parameter', async () => {
      const params = {
        limit: 0, // Invalid limit
        from_event_id: undefined,
        event_type: undefined
      };

      await expect(
        monitorOrderEventsTool.parameters.parse(params)
      ).rejects.toThrow();
    });
  });

  describe('get_order_details', () => {
    it('should retrieve order details successfully', async () => {
      const params = {
        order_id: testData.validOrderId
      };

      const result = await getOrderDetailsTool.execute(params, mockContext);

      expect(typeof result).toBe('string');
      expect(result).toContain('Order Details');
      expect(result).toContain('Order ID:');
      expect(result).toContain('PLN');
      expect(testUtils.isValidUUID(testUtils.extractOrderId(result) || '')).toBe(true);
    });

    it('should contain Polish e-commerce data', async () => {
      const params = {
        order_id: testData.validOrderId
      };

      const result = await getOrderDetailsTool.execute(params, mockContext);

      expect(testUtils.validatePolishContent(result)).toBe(true);
      expect(result).toMatch(/\d{2}-\d{3}/); // Polish postal code format
    });

    it('should include buyer information', async () => {
      const params = {
        order_id: testData.validOrderId
      };

      const result = await getOrderDetailsTool.execute(params, mockContext);

      expect(result).toContain('Buyer Information');
      expect(result).toContain('Name:');
      expect(result).toContain('Email:');
      expect(result).toContain('@');
    });

    it('should include order items', async () => {
      const params = {
        order_id: testData.validOrderId
      };

      const result = await getOrderDetailsTool.execute(params, mockContext);

      expect(result).toContain('Order Items');
      expect(result).toContain('Quantity:');
      expect(result).toContain('Price:');
      expect(result).toContain('PLN');
    });

    it('should validate order_id parameter', async () => {
      const params = {
        order_id: '' // Empty order ID
      };

      await expect(
        getOrderDetailsTool.parameters.parse(params)
      ).rejects.toThrow();
    });

    it('should handle non-existent order gracefully', async () => {
      const params = {
        order_id: 'non-existent-order-id'
      };

      // Should generate a new mock order rather than throw error
      const result = await getOrderDetailsTool.execute(params, mockContext);
      expect(typeof result).toBe('string');
      expect(result).toContain('Order Details');
    });
  });

  describe('update_order_status', () => {
    it('should update order status successfully', async () => {
      const params = {
        order_id: testData.validOrderId,
        status: 'PROCESSING' as const,
        note: 'Test status update'
      };

      const result = await updateOrderStatusTool.execute(params, mockContext);

      expect(typeof result).toBe('string');
      expect(result).toContain('Order Status Updated');
      expect(result).toContain('PROCESSING');
      expect(result).toContain('Test status update');
    });

    it('should handle different status transitions', async () => {
      const statuses: Array<'NEW' | 'PROCESSING' | 'READY_FOR_SHIPMENT' | 'SENT' | 'DELIVERED' | 'CANCELLED'> = [
        'NEW', 'PROCESSING', 'READY_FOR_SHIPMENT', 'SENT', 'DELIVERED', 'CANCELLED'
      ];

      for (const status of statuses) {
        const params = {
          order_id: testUtils.generateTestId(),
          status,
          note: `Testing ${status} status`
        };

        const result = await updateOrderStatusTool.execute(params, mockContext);

        expect(result).toContain('Order Status Updated');
        expect(result).toContain(status);
      }
    });

    it('should provide customer impact information', async () => {
      const params = {
        order_id: testData.validOrderId,
        status: 'SENT' as const
      };

      const result = await updateOrderStatusTool.execute(params, mockContext);

      expect(result).toContain('Customer Impact');
      expect(result).toContain('tracking information');
    });

    it('should validate status parameter', async () => {
      const params = {
        order_id: testData.validOrderId,
        status: 'INVALID_STATUS' as any
      };

      await expect(
        updateOrderStatusTool.parameters.parse(params)
      ).rejects.toThrow();
    });

    it('should require order_id', async () => {
      const params = {
        order_id: '',
        status: 'PROCESSING' as const
      };

      await expect(
        updateOrderStatusTool.parameters.parse(params)
      ).rejects.toThrow();
    });
  });

  describe('add_tracking_number', () => {
    it('should add tracking number successfully', async () => {
      const params = {
        order_id: testData.validOrderId,
        carrier_name: 'InPost',
        tracking_number: 'PL123456789',
        line_item_ids: [testData.validLineItemId],
        estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      };

      const result = await addTrackingNumberTool.execute(params, mockContext);

      expect(typeof result).toBe('string');
      expect(result).toContain('Tracking Information Added');
      expect(result).toContain('InPost');
      expect(result).toContain('PL123456789');
    });

    it('should support different Polish carriers', async () => {
      const carriers = ['InPost', 'DPD', 'DHL', 'UPS', 'Poczta Polska', 'GLS'];

      for (const carrier of carriers) {
        const params = {
          order_id: testUtils.generateTestId(),
          carrier_name: carrier,
          tracking_number: `${carrier}123456789`,
          line_item_ids: [testData.validLineItemId]
        };

        const result = await addTrackingNumberTool.execute(params, mockContext);

        expect(result).toContain('Tracking Information Added');
        expect(result).toContain(carrier);
      }
    });

    it('should generate tracking URLs for Polish carriers', async () => {
      const params = {
        order_id: testData.validOrderId,
        carrier_name: 'InPost',
        tracking_number: 'PL123456789PL',
        line_item_ids: [testData.validLineItemId]
      };

      const result = await addTrackingNumberTool.execute(params, mockContext);

      expect(result).toContain('Tracking URL');
      expect(result).toContain('inpost.pl') || expect(result).toContain('tracking.example.com');
    });

    it('should validate line_item_ids parameter', async () => {
      const params = {
        order_id: testData.validOrderId,
        carrier_name: 'InPost',
        tracking_number: 'PL123456789',
        line_item_ids: [] // Empty array
      };

      await expect(
        addTrackingNumberTool.parameters.parse(params)
      ).rejects.toThrow();
    });

    it('should require all mandatory parameters', async () => {
      const params = {
        order_id: '',
        carrier_name: '',
        tracking_number: '',
        line_item_ids: []
      };

      await expect(
        addTrackingNumberTool.parameters.parse(params)
      ).rejects.toThrow();
    });

    it('should update order status to SENT', async () => {
      const params = {
        order_id: testData.validOrderId,
        carrier_name: 'DPD',
        tracking_number: 'DPD987654321',
        line_item_ids: [testData.validLineItemId]
      };

      const result = await addTrackingNumberTool.execute(params, mockContext);

      expect(result).toContain('Order status automatically updated to "SENT"');
    });

    it('should provide customer experience information', async () => {
      const params = {
        order_id: testData.validOrderId,
        carrier_name: 'DHL',
        tracking_number: 'DHL555666777',
        line_item_ids: [testData.validLineItemId]
      };

      const result = await addTrackingNumberTool.execute(params, mockContext);

      expect(result).toContain('Customer Experience');
      expect(result).toContain('track package');
      expect(result).toContain('delivery notifications');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete order workflow', async () => {
      const orderId = testUtils.generateTestId();
      
      // 1. Get order details
      const detailsResult = await getOrderDetailsTool.execute(
        { order_id: orderId },
        mockContext
      );
      expect(detailsResult).toContain('Order Details');

      // 2. Update status to processing
      const statusResult = await updateOrderStatusTool.execute(
        { order_id: orderId, status: 'PROCESSING' },
        mockContext
      );
      expect(statusResult).toContain('PROCESSING');

      // 3. Add tracking number
      const trackingResult = await addTrackingNumberTool.execute(
        {
          order_id: orderId,
          carrier_name: 'InPost',
          tracking_number: 'PL999888777',
          line_item_ids: [testData.validLineItemId]
        },
        mockContext
      );
      expect(trackingResult).toContain('Tracking Information Added');
    });

    it('should maintain data consistency across operations', async () => {
      const orderId = testUtils.generateTestId();
      
      // Get initial order details
      const initialDetails = await getOrderDetailsTool.execute(
        { order_id: orderId },
        mockContext
      );
      
      const initialOrderId = testUtils.extractOrderId(initialDetails);
      expect(initialOrderId).toBe(orderId);

      // Update status and verify consistency
      await updateOrderStatusTool.execute(
        { order_id: orderId, status: 'READY_FOR_SHIPMENT' },
        mockContext
      );

      const updatedDetails = await getOrderDetailsTool.execute(
        { order_id: orderId },
        mockContext
      );
      
      expect(updatedDetails).toContain('READY_FOR_SHIPMENT');
    });
  });

  describe('Error Handling', () => {
    it('should handle mock API errors gracefully', async () => {
      // Temporarily increase error rate for testing
      const originalErrorRate = process.env.MOCK_ERROR_RATE;
      process.env.MOCK_ERROR_RATE = '1.0'; // 100% error rate

      try {
        await expect(
          getOrderDetailsTool.execute(
            { order_id: testData.validOrderId },
            mockContext
          )
        ).rejects.toThrow();
      } finally {
        // Restore original error rate
        process.env.MOCK_ERROR_RATE = originalErrorRate;
      }
    });

    it('should validate progress reporting', async () => {
      let progressCalls = 0;
      const mockContextWithProgress = {
        ...mockContext,
        reportProgress: async ({ progress, total }: { progress: number; total: number }) => {
          progressCalls++;
          expect(progress).toBeGreaterThanOrEqual(0);
          expect(progress).toBeLessThanOrEqual(total);
          expect(total).toBeGreaterThan(0);
        }
      };

      await getOrderDetailsTool.execute(
        { order_id: testData.validOrderId },
        mockContextWithProgress
      );

      expect(progressCalls).toBeGreaterThan(0);
    });
  });

  describe('Performance Tests', () => {
    it('should complete operations within reasonable time', async () => {
      const startTime = Date.now();
      
      await getOrderDetailsTool.execute(
        { order_id: testData.validOrderId },
        mockContext
      );
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 1 second (even with mock delays)
      expect(duration).toBeLessThan(1000);
    });

    it('should handle multiple concurrent requests', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => 
        getOrderDetailsTool.execute(
          { order_id: `test-order-${i}` },
          mockContext
        )
      );

      const results = await Promise.all(requests);
      
      results.forEach(result => {
        expect(typeof result).toBe('string');
        expect(result).toContain('Order Details');
      });
    });
  });
});
