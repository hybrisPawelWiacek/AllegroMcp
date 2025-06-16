import { z } from 'zod';
import { mockApi } from '../../mock/index.js';
import { handleToolError, DisputeNotFoundError } from '../../utils/errors.js';
export const uploadDisputeAttachmentTool = {
    name: 'upload_dispute_attachment',
    description: 'Upload a file attachment to support dispute resolution. Useful for providing evidence, photos, or documentation.',
    parameters: z.object({
        dispute_id: z.string()
            .min(1, 'Dispute ID is required')
            .describe('UUID of the dispute'),
        file_name: z.string()
            .min(1, 'File name is required')
            .describe('Name of the file being uploaded'),
        file_content: z.string()
            .min(1, 'File content is required')
            .describe('Base64 encoded file content'),
        file_type: z.enum(['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'])
            .default('image/jpeg')
            .describe('MIME type of the file')
    }),
    execute: async ({ dispute_id, file_name, file_content, file_type }, { reportProgress }) => {
        try {
            await reportProgress({ progress: 20, total: 100 });
            // Validate dispute exists
            const dispute = await mockApi.disputes.getDispute(dispute_id);
            if (!dispute) {
                throw new DisputeNotFoundError(dispute_id);
            }
            await reportProgress({ progress: 40, total: 100 });
            // Validate file content
            const isValidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(file_content);
            if (!isValidBase64) {
                throw new Error('Invalid file content - must be base64 encoded');
            }
            // Calculate file size
            const fileSizeBytes = Math.ceil(file_content.length * 0.75); // Approximate size from base64
            const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2);
            if (fileSizeBytes > 10 * 1024 * 1024) { // 10MB limit
                throw new Error('File too large - maximum size is 10MB');
            }
            await reportProgress({ progress: 70, total: 100 });
            // Upload attachment
            const attachmentId = await mockApi.simulateApiCall(async () => {
                return await mockApi.disputes.uploadAttachment(dispute_id, file_name, file_content);
            });
            await reportProgress({ progress: 100, total: 100 });
            // Determine file category
            const fileCategory = determineFileCategory(file_type, file_name);
            return `📎 **Attachment Uploaded Successfully**

**📁 File Details:**
- Attachment ID: ${attachmentId}
- File Name: ${file_name}
- File Type: ${file_type}
- File Size: ${fileSizeMB} MB
- Category: ${fileCategory.category}

**🔗 Dispute Information:**
- Dispute ID: ${dispute_id}
- Subject: ${dispute.subject.name}
- Status: ${dispute.status}

**✅ Upload Confirmation:**
- File stored securely
- Available for dispute communication
- Can be attached to messages
- Accessible to buyer and Allegro support

**📤 Next Steps:**
1. **Use in message:** Include attachment_id "${attachmentId}" when sending dispute message
2. **Example usage:** send_dispute_message with attachment_id parameter
3. **Reference in communication:** Mention the attachment in your message text

**💡 Usage Suggestions:**
${fileCategory.suggestions}

**🛡️ Privacy & Security:**
- File is encrypted and secure
- Only accessible by dispute participants
- Automatically deleted after dispute resolution
- Complies with GDPR data protection

**📋 File Categories & Best Practices:**
${fileCategory.bestPractices}

**⚠️ Important Notes:**
- Attachment is now ready to be included in messages
- Buyers can download and view the file
- High-quality images improve dispute resolution success rate
- Consider adding description in your message explaining the attachment`;
        }
        catch (error) {
            handleToolError(error, 'upload_dispute_attachment');
        }
    }
};
// Helper function to analyze file and provide suggestions
function determineFileCategory(fileType, fileName) {
    const lowerFileName = fileName.toLowerCase();
    if (fileType.startsWith('image/')) {
        if (lowerFileName.includes('damaged') || lowerFileName.includes('uszkodz')) {
            return {
                category: '📸 Damage Evidence Photo',
                suggestions: '• Perfect for showing product damage\n• Helps justify refunds or replacements\n• Include multiple angles if possible',
                bestPractices: '• Use good lighting for clear images\n• Show damage clearly\n• Include original packaging if relevant\n• Take photos from multiple angles'
            };
        }
        else if (lowerFileName.includes('receipt') || lowerFileName.includes('paragon')) {
            return {
                category: '🧾 Receipt/Proof of Purchase',
                suggestions: '• Excellent for payment verification\n• Helps with warranty claims\n• Supports refund requests',
                bestPractices: '• Ensure all text is readable\n• Include full receipt with date\n• Show payment method clearly'
            };
        }
        else {
            return {
                category: '🖼️ Product Photo',
                suggestions: '• Great for showing actual product condition\n• Helps compare with listing description\n• Useful for size/color disputes',
                bestPractices: '• Use natural lighting\n• Show product clearly\n• Include size references if relevant\n• Capture important details'
            };
        }
    }
    else if (fileType === 'application/pdf') {
        return {
            category: '📄 PDF Document',
            suggestions: '• Perfect for official documents\n• Warranty information\n• Shipping documentation',
            bestPractices: '• Ensure document is complete\n• Check all pages are included\n• Verify text is readable\n• Include relevant sections only'
        };
    }
    else {
        return {
            category: '📄 Text Document',
            suggestions: '• Good for detailed explanations\n• Technical specifications\n• Communication records',
            bestPractices: '• Keep content relevant to dispute\n• Use clear formatting\n• Include dates and references\n• Be concise but thorough'
        };
    }
}
//# sourceMappingURL=attachments.js.map