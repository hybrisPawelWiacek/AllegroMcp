import { monitorOrderEventsTool } from './monitor.js';
import { getOrderDetailsTool } from './details.js';
import { updateOrderStatusTool } from './status.js';
import { addTrackingNumberTool } from './shipping.js';
export function getOrderTools() {
    return [
        monitorOrderEventsTool,
        getOrderDetailsTool,
        updateOrderStatusTool,
        addTrackingNumberTool
    ];
}
export { monitorOrderEventsTool, getOrderDetailsTool, updateOrderStatusTool, addTrackingNumberTool };
//# sourceMappingURL=index.js.map