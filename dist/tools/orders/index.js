"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTrackingNumberTool = exports.updateOrderStatusTool = exports.getOrderDetailsTool = exports.monitorOrderEventsTool = void 0;
exports.getOrderTools = getOrderTools;
const monitor_js_1 = require("./monitor.js");
Object.defineProperty(exports, "monitorOrderEventsTool", { enumerable: true, get: function () { return monitor_js_1.monitorOrderEventsTool; } });
const details_js_1 = require("./details.js");
Object.defineProperty(exports, "getOrderDetailsTool", { enumerable: true, get: function () { return details_js_1.getOrderDetailsTool; } });
const status_js_1 = require("./status.js");
Object.defineProperty(exports, "updateOrderStatusTool", { enumerable: true, get: function () { return status_js_1.updateOrderStatusTool; } });
const shipping_js_1 = require("./shipping.js");
Object.defineProperty(exports, "addTrackingNumberTool", { enumerable: true, get: function () { return shipping_js_1.addTrackingNumberTool; } });
function getOrderTools() {
    return [
        monitor_js_1.monitorOrderEventsTool,
        details_js_1.getOrderDetailsTool,
        status_js_1.updateOrderStatusTool,
        shipping_js_1.addTrackingNumberTool
    ];
}
