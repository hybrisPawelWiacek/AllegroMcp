"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReturnTools = exports.getDisputeTools = exports.getOrderTools = void 0;
exports.getAllegroTools = getAllegroTools;
const index_js_1 = require("./orders/index.js");
Object.defineProperty(exports, "getOrderTools", { enumerable: true, get: function () { return index_js_1.getOrderTools; } });
const index_js_2 = require("./disputes/index.js");
Object.defineProperty(exports, "getDisputeTools", { enumerable: true, get: function () { return index_js_2.getDisputeTools; } });
const index_js_3 = require("./returns/index.js");
Object.defineProperty(exports, "getReturnTools", { enumerable: true, get: function () { return index_js_3.getReturnTools; } });
function getAllegroTools() {
    const tools = [
        ...(0, index_js_1.getOrderTools)(),
        ...(0, index_js_2.getDisputeTools)(),
        ...(0, index_js_3.getReturnTools)()
    ];
    return tools;
}
