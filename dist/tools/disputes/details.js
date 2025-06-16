import { z } from 'zod';
import { mockApi } from '../../mock/index.js';
import { handleToolError, DisputeNotFoundError } from '../../utils/errors.js';
export const getDisputeDetailsTool = {
    name: 'get_dispute_details',
    description: 'Get comprehensive information about a specific dispute including timeline, participants, and current status.',
    parameters: z.object({
        dispute_id: z.string()
            .min(1, 'Dispute ID is required')
            .describe('UUID of the dispute to retrieve')
    }),
    execute: async ({ dispute_id }, { reportProgress }) => {
        try {
            await reportProgress({ progress: 30, total: 100 });
            const dispute = await mockApi.simulateApiCall(async () => {
                return await mockApi.disputes.getDispute(dispute_id);
            });
            if (!dispute) {
                throw new DisputeNotFoundError(dispute_id);
            }
            await reportProgress({ progress: 70, total: 100 });
            const messages = await mockApi.disputes.getDisputeMessages(dispute_id);
            await reportProgress({ progress: 100, total: 100 });
            // Calculate time metrics
            const createdDate = new Date(dispute.createdAt);
            const updatedDate = new Date(dispute.updatedAt);
            const daysSinceCreated = Math.floor((Date.now() - createdDate.getTime()) / (24 * 60 * 60 * 1000));
            const daysSinceUpdate = Math.floor((Date.now() - updatedDate.getTime()) / (24 * 60 * 60 * 1000));
            // Analyze message pattern
            const buyerMessages = messages.filter(m => m.author.role === 'BUYER').length;
            const sellerMessages = messages.filter(m => m.author.role === 'SELLER').length;
            const lastMessage = messages[messages.length - 1];
            // Determine urgency
            const isUrgent = dispute.messagesStatus === 'BUYER_REPLIED' || daysSinceUpdate > 2;
            const urgencyLevel = isUrgent ? '🚨 HIGH' : daysSinceUpdate > 1 ? '⚠️ MEDIUM' : '✅ LOW';
            return `🔍 **Dispute Details**

**🆔 Basic Information:**
- Dispute ID: ${dispute.id}
- Subject: **${dispute.subject.name}**
- Status: ${dispute.status}
- Messages Status: ${dispute.messagesStatus}
- Urgency: ${urgencyLevel}

**⏰ Timeline:**
- Created: ${createdDate.toLocaleString('pl-PL')} (${daysSinceCreated} days ago)
- Last Updated: ${updatedDate.toLocaleString('pl-PL')} (${daysSinceUpdate} days ago)
- Age: ${daysSinceCreated} days

**👥 Participants:**
- Buyer: ${dispute.buyer.login}
- Order ID: ${dispute.checkoutForm.id}
- Order Date: ${new Date(dispute.checkoutForm.createdAt).toLocaleDateString('pl-PL')}

**💬 Message Summary:**
- Total Messages: ${messages.length}
- Buyer Messages: ${buyerMessages}
- Seller Messages: ${sellerMessages}
- Response Ratio: ${sellerMessages}/${buyerMessages} (seller/buyer)

${lastMessage ? `**📨 Last Message:**
- From: ${lastMessage.author.login} (${lastMessage.author.role})
- Date: ${new Date(lastMessage.createdAt).toLocaleString('pl-PL')}
- Preview: "${lastMessage.text.substring(0, 100)}${lastMessage.text.length > 100 ? '...' : ''}"
${lastMessage.attachment ? `- Attachment: ${lastMessage.attachment.fileName}` : ''}` : ''}

**📊 Status Analysis:**
${dispute.status === 'ONGOING' ? '🔄 Dispute is active and requires attention' : ''}
${dispute.status === 'CLOSED' ? '✅ Dispute has been resolved successfully' : ''}
${dispute.status === 'UNRESOLVED' ? '❌ Dispute could not be resolved - may affect ratings' : ''}

${dispute.messagesStatus === 'BUYER_REPLIED' ? '🚨 **URGENT:** Buyer is waiting for your response' : ''}
${dispute.messagesStatus === 'SELLER_REPLIED' ? '⏳ Waiting for buyer response' : ''}
${dispute.messagesStatus === 'NEW' ? '🆕 New dispute - first response opportunity' : ''}

**🎯 Recommended Actions:**
${dispute.messagesStatus === 'BUYER_REPLIED' ? '1. **Priority:** Respond immediately to buyer concerns' : ''}
${dispute.messagesStatus === 'BUYER_REPLIED' ? '2. Use get_dispute_messages to read full conversation' : 'Use get_dispute_messages to read full conversation'}
${dispute.messagesStatus === 'BUYER_REPLIED' ? '3. Prepare solution and use send_dispute_message' : 'Consider proactive communication with send_dispute_message'}
${daysSinceUpdate > 2 ? '⚠️ **Note:** Extended silence may negatively impact seller ratings' : ''}

**📈 Customer Service Tips:**
- Respond within 24 hours for best results
- Acknowledge the issue and show empathy
- Provide clear solutions or alternatives
- Follow up after resolution`;
        }
        catch (error) {
            handleToolError(error, 'get_dispute_details');
        }
    }
};
//# sourceMappingURL=details.js.map