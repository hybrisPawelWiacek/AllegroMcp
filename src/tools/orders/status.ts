import { z } from 'zod';
import type { Tool } from 'fastmcp';
import { mockApi } from '../../mock/index.js';
import { handleToolError, OrderNotFoundError } from '../../utils/errors.js';

export const updateOrderStatusTool: Tool = {
  name: 'update_order_status',
  description: 'Update the fulfillment status of an order. This affects how the order appears to the buyer and triggers automatic notifications.',
  parameters: z.object({
    order_id: z.string()
      .min(1, 'Order ID is required')
      .describe('Allegro checkout form ID'),
    status: z.enum(['NEW', 'PROCESSING', 'READY_FOR_SHIPMENT', 'SENT', 'DELIVERED', 'CANCELLED'])
      .describe('New order status to set'),
    note: z.string()
      .optional()
      .describe('Optional note explaining the status change')
  }),
  execute: async ({ order_id, status, note }, { reportProgress }) => {
    try {
      await reportProgress({ progress: 20, total: 100 });

      // Validate current order exists
      const currentOrder = await mockApi.simulateApiCall(async () => {
        return await mockApi.orders.getOrder(order_id);
      });

      if (!currentOrder) {
        throw new OrderNotFoundError(order_id);
      }

      await reportProgress({ progress: 50, total: 100 });

      // Update the order status
      const updatedOrder = await mockApi.simulateApiCall(async () => {
        return await mockApi.orders.updateOrderStatus(order_id, status);
      });

      await reportProgress({ progress: 100, total: 100 });

      // Determine status change message
      const statusMessages = {
        'NEW': '🆕 Order marked as new',
        'PROCESSING': '⚙️ Order is now being processed',
        'READY_FOR_SHIPMENT': '📦 Order is ready for shipment',
        'SENT': '🚚 Order has been sent to customer',
        'DELIVERED': '✅ Order has been delivered',
        'CANCELLED': '❌ Order has been cancelled'
      };

      return `✅ **Order Status Updated**

**Order ID:** ${order_id}
**Previous Status:** ${currentOrder.status}
**New Status:** ${status}
**Updated:** ${new Date(updatedOrder.updatedAt).toLocaleString('pl-PL')}

**Change:** ${statusMessages[status]}

**Customer Impact:**
${status === 'PROCESSING' ? '- Customer will receive notification that order is being prepared' : ''}
${status === 'READY_FOR_SHIPMENT' ? '- Customer expects shipment notification soon' : ''}
${status === 'SENT' ? '- Customer will receive tracking information and delivery timeline' : ''}
${status === 'DELIVERED' ? '- Customer can now leave feedback and ratings' : ''}
${status === 'CANCELLED' ? '- Customer will be notified and refund process will begin' : ''}

${note ? `**Note:** ${note}` : ''}

**Next Steps:**
${status === 'READY_FOR_SHIPMENT' ? '- Use add_tracking_number tool to add shipment details' : ''}
${status === 'SENT' ? '- Monitor delivery status and customer feedback' : ''}
${status === 'CANCELLED' ? '- Ensure refund is processed if payment was made' : ''}`;

    } catch (error) {
      handleToolError(error, 'update_order_status');
    }
  }
};
