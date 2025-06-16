import { getOrderTools } from './orders/index.js';
import { getDisputeTools } from './disputes/index.js';
import { getReturnTools } from './returns/index.js';
export function getAllegroTools() {
    const tools = [
        ...getOrderTools(),
        ...getDisputeTools(),
        ...getReturnTools()
    ];
    return tools;
}
export { getOrderTools, getDisputeTools, getReturnTools };
//# sourceMappingURL=index.js.map