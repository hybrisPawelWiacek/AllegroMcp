import { z } from 'zod';
import type { Tool } from 'fastmcp';
import { mockApi } from '../../mock/index.js';
import { handleToolError, OrderNotFoundError } from '../../utils/errors.js';

export const addTrackingNumberTool: Tool<any, any> = {
  name: 'add_tracking_number',
  description: 'Add tracking information to an order shipment. This allows customers to track their packages and provides delivery updates.',
  parameters: z.object({
    order_id: z.string()
      .min(1, 'Order ID is required')
      .describe('Allegro checkout form ID'),
    carrier_name: z.string()
      .min(1, 'Carrier name is required')
      .describe('Name of the shipping carrier (e.g., InPost, DPD, DHL)'),
    tracking_number: z.string()
      .min(1, 'Tracking number is required')
      .describe('Package tracking/waybill number from carrier'),
    line_item_ids: z.array(z.string())
      .min(1, 'At least one line item must be specified')
      .describe('Array of line item IDs being shipped in this package'),
    estimated_delivery: z.string()
      .optional()
      .describe('Estimated delivery date (ISO format)')
  }),
  execute: async ({ order_id, carrier_name, tracking_number, line_item_ids, estimated_delivery }, { reportProgress }) => {
    try {
      await reportProgress({ progress: 20, total: 100 });

      // Validate order exists
      const order = await mockApi.simulateApiCall(async () => {
        return await mockApi.orders.getOrder(order_id);
      });

      if (!order) {
        throw new OrderNotFoundError(order_id);
      }

      await reportProgress({ progress: 50, total: 100 });

      // Validate line items exist in order
      const validLineItemIds = order.lineItems.map(item => item.id);
      const invalidLineItems = line_item_ids.filter(id => !validLineItemIds.includes(id));
      
      if (invalidLineItems.length > 0) {
        throw new Error(`Invalid line item IDs: ${invalidLineItems.join(', ')}`);
      }

      await reportProgress({ progress: 80, total: 100 });

      // Add shipment tracking
      const shipment = await mockApi.simulateApiCall(async () => {
        return await mockApi.orders.addShipment(order_id, carrier_name, tracking_number, line_item_ids);
      });

      await reportProgress({ progress: 100, total: 100 });

      // Get shipped items details
      const shippedItems = order.lineItems.filter(item => line_item_ids.includes(item.id));
      const totalShippedValue = shippedItems.reduce((sum, item) => 
        sum + parseFloat(item.price.amount) * item.quantity, 0
      );

      // Generate tracking URLs for popular Polish carriers
      const trackingUrlMap: Record<string, string> = {
        'InPost': `https://inpost.pl/sledzenie-przesylek?number=${tracking_number}`,
        'DPD': `https://www.dpd.com.pl/tracking?parcelnumber=${tracking_number}`,
        'DHL': `https://www.dhl.com/pl-pl/home/tracking.html?tracking-id=${tracking_number}`,
        'UPS': `https://www.ups.com/track?tracknum=${tracking_number}`,
        'Poczta Polska': `https://emonitoring.poczta-polska.pl/?numer=${tracking_number}`,
        'GLS': `https://gls-group.eu/PL/pl/sledzenie-przesylek?match=${tracking_number}`
      };

      const trackingUrl = trackingUrlMap[carrier_name] || `https://tracking.example.com/${tracking_number}`;

      return `🚚 **Tracking Information Added**

**Shipment Details:**
- Order ID: ${order_id}
- Tracking Number: ${tracking_number}
- Carrier: ${carrier_name}
- Shipment ID: ${shipment.id}
- Created: ${new Date(shipment.createdAt).toLocaleString('pl-PL')}

**📦 Items Shipped (${shippedItems.length}):**
${shippedItems.map((item, index) => `
${index + 1}. ${item.offer.name}
   - Quantity: ${item.quantity}
   - Value: ${(parseFloat(item.price.amount) * item.quantity).toFixed(2)} PLN
`).join('')}

**💰 Shipment Value:** ${totalShippedValue.toFixed(2)} PLN

**🔗 Tracking URL:** ${trackingUrl}

**📧 Customer Notification:**
- Customer will receive automatic email with tracking details
- SMS notification sent if phone number is available
- Order status automatically updated to "SENT"

**📱 Customer Experience:**
- Can track package in real-time
- Will receive delivery notifications
- Can reschedule delivery if needed (carrier-dependent)

${estimated_delivery ? `**📅 Estimated Delivery:** ${new Date(estimated_delivery).toLocaleDateString('pl-PL')}` : ''}

**Next Steps:**
- Monitor delivery status
- Prepare for customer feedback after delivery
- Handle any delivery issues promptly`;

    } catch (error) {
      handleToolError(error, 'add_tracking_number');
    }
  }
};
