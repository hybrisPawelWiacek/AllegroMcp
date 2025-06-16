import type { Tool } from 'fastmcp';
import { monitorOrderEventsTool } from './monitor.js';
import { getOrderDetailsTool } from './details.js';
import { updateOrderStatusTool } from './status.js';
import { addTrackingNumberTool } from './shipping.js';

export function getOrderTools(): Tool[] {
  return [
    monitorOrderEventsTool,
    getOrderDetailsTool,
    updateOrderStatusTool,
    addTrackingNumberTool
  ];
}

export {
  monitorOrderEventsTool,
  getOrderDetailsTool,
  updateOrderStatusTool,
  addTrackingNumberTool
};
