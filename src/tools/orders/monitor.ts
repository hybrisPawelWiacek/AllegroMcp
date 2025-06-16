import { z } from 'zod';
import type { Tool } from 'fastmcp';
import { mockApi } from '../../mock/index.js';
import { handleToolError } from '../../utils/errors.js';

export const monitorOrderEventsTool: Tool = {
  name: 'monitor_order_events',
  description: 'Monitor order events and changes in real-time. This tool polls for new order events like status changes, payment updates, and fulfillment progress.',
  parameters: z.object({
    from_event_id: z.string()
      .optional()
      .describe('Start monitoring from this event ID (for pagination)'),
    event_type: z.enum(['ORDER_STATUS_CHANGED', 'FULFILLMENT_STATUS_CHANGED', 'PAYMENT_STATUS_CHANGED', 'DISPUTE_CREATED', 'RETURN_CREATED'])
      .optional()
      .describe('Filter events by type'),
    limit: z.number()
      .min(1)
      .max(100)
      .default(20)
      .describe('Maximum number of events to return')
  }),
  execute: async ({ from_event_id, event_type, limit }, { reportProgress }) => {
    try {
      await reportProgress({ progress: 25, total: 100 });

      const events = await mockApi.simulateApiCall(async () => {
        return await mockApi.orders.getEvents(from_event_id, limit);
      });

      await reportProgress({ progress: 75, total: 100 });

      // Filter by event type if specified
      const filteredEvents = event_type 
        ? events.filter(event => event.type === event_type)
        : events;

      await reportProgress({ progress: 100, total: 100 });

      if (filteredEvents.length === 0) {
        return `📊 **Order Event Monitor**

🔍 **No new events found**
- Monitoring from: ${from_event_id || 'beginning'}
- Event type filter: ${event_type || 'all types'}
- Limit: ${limit}

💡 This is normal - it means there are no new order events to process.`;
      }

      return `📊 **Order Event Monitor**

🎯 **Found ${filteredEvents.length} new events**

${filteredEvents.map((event, index) => `
**Event ${index + 1}:**
- ID: ${event.id}
- Type: ${event.type}
- Order: ${event.order.checkoutForm.id}
- Occurred: ${new Date(event.occurredAt).toLocaleString('pl-PL')}
`).join('')}

📈 **Next Steps:**
- Use get_order_details with the order IDs to get full information
- Set from_event_id to ${filteredEvents[filteredEvents.length - 1]?.id} for next poll
- Consider processing these events to trigger automated responses`;

    } catch (error) {
      handleToolError(error, 'monitor_order_events');
    }
  }
};
