"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestCommissionRefundTool = exports.processRefundTool = exports.rejectReturnTool = exports.getReturnDetailsTool = void 0;
exports.getReturnTools = getReturnTools;
const details_js_1 = require("./details.js");
Object.defineProperty(exports, "getReturnDetailsTool", { enumerable: true, get: function () { return details_js_1.getReturnDetailsTool; } });
const process_js_1 = require("./process.js");
Object.defineProperty(exports, "rejectReturnTool", { enumerable: true, get: function () { return process_js_1.rejectReturnTool; } });
Object.defineProperty(exports, "processRefundTool", { enumerable: true, get: function () { return process_js_1.processRefundTool; } });
Object.defineProperty(exports, "requestCommissionRefundTool", { enumerable: true, get: function () { return process_js_1.requestCommissionRefundTool; } });
function getReturnTools() {
    return [
        details_js_1.getReturnDetailsTool,
        process_js_1.rejectReturnTool,
        process_js_1.processRefundTool,
        process_js_1.requestCommissionRefundTool
    ];
}
