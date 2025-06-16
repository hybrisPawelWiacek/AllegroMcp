import { z } from 'zod';
import { mockApi } from '../../mock/index.js';
import { handleToolError, DisputeNotFoundError } from '../../utils/errors.js';
export const getDisputeMessagesTool = {
    name: 'get_dispute_messages',
    description: 'Retrieve the complete message thread from a dispute to understand the conversation history and context.',
    parameters: z.object({
        dispute_id: z.string()
            .min(1, 'Dispute ID is required')
            .describe('UUID of the dispute')
    }),
    execute: async ({ dispute_id }, { reportProgress }) => {
        try {
            await reportProgress({ progress: 40, total: 100 });
            const messages = await mockApi.simulateApiCall(async () => {
                return await mockApi.disputes.getDisputeMessages(dispute_id);
            });
            if (messages.length === 0) {
                throw new DisputeNotFoundError(dispute_id);
            }
            await reportProgress({ progress: 100, total: 100 });
            // Sort messages chronologically
            const sortedMessages = messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            // Analyze conversation
            const buyerMessages = messages.filter(m => m.author.role === 'BUYER');
            const sellerMessages = messages.filter(m => m.author.role === 'SELLER');
            const lastMessage = sortedMessages[sortedMessages.length - 1];
            const awaitingResponse = lastMessage.author.role === 'BUYER';
            return `💬 **Dispute Messages**

**📊 Conversation Overview:**
- Total Messages: ${messages.length}
- Buyer Messages: ${buyerMessages.length}
- Seller Messages: ${sellerMessages.length}
- Status: ${awaitingResponse ? '🚨 Awaiting seller response' : '✅ Seller responded last'}

**📝 Message Thread:**

${sortedMessages.map((message, index) => {
                const roleIcon = message.author.role === 'BUYER' ? '👤' : message.author.role === 'SELLER' ? '🏪' : '🛡️';
                const timestamp = new Date(message.createdAt).toLocaleString('pl-PL');
                return `**${index + 1}. ${roleIcon} ${message.author.login} (${message.author.role})**
📅 ${timestamp}
${message.type === 'END_REQUEST' ? '🔚 **END REQUEST** - ' : ''}${message.text}
${message.attachment ? `📎 **Attachment:** ${message.attachment.fileName}` : ''}
`;
            }).join('\n')}

---

**🎯 Analysis & Recommendations:**

${awaitingResponse ? `🚨 **URGENT ACTION NEEDED:**
- Buyer is waiting for your response
- Quick response improves customer satisfaction
- Consider offering a solution or asking for more details` : `✅ **Status Good:**
- You've responded to the buyer's concerns
- Monitor for buyer's reply
- Consider following up if no response after 48 hours`}

**💡 Response Strategy:**
${buyerMessages.length > sellerMessages.length ? '- Buyer has sent more messages - they need attention' : ''}
${lastMessage.text.toLowerCase().includes('uszkodz') ? '- Buyer mentions damage - consider replacement/refund' : ''}
${lastMessage.text.toLowerCase().includes('nie otrzyma') ? '- Buyer claims non-delivery - check shipping status' : ''}
${lastMessage.text.toLowerCase().includes('opis') ? '- Buyer mentions description issue - verify product details' : ''}
${lastMessage.text.toLowerCase().includes('zwrot') ? '- Buyer wants return - provide return instructions' : ''}

**📞 Next Steps:**
1. Use send_dispute_message to respond
2. If needed, use upload_dispute_attachment for evidence
3. Consider offering practical solutions (refund, replacement, etc.)
4. Follow up to ensure satisfaction

**⏰ Response Time:** ${awaitingResponse ? 'Respond within 24 hours for best results' : 'Monitor for buyer reply'}`;
        }
        catch (error) {
            handleToolError(error, 'get_dispute_messages');
        }
    }
};
export const sendDisputeMessageTool = {
    name: 'send_dispute_message',
    description: 'Send a message to the buyer in an existing dispute. This is your primary tool for customer communication and dispute resolution.',
    parameters: z.object({
        dispute_id: z.string()
            .min(1, 'Dispute ID is required')
            .describe('UUID of the dispute'),
        message: z.string()
            .min(1, 'Message cannot be empty')
            .max(2000, 'Message too long (max 2000 characters)')
            .describe('Message text to send to the buyer'),
        attachment_id: z.string()
            .optional()
            .describe('ID of previously uploaded attachment to include with message')
    }),
    execute: async ({ dispute_id, message, attachment_id }, { reportProgress }) => {
        try {
            await reportProgress({ progress: 30, total: 100 });
            // Validate dispute exists
            const dispute = await mockApi.disputes.getDispute(dispute_id);
            if (!dispute) {
                throw new DisputeNotFoundError(dispute_id);
            }
            await reportProgress({ progress: 60, total: 100 });
            // Send the message
            const sentMessage = await mockApi.simulateApiCall(async () => {
                return await mockApi.disputes.sendDisputeMessage(dispute_id, message, attachment_id);
            });
            await reportProgress({ progress: 100, total: 100 });
            // Analyze message for automatic suggestions
            const messageAnalysis = analyzeMessage(message);
            return `✅ **Message Sent Successfully**

**📧 Message Details:**
- Dispute ID: ${dispute_id}
- Message ID: ${sentMessage.id}
- Sent: ${new Date(sentMessage.createdAt).toLocaleString('pl-PL')}
- Length: ${message.length} characters
${attachment_id ? `- Attachment: Included` : ''}

**📝 Your Message:**
"${message}"

**🎯 Message Analysis:**
${messageAnalysis.type === 'apology' ? '😊 Good: Apologetic tone shows customer care' : ''}
${messageAnalysis.type === 'solution' ? '💡 Excellent: Offering concrete solutions' : ''}
${messageAnalysis.type === 'question' ? '❓ Good: Asking for clarification' : ''}
${messageAnalysis.type === 'explanation' ? '📚 Informative: Explaining the situation' : ''}

**📊 Dispute Status Updated:**
- Messages Status: SELLER_REPLIED
- Buyer will receive email notification
- Response time logged for seller performance

**🔄 What Happens Next:**
1. Buyer receives email/SMS notification
2. Buyer can reply through Allegro platform
3. You can monitor responses with get_dispute_messages
4. Continue conversation until resolution

**📈 Customer Service Tips:**
✅ You responded promptly - great for seller ratings!
${message.length < 50 ? '💡 Consider more detailed responses for better clarity' : ''}
${!message.includes('przepraszam') && !message.includes('sorry') ? '💡 Consider adding empathy/apology for better customer relations' : ''}
${messageAnalysis.containsSolution ? '🎯 Excellent: You offered a solution!' : '💡 Consider offering specific next steps or solutions'}

**⏰ Follow-up Reminder:** Check for buyer response in 24-48 hours`;
        }
        catch (error) {
            handleToolError(error, 'send_dispute_message');
        }
    }
};
// Helper function to analyze message content
function analyzeMessage(message) {
    const lowerMessage = message.toLowerCase();
    let type = 'general';
    if (lowerMessage.includes('przepraszam') || lowerMessage.includes('sorry')) {
        type = 'apology';
    }
    else if (lowerMessage.includes('zwrot') || lowerMessage.includes('wymiana') || lowerMessage.includes('refund')) {
        type = 'solution';
    }
    else if (lowerMessage.includes('?') || lowerMessage.includes('czy')) {
        type = 'question';
    }
    else if (lowerMessage.includes('ponieważ') || lowerMessage.includes('dlatego')) {
        type = 'explanation';
    }
    const containsSolution = lowerMessage.includes('zwrot') ||
        lowerMessage.includes('wymiana') ||
        lowerMessage.includes('refund') ||
        lowerMessage.includes('wyślę') ||
        lowerMessage.includes('send') ||
        lowerMessage.includes('offer');
    return { type, containsSolution };
}
//# sourceMappingURL=messages.js.map