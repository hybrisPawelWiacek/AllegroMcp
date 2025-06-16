import { z } from 'zod';
import type { Tool } from 'fastmcp';
import { mockApi } from '../../mock/index.js';
import { handleToolError, ReturnNotFoundError } from '../../utils/errors.js';

export const getReturnDetailsTool: Tool = {
  name: 'get_return_details',
  description: 'Retrieve comprehensive information about a customer return request including items, reasons, and refund calculations.',
  parameters: z.object({
    return_id: z.string()
      .min(1, 'Return ID is required')
      .describe('UUID of the customer return')
  }),
  execute: async ({ return_id }, { reportProgress }) => {
    try {
      await reportProgress({ progress: 40, total: 100 });

      const returnData = await mockApi.simulateApiCall(async () => {
        return await mockApi.returns.getReturn(return_id);
      });

      if (!returnData) {
        throw new ReturnNotFoundError(return_id);
      }

      await reportProgress({ progress: 100, total: 100 });

      // Calculate return metrics
      const totalItems = returnData.items.reduce((sum, item) => sum + item.quantity.returned, 0);
      const totalValue = parseFloat(returnData.refund.value.amount);
      const daysSinceCreated = Math.floor((Date.now() - new Date(returnData.createdAt).getTime()) / (24 * 60 * 60 * 1000));

      // Analyze return reasons
      const reasonCategories = analyzeReturnReasons(returnData.items.map(item => item.reason.returnReason));
      const hasUserComments = returnData.items.some(item => item.reason.userComment);

      // Determine return urgency based on age and value
      const isUrgent = daysSinceCreated > 7 || totalValue > 500;
      const urgencyLevel = isUrgent ? '🚨 HIGH' : daysSinceCreated > 3 ? '⚠️ MEDIUM' : '✅ LOW';

      return `📦 **Return Details**

**🆔 Return Information:**
- Return ID: ${return_id}
- Buyer: ${returnData.buyer.login}
- Created: ${new Date(returnData.createdAt).toLocaleString('pl-PL')} (${daysSinceCreated} days ago)
- Updated: ${new Date(returnData.updatedAt).toLocaleString('pl-PL')}
- Urgency: ${urgencyLevel}

**📦 Shipment Tracking:**
- Waybill: ${returnData.parcel.waybill}
- Carrier: ${returnData.parcel.carrierName}
- Tracking: ${returnData.parcel.carrierTrackingUrl}

**📋 Return Items (${returnData.items.length}):**
${returnData.items.map((item, index) => `
${index + 1}. **${item.name}**
   - Line Item ID: ${item.lineItemId}
   - Quantity: ${item.quantity.returned} ${item.quantity.unit}
   - Reason: ${item.reason.returnReason}
   ${item.reason.userComment ? `- Customer Comment: "${item.reason.userComment}"` : ''}
   ${item.imageUrl ? `- Image: ${item.imageUrl}` : ''}
`).join('')}

**💰 Refund Information:**
- Total Refund: ${returnData.refund.value.amount} ${returnData.refund.value.currency}
- Items: ${returnData.refund.items.length}

**💵 Refund Breakdown:**
${returnData.refund.items.map((refundItem, index) => `
${index + 1}. Line Item: ${refundItem.lineItemId}
   - Amount: ${refundItem.lineItemValue.amount} ${refundItem.lineItemValue.currency}
`).join('')}

**📊 Return Analysis:**
- Total Items: ${totalItems}
- Total Value: ${totalValue.toFixed(2)} PLN
- Age: ${daysSinceCreated} days
- Has Comments: ${hasUserComments ? 'Yes' : 'No'}

**🎯 Return Reason Categories:**
${Object.entries(reasonCategories).map(([category, count]) => `
- ${category}: ${count} item(s)
`).join('')}

**⚡ Action Required:**
${isUrgent ? '🚨 **URGENT:** This return requires immediate attention' : ''}
${daysSinceCreated > 7 ? '⏰ **OVERDUE:** Return is older than 7 days' : ''}
${totalValue > 500 ? '💰 **HIGH VALUE:** Significant refund amount' : ''}

**🔄 Available Actions:**
1. **Accept Return:** Use process_refund to issue refund
2. **Reject Return:** Use reject_return if return is invalid
3. **Commission Refund:** Use request_commission_refund for Allegro fees

**💡 Decision Guidelines:**
${reasonCategories['Damage/Defect'] ? '• Product damage: Usually valid for refund' : ''}
${reasonCategories['Wrong Item'] ? '• Wrong item sent: Valid for refund + replacement' : ''}
${reasonCategories['Customer Change'] ? '• Customer changed mind: Check return policy compliance' : ''}
${reasonCategories['Delivery Issue'] ? '• Delivery problems: Usually valid for refund' : ''}
${daysSinceCreated <= 14 ? '✅ Within standard return period' : '❌ Outside standard return period - review carefully'}

**📈 Recommendations:**
${hasUserComments ? '• Review customer comments for additional context' : ''}
${totalValue > 200 ? '• Consider partial refund if items show wear' : ''}
• Respond quickly to maintain customer satisfaction
• Document decision reasoning for records

${daysSinceCreated > 5 ? '⚠️ **Note:** Extended processing time may affect seller ratings' : ''}`;

    } catch (error) {
      handleToolError(error, 'get_return_details');
    }
  }
};

// Helper function to categorize return reasons
function analyzeReturnReasons(reasons: string[]): Record<string, number> {
  const categories: Record<string, number> = {
    'Damage/Defect': 0,
    'Wrong Item': 0,
    'Customer Change': 0,
    'Delivery Issue': 0,
    'Other': 0
  };

  reasons.forEach(reason => {
    const lowerReason = reason.toLowerCase();
    if (lowerReason.includes('uszkodz') || lowerReason.includes('wada') || lowerReason.includes('damaged') || lowerReason.includes('defect')) {
      categories['Damage/Defect']++;
    } else if (lowerReason.includes('błędny') || lowerReason.includes('wrong') || lowerReason.includes('niezgodny')) {
      categories['Wrong Item']++;
    } else if (lowerReason.includes('oczekiwań') || lowerReason.includes('zdania') || lowerReason.includes('change')) {
      categories['Customer Change']++;
    } else if (lowerReason.includes('opóźnienie') || lowerReason.includes('dostaw') || lowerReason.includes('delivery')) {
      categories['Delivery Issue']++;
    } else {
      categories['Other']++;
    }
  });

  return categories;
}
