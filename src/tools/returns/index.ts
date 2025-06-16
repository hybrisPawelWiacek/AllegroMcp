import type { Tool } from 'fastmcp';
import { getReturnDetailsTool } from './details.js';
import { rejectReturnTool, processRefundTool, requestCommissionRefundTool } from './process.js';

export function getReturnTools(): Tool[] {
  return [
    getReturnDetailsTool,
    rejectReturnTool,
    processRefundTool,
    requestCommissionRefundTool
  ];
}

export {
  getReturnDetailsTool,
  rejectReturnTool,
  processRefundTool,
  requestCommissionRefundTool
};
