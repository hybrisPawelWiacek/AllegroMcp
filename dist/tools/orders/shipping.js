"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTrackingNumberTool = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../../mock/index.js");
const errors_js_1 = require("../../utils/errors.js");
exports.addTrackingNumberTool = {
    name: 'add_tracking_number',
    description: 'Add tracking information to an order shipment. This allows customers to track their packages and provides delivery updates.',
    parameters: zod_1.z.object({
        order_id: zod_1.z.string()
            .min(1, 'Order ID is required')
            .describe('Allegro checkout form ID'),
        carrier_name: zod_1.z.string()
            .min(1, 'Carrier name is required')
            .describe('Name of the shipping carrier (e.g., InPost, DPD, DHL)'),
        tracking_number: zod_1.z.string()
            .min(1, 'Tracking number is required')
            .describe('Package tracking/waybill number from carrier'),
        line_item_ids: zod_1.z.array(zod_1.z.string())
            .min(1, 'At least one line item must be specified')
            .describe('Array of line item IDs being shipped in this package'),
        estimated_delivery: zod_1.z.string()
            .optional()
            .describe('Estimated delivery date (ISO format)')
    }),
    execute: async ({ order_id, carrier_name, tracking_number, line_item_ids, estimated_delivery }, { reportProgress }) => {
        try {
            await reportProgress({ progress: 20, total: 100 });
            // Validate order exists
            const order = await index_js_1.mockApi.simulateApiCall(async () => {
                return await index_js_1.mockApi.orders.getOrder(order_id);
            });
            if (!order) {
                throw new errors_js_1.OrderNotFoundError(order_id);
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
            const shipment = await index_js_1.mockApi.simulateApiCall(async () => {
                return await index_js_1.mockApi.orders.addShipment(order_id, carrier_name, tracking_number, line_item_ids);
            });
            await reportProgress({ progress: 100, total: 100 });
            // Get shipped items details
            const shippedItems = order.lineItems.filter(item => line_item_ids.includes(item.id));
            const totalShippedValue = shippedItems.reduce((sum, item) => sum + parseFloat(item.price.amount) * item.quantity, 0);
            // Generate tracking URLs for popular Polish carriers
            const trackingUrlMap = {
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
        }
        catch (error) {
            (0, errors_js_1.handleToolError)(error, 'add_tracking_number');
        }
    }
};
