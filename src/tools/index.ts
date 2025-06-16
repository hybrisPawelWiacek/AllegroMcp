import type { Tool } from 'fastmcp';
import { getOrderTools } from './orders/index.js';
import { getDisputeTools } from './disputes/index.js';
import { getReturnTools } from './returns/index.js';

export function getAllegroTools(): Tool<any, any>[] {
  const tools: Tool<any, any>[] = [
    ...getOrderTools(),
    ...getDisputeTools(),
    ...getReturnTools()
  ];

  return tools;
}

export { getOrderTools, getDisputeTools, getReturnTools };
