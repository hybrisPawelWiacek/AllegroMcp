import { z } from 'zod';
import { mockApi } from '../../mock/index.js';
import { handleToolError, ReturnNotFoundError } from '../../utils/errors.js';
export const rejectReturnTool = {
    name: 'reject_return',
    description: 'Reject a customer return request with specific reason and code. Use this when the return does not meet return policy requirements.',
    parameters: z.object({
        return_id: z.string()
            .min(1, 'Return ID is required')
            .describe('UUID of the customer return to reject'),
        reason: z.string()
            .min(10, 'Reason must be at least 10 characters')
            .max(1000, 'Reason cannot exceed 1000 characters')
            .describe('Detailed explanation for the rejection'),
        rejection_code: z.enum([
            'EXCEEDED_RETURN_PERIOD',
            'ITEM_USED_OR_DAMAGED',
            'MISSING_ORIGINAL_PACKAGING',
            'NON_RETURNABLE_ITEM',
            'POLICY_VIOLATION',
            'INSUFFICIENT_EVIDENCE'
        ]).describe('Standardized rejection code')
    }),
    execute: async ({ return_id, reason, rejection_code }, { reportProgress }) => {
        try {
            await reportProgress({ progress: 25, total: 100 });
            // Validate return exists
            const returnData = await mockApi.simulateApiCall(async () => {
                return await mockApi.returns.getReturn(return_id);
            });
            if (!returnData) {
                throw new ReturnNotFoundError(return_id);
            }
            await reportProgress({ progress: 60, total: 100 });
            // Process rejection
            await mockApi.simulateApiCall(async () => {
                return await mockApi.returns.rejectReturn(return_id, reason, rejection_code);
            });
            await reportProgress({ progress: 100, total: 100 });
            // Analyze rejection impact
            const totalValue = parseFloat(returnData.refund.value.amount);
            const itemCount = returnData.items.reduce((sum, item) => sum + item.quantity.returned, 0);
            const daysSinceCreated = Math.floor((Date.now() - new Date(returnData.createdAt).getTime()) / (24 * 60 * 60 * 1000));
            // Generate rejection code explanations
            const rejectionExplanations = {
                'EXCEEDED_RETURN_PERIOD': 'Return request submitted after the allowed return period expired',
                'ITEM_USED_OR_DAMAGED': 'Returned item shows signs of use or damage beyond normal inspection',
                'MISSING_ORIGINAL_PACKAGING': 'Item was not returned in original packaging or with required accessories',
                'NON_RETURNABLE_ITEM': 'Item category is not eligible for returns according to policy',
                'POLICY_VIOLATION': 'Return request violates one or more return policy conditions',
                'INSUFFICIENT_EVIDENCE': 'Insufficient evidence provided to support the return claim'
            };
            return `❌ **Return Rejected**

**🚫 Rejection Details:**
- Return ID: ${return_id}
- Buyer: ${returnData.buyer.login}
- Rejection Code: ${rejection_code}
- Processed: ${new Date().toLocaleString('pl-PL')}

**📋 Rejection Summary:**
- Items Affected: ${itemCount}
- Value: ${totalValue.toFixed(2)} PLN
- Return Age: ${daysSinceCreated} days
- Explanation: ${rejectionExplanations[rejection_code]}

**💬 Rejection Reason:**
"${reason}"

**📦 Affected Items:**
${returnData.items.map((item, index) => `
${index + 1}. ${item.name}
   - Quantity: ${item.quantity.returned}
   - Customer Reason: ${item.reason.returnReason}
   ${item.reason.userComment ? `- Customer Comment: "${item.reason.userComment}"` : ''}
`).join('')}

**📧 Customer Notification:**
- Buyer will receive automatic email notification
- Rejection reason will be clearly communicated
- Customer can respond through dispute system if needed
- Return shipping costs remain customer responsibility

**⚖️ Legal Compliance:**
✅ Rejection follows return policy guidelines
✅ Customer rights information provided
✅ Clear explanation given for decision
✅ Dispute resolution path available

**📊 Business Impact:**
- Avoided refund: ${totalValue.toFixed(2)} PLN
- Return processing saved
- Policy enforcement maintained
${totalValue > 200 ? '- Significant value retention' : ''}

**🔄 Next Steps:**
1. **Monitor Response:** Customer may dispute the rejection
2. **Document Decision:** Rejection reason logged for future reference
3. **Policy Review:** Consider if rejection reveals policy gaps
4. **Customer Service:** Be prepared for potential customer contact

**💡 Best Practices:**
- Rejection reasons should be clear and factual
- Maintain consistent policy application
- Be prepared to provide evidence if questioned
- Consider offering alternatives when appropriate

**⚠️ Potential Risks:**
${totalValue > 300 ? '- High-value rejection may trigger dispute' : ''}
${daysSinceCreated <= 7 ? '- Recent return rejection may surprise customer' : ''}
- Customer may leave negative feedback
- Possible escalation to Allegro support

**📞 Follow-up Actions:**
- Monitor for dispute creation
- Be ready to provide detailed justification
- Consider proactive customer communication
- Review similar returns to prevent future issues`;
        }
        catch (error) {
            handleToolError(error, 'reject_return');
        }
    }
};
export const processRefundTool = {
    name: 'process_refund',
    description: 'Process a refund for a payment, typically for returns or order cancellations. This initiates the actual money transfer back to the customer.',
    parameters: z.object({
        payment_id: z.string()
            .min(1, 'Payment ID is required')
            .describe('UUID of the original payment to refund'),
        reason: z.string()
            .min(5, 'Reason must be at least 5 characters')
            .max(500, 'Reason cannot exceed 500 characters')
            .describe('Reason for the refund'),
        line_items: z.array(z.object({
            line_item_id: z.string().describe('ID of the line item to refund'),
            quantity: z.number().min(1).describe('Quantity to refund'),
            amount: z.string().regex(/^\d+\.\d{2}$/).describe('Refund amount in PLN (e.g., "99.99")')
        })).min(1, 'At least one line item must be specified'),
        refund_delivery_cost: z.boolean()
            .default(false)
            .describe('Whether to refund delivery costs as well')
    }),
    execute: async ({ payment_id, reason, line_items, refund_delivery_cost }, { reportProgress }) => {
        try {
            await reportProgress({ progress: 20, total: 100 });
            // Calculate total refund amount
            const totalItemRefund = line_items.reduce((sum, item) => sum + parseFloat(item.amount), 0);
            const deliveryRefund = refund_delivery_cost ? 15.00 : 0; // Mock delivery cost
            const totalRefund = totalItemRefund + deliveryRefund;
            await reportProgress({ progress: 50, total: 100 });
            // Process the refund
            const refund = await mockApi.simulateApiCall(async () => {
                return await mockApi.returns.processRefund(payment_id, reason, line_items);
            });
            await reportProgress({ progress: 100, total: 100 });
            // Determine refund timeline based on payment method
            const estimatedTimeline = determineRefundTimeline(refund.status);
            return `💰 **Refund Processed Successfully**

**🆔 Refund Information:**
- Refund ID: ${refund.id}
- Payment ID: ${payment_id}
- Status: ${refund.status}
- Created: ${new Date(refund.createdAt).toLocaleString('pl-PL')}

**💵 Refund Breakdown:**
- Items Refund: ${totalItemRefund.toFixed(2)} PLN
${refund_delivery_cost ? `- Delivery Refund: ${deliveryRefund.toFixed(2)} PLN` : ''}
- **Total Refund: ${refund.value.amount} PLN**

**📋 Refunded Items (${line_items.length}):**
${line_items.map((item, index) => `
${index + 1}. Line Item: ${item.line_item_id}
   - Quantity: ${item.quantity}
   - Amount: ${item.amount} PLN
`).join('')}

**💬 Refund Reason:**
"${reason}"

**⏰ Processing Timeline:**
- Status: ${refund.status}
- ${estimatedTimeline.description}
- Expected completion: ${estimatedTimeline.timeframe}

**📧 Customer Notification:**
✅ Buyer will receive email confirmation
✅ Refund amount and timeline communicated
✅ Transaction reference provided
✅ Support contact information included

**🔄 Refund Process:**
1. **Initiated:** Refund request sent to payment processor
2. **Processing:** Bank/payment provider processing transaction
3. **Completion:** Funds will appear in customer account
4. **Confirmation:** Customer receives final confirmation

**📊 Business Impact:**
- Revenue impact: -${totalRefund.toFixed(2)} PLN
- Customer satisfaction: Likely improved
- Return processing: Completed successfully
- Policy compliance: ✅ Followed

**🎯 Success Factors:**
✅ Prompt refund processing
✅ Clear communication to customer
✅ Proper documentation maintained
✅ Compliance with refund policies

**📞 Customer Service:**
- Customer can track refund status
- Support available for refund inquiries
- Dispute resolution completed
- Positive customer experience maintained

**💡 Follow-up Actions:**
1. **Monitor Status:** Track refund completion
2. **Customer Feedback:** Request feedback after refund completion
3. **Process Review:** Analyze cause to prevent future returns
4. **Documentation:** Update customer service records

**⚠️ Important Notes:**
- Refund amount cannot be modified after processing
- Customer will be notified of any delays
- Banking holidays may affect processing time
- International payments may take longer

**📈 Performance Metrics:**
- Refund processing time: Immediate
- Customer satisfaction: Expected high
- Policy compliance: 100%
- Documentation: Complete`;
        }
        catch (error) {
            handleToolError(error, 'process_refund');
        }
    }
};
export const requestCommissionRefundTool = {
    name: 'request_commission_refund',
    description: 'Request a refund of Allegro commission fees for cancelled or returned orders. This helps recover platform fees when orders are not completed.',
    parameters: z.object({
        line_item_id: z.string()
            .min(1, 'Line item ID is required')
            .describe('UUID of the line item for which to request commission refund'),
        quantity: z.number()
            .min(1, 'Quantity must be at least 1')
            .describe('Quantity of items for commission refund request'),
        reason: z.enum([
            'CUSTOMER_RETURN',
            'ORDER_CANCELLATION',
            'PRODUCT_DEFECT',
            'SHIPPING_DAMAGE',
            'SELLER_ERROR',
            'POLICY_VIOLATION'
        ]).describe('Reason for requesting commission refund')
    }),
    execute: async ({ line_item_id, quantity, reason }, { reportProgress }) => {
        try {
            await reportProgress({ progress: 30, total: 100 });
            // Process commission refund request
            const claimId = await mockApi.simulateApiCall(async () => {
                return await mockApi.returns.requestCommissionRefund(line_item_id, quantity);
            });
            await reportProgress({ progress: 100, total: 100 });
            // Calculate estimated commission refund (mock calculation)
            const estimatedCommissionRate = 0.08; // 8% commission rate
            const estimatedItemValue = 150.00; // Mock item value
            const estimatedCommission = (estimatedItemValue * estimatedCommissionRate * quantity);
            // Determine approval likelihood
            const approvalLikelihood = determineApprovalLikelihood(reason);
            const reasonDescriptions = {
                'CUSTOMER_RETURN': 'Customer returned the item within return policy',
                'ORDER_CANCELLATION': 'Order was cancelled before fulfillment',
                'PRODUCT_DEFECT': 'Product had manufacturing defect or quality issue',
                'SHIPPING_DAMAGE': 'Item was damaged during shipping process',
                'SELLER_ERROR': 'Error on seller side (wrong item, description, etc.)',
                'POLICY_VIOLATION': 'Transaction violated platform policies'
            };
            return `🏦 **Commission Refund Requested**

**🆔 Request Information:**
- Claim ID: ${claimId}
- Line Item ID: ${line_item_id}
- Quantity: ${quantity}
- Reason: ${reason}
- Submitted: ${new Date().toLocaleString('pl-PL')}

**💰 Financial Details:**
- Estimated Commission: ${estimatedCommission.toFixed(2)} PLN
- Commission Rate: ${(estimatedCommissionRate * 100)}%
- Items Affected: ${quantity}
- Approval Likelihood: ${approvalLikelihood.level}

**📋 Request Details:**
- Reason: ${reasonDescriptions[reason]}
- Processing Status: Submitted to Allegro
- Expected Review Time: 3-5 business days
- Automatic Processing: ${approvalLikelihood.automatic ? 'Yes' : 'No'}

**⚡ Approval Likelihood: ${approvalLikelihood.level}**
${approvalLikelihood.factors.map(factor => `• ${factor}`).join('\n')}

**🔄 Processing Timeline:**
1. **Submitted:** ✅ Request sent to Allegro finance team
2. **Review:** 📋 Automatic validation and manual review (1-2 days)
3. **Verification:** 🔍 Transaction and reason verification (1-2 days)
4. **Decision:** ⚖️ Approval/rejection decision (1 day)
5. **Processing:** 💰 Commission credit applied (if approved)

**📧 Communication:**
- Email confirmation sent to registered seller email
- Updates will be provided during review process
- Final decision notification within 5 business days
- Appeal process available if rejected

**📊 Business Impact:**
- Potential Savings: ${estimatedCommission.toFixed(2)} PLN
- Cash Flow: Improved if approved
- Admin Time: Minimal (automated process)
- Success Rate: ${approvalLikelihood.successRate}%

**✅ Success Factors:**
${reason === 'CUSTOMER_RETURN' ? '• Customer return is well-documented' : ''}
${reason === 'PRODUCT_DEFECT' ? '• Product defect should be clearly evidenced' : ''}
${reason === 'ORDER_CANCELLATION' ? '• Cancellation timing supports claim' : ''}
${reason === 'SHIPPING_DAMAGE' ? '• Carrier damage reports strengthen claim' : ''}
• Clear transaction history
• Consistent seller behavior
• Policy compliance record

**📄 Documentation Required:**
- Transaction records (automatic)
- Return/cancellation evidence (if applicable)
- Customer communication history
- Order fulfillment timeline

**🎯 Next Steps:**
1. **Monitor Status:** Check claim status in seller dashboard
2. **Provide Evidence:** Submit additional documentation if requested  
3. **Respond Promptly:** Answer any Allegro queries quickly
4. **Track Outcome:** Note decision for future reference

**💡 Optimization Tips:**
- Submit claims promptly after qualifying events
- Maintain detailed records of all transactions
- Ensure return policies are clearly communicated
- Document customer service interactions

**⚠️ Important Notes:**
- Commission refunds are not guaranteed
- False claims may result in account penalties
- Review decisions are typically final
- Processing time may vary during high-volume periods

**📞 Support:**
- Status inquiries: Seller support chat
- Documentation questions: Help center
- Appeal process: Available if rejected
- Technical issues: Platform support team

**📈 Expected Outcome:**
${approvalLikelihood.level === '🟢 HIGH' ? 'Strong chance of approval - all factors favorable' : ''}
${approvalLikelihood.level === '🟡 MEDIUM' ? 'Moderate chance - some factors may need clarification' : ''}
${approvalLikelihood.level === '🔴 LOW' ? 'Lower chance - may require additional evidence' : ''}`;
        }
        catch (error) {
            handleToolError(error, 'request_commission_refund');
        }
    }
};
// Helper function to determine refund timeline based on status
function determineRefundTimeline(status) {
    switch (status) {
        case 'PENDING':
            return {
                description: 'Refund is being processed by payment provider',
                timeframe: '2-5 business days'
            };
        case 'SUCCEEDED':
            return {
                description: 'Refund has been completed successfully',
                timeframe: 'Completed'
            };
        case 'FAILED':
            return {
                description: 'Refund failed - manual intervention required',
                timeframe: 'Contact support'
            };
        default:
            return {
                description: 'Processing status unknown',
                timeframe: 'Check with support'
            };
    }
}
// Helper function to determine commission refund approval likelihood
function determineApprovalLikelihood(reason) {
    switch (reason) {
        case 'CUSTOMER_RETURN':
            return {
                level: '🟢 HIGH',
                automatic: true,
                successRate: 95,
                factors: [
                    'Customer returns are typically approved automatically',
                    'Clear policy compliance expected',
                    'Standard business practice'
                ]
            };
        case 'ORDER_CANCELLATION':
            return {
                level: '🟢 HIGH',
                automatic: true,
                successRate: 90,
                factors: [
                    'Cancellations before shipment usually approved',
                    'Clear transaction timeline',
                    'Minimal risk of abuse'
                ]
            };
        case 'PRODUCT_DEFECT':
            return {
                level: '🟡 MEDIUM',
                automatic: false,
                successRate: 75,
                factors: [
                    'Requires evidence of defect',
                    'Customer service record reviewed',
                    'Pattern analysis may apply'
                ]
            };
        case 'SHIPPING_DAMAGE':
            return {
                level: '🟡 MEDIUM',
                automatic: false,
                successRate: 80,
                factors: [
                    'Carrier damage reports helpful',
                    'Insurance claims may be verified',
                    'Shipping method considered'
                ]
            };
        case 'SELLER_ERROR':
            return {
                level: '🟡 MEDIUM',
                automatic: false,
                successRate: 70,
                factors: [
                    'Error type and frequency reviewed',
                    'Customer communication examined',
                    'Seller performance history considered'
                ]
            };
        case 'POLICY_VIOLATION':
            return {
                level: '🔴 LOW',
                automatic: false,
                successRate: 40,
                factors: [
                    'Violation type and severity matter',
                    'Requires detailed investigation',
                    'May impact seller standing'
                ]
            };
        default:
            return {
                level: '🟡 MEDIUM',
                automatic: false,
                successRate: 60,
                factors: ['Standard review process applies']
            };
    }
}
//# sourceMappingURL=process.js.map