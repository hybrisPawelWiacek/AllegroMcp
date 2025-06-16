"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderDetailsTool = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../../mock/index.js");
const errors_js_1 = require("../../utils/errors.js");
exports.getOrderDetailsTool = {
    name: 'get_order_details',
    description: 'Retrieve comprehensive order information including buyer details, items, delivery information, and payment status.',
    parameters: zod_1.z.object({
        order_id: zod_1.z.string()
            .min(1, 'Order ID cannot be empty')
            .describe('Allegro checkout form ID (order identifier)')
    }),
    execute: async ({ order_id }, { reportProgress }) => {
        try {
            await reportProgress({ progress: 25, total: 100 });
            const order = await index_js_1.mockApi.simulateApiCall(async () => {
                return await index_js_1.mockApi.orders.getOrder(order_id);
            });
            if (!order) {
                throw new errors_js_1.OrderNotFoundError(order_id);
            }
            await reportProgress({ progress: 75, total: 100 });
            const shipments = await index_js_1.mockApi.orders.getShipments(order_id);
            await reportProgress({ progress: 100, total: 100 });
            // Calculate totals
            const itemsTotal = order.lineItems.reduce((sum, item) => sum + parseFloat(item.price.amount) * item.quantity, 0);
            const deliveryTotal = parseFloat(order.delivery.cost.amount);
            const surchargesTotal = order.surcharges.reduce((sum, surcharge) => sum + parseFloat(surcharge.value.amount), 0);
            const discountsTotal = order.discounts.reduce((sum, discount) => sum + parseFloat(discount.value.amount), 0);
            const totalAmount = itemsTotal + deliveryTotal + surchargesTotal - discountsTotal;
            return `📦 **Order Details**

**🆔 Order Information:**
- Order ID: ${order.id}
- Status: ${order.status}
- Fulfillment: ${order.fulfillment.status}
- Created: ${new Date(order.createdAt).toLocaleString('pl-PL')}
- Updated: ${new Date(order.updatedAt).toLocaleString('pl-PL')}

**👤 Buyer Information:**
- Name: ${order.buyer.firstName} ${order.buyer.lastName}
- Email: ${order.buyer.email}
- Login: ${order.buyer.login}
- Account Type: ${order.buyer.guest ? 'Guest' : 'Registered'}

**📋 Order Items (${order.lineItems.length}):**
${order.lineItems.map((item, index) => `
${index + 1}. ${item.offer.name}
   - Quantity: ${item.quantity}
   - Price: ${item.price.amount} PLN each
   - Total: ${(parseFloat(item.price.amount) * item.quantity).toFixed(2)} PLN
   - ASP: ${item.offer.isAllegroStandardProgram ? 'Yes' : 'No'}
`).join('')}

**💰 Payment Information:**
- Payment ID: ${order.payment.id}
- Type: ${order.payment.type}
- Provider: ${order.payment.provider}
- Status: ${order.payment.finishedAt ? 'Paid' : 'Pending'}
- Amount: ${order.payment.paidAmount.amount} PLN

**🚚 Delivery Information:**
- Method: ${order.delivery.method.name}
- Cost: ${order.delivery.cost.amount} PLN
- Smart Delivery: ${order.delivery.smart ? 'Yes' : 'No'}
- Expected: ${order.delivery.time.from ? new Date(order.delivery.time.from).toLocaleDateString('pl-PL') : 'TBD'} - ${order.delivery.time.to ? new Date(order.delivery.time.to).toLocaleDateString('pl-PL') : 'TBD'}

**📍 Delivery Address:**
${order.delivery.address.firstName} ${order.delivery.address.lastName}
${order.delivery.address.street}
${order.delivery.address.postCode} ${order.delivery.address.city}
${order.delivery.address.phoneNumber ? `Tel: ${order.delivery.address.phoneNumber}` : ''}

${shipments.length > 0 ? `**📦 Shipments (${shipments.length}):**
${shipments.map((shipment, index) => `
${index + 1}. Tracking: ${shipment.waybill}
   - Carrier: ${shipment.carrierName}
   - Items: ${shipment.lineItems.length}
   - Sent: ${new Date(shipment.createdAt).toLocaleString('pl-PL')}
`).join('')}` : ''}

**💵 Order Summary:**
- Items Total: ${itemsTotal.toFixed(2)} PLN
- Delivery: ${deliveryTotal.toFixed(2)} PLN
- Surcharges: ${surchargesTotal.toFixed(2)} PLN
- Discounts: -${discountsTotal.toFixed(2)} PLN
- **Final Total: ${totalAmount.toFixed(2)} PLN**

${order.note ? `**📝 Notes:** ${order.note}` : ''}`;
        }
        catch (error) {
            (0, errors_js_1.handleToolError)(error, 'get_order_details');
        }
    }
};
