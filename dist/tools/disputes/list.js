import { z } from 'zod';
import { mockApi } from '../../mock/index.js';
import { handleToolError } from '../../utils/errors.js';
export const listDisputesTool = {
    name: 'list_disputes',
    description: 'Retrieve all active disputes requiring attention. This helps prioritize customer communication and resolve issues promptly.',
    parameters: z.object({
        limit: z.number()
            .min(1)
            .max(100)
            .default(20)
            .describe('Maximum number of disputes to return'),
        offset: z.number()
            .min(0)
            .default(0)
            .describe('Number of disputes to skip (for pagination)'),
        status: z.enum(['ONGOING', 'CLOSED', 'UNRESOLVED'])
            .optional()
            .describe('Filter disputes by status')
    }),
    execute: async ({ limit, offset, status }, { reportProgress }) => {
        try {
            await reportProgress({ progress: 30, total: 100 });
            const result = await mockApi.simulateApiCall(async () => {
                return await mockApi.disputes.listDisputes(limit, offset);
            });
            await reportProgress({ progress: 80, total: 100 });
            // Filter by status if specified
            const filteredDisputes = status
                ? result.disputes.filter(dispute => dispute.status === status)
                : result.disputes;
            await reportProgress({ progress: 100, total: 100 });
            if (filteredDisputes.length === 0) {
                return `📋 **Dispute List**

✅ **No disputes found**
- Status filter: ${status || 'all'}
- This is good news - no customer disputes need attention!

💡 **Tip:** Regular monitoring helps maintain good customer relationships.`;
            }
            // Prioritize disputes by urgency
            const urgentDisputes = filteredDisputes.filter(d => d.messagesStatus === 'BUYER_REPLIED');
            const normalDisputes = filteredDisputes.filter(d => d.messagesStatus !== 'BUYER_REPLIED');
            return `📋 **Dispute List**

**📊 Summary:**
- Total disputes: ${result.totalCount}
- Showing: ${filteredDisputes.length} (${offset + 1}-${offset + filteredDisputes.length})
- Status filter: ${status || 'all'}

${urgentDisputes.length > 0 ? `🚨 **URGENT - Buyer Replied (${urgentDisputes.length}):**
${urgentDisputes.map((dispute, index) => `
${index + 1}. **${dispute.subject.name}**
   - ID: ${dispute.id}
   - Status: ${dispute.status}
   - Buyer: ${dispute.buyer.login}
   - Order: ${dispute.checkoutForm.id}
   - Created: ${new Date(dispute.createdAt).toLocaleDateString('pl-PL')}
   - ⚡ **Action needed: Buyer is waiting for response**
`).join('')}` : ''}

${normalDisputes.length > 0 ? `📝 **Other Disputes (${normalDisputes.length}):**
${normalDisputes.map((dispute, index) => `
${index + 1}. **${dispute.subject.name}**
   - ID: ${dispute.id}
   - Status: ${dispute.status} | Messages: ${dispute.messagesStatus}
   - Buyer: ${dispute.buyer.login}
   - Order: ${dispute.checkoutForm.id}
   - Updated: ${new Date(dispute.updatedAt).toLocaleDateString('pl-PL')}
`).join('')}` : ''}

**🎯 Recommended Actions:**
${urgentDisputes.length > 0 ? '1. **Priority:** Respond to buyer-replied disputes first' : ''}
${urgentDisputes.length > 0 ? '2. Use get_dispute_messages to read conversation history' : 'Use get_dispute_messages to read conversation history'}
${urgentDisputes.length > 0 ? '3. Use send_dispute_message to provide solutions' : 'Use send_dispute_message for proactive communication'}

**📈 Performance Tip:** Quick responses improve seller ratings and customer satisfaction.`;
        }
        catch (error) {
            handleToolError(error, 'list_disputes');
        }
    }
};
//# sourceMappingURL=list.js.map