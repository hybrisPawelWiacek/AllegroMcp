import type { Tool } from 'fastmcp';
import { listDisputesTool } from './list.js';
import { getDisputeDetailsTool } from './details.js';
import { getDisputeMessagesTool, sendDisputeMessageTool } from './messages.js';
import { uploadDisputeAttachmentTool } from './attachments.js';

export function getDisputeTools(): Tool<any, any>[] {
  return [
    listDisputesTool,
    getDisputeDetailsTool,
    getDisputeMessagesTool,
    sendDisputeMessageTool,
    uploadDisputeAttachmentTool
  ];
}

export {
  listDisputesTool,
  getDisputeDetailsTool,
  getDisputeMessagesTool,
  sendDisputeMessageTool,
  uploadDisputeAttachmentTool
};
