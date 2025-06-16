import { getReturnDetailsTool } from './details.js';
import { rejectReturnTool, processRefundTool, requestCommissionRefundTool } from './process.js';
export function getReturnTools() {
    return [
        getReturnDetailsTool,
        rejectReturnTool,
        processRefundTool,
        requestCommissionRefundTool
    ];
}
export { getReturnDetailsTool, rejectReturnTool, processRefundTool, requestCommissionRefundTool };
//# sourceMappingURL=index.js.map