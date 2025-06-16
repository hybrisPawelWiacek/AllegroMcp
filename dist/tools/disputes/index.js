"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadDisputeAttachmentTool = exports.sendDisputeMessageTool = exports.getDisputeMessagesTool = exports.getDisputeDetailsTool = exports.listDisputesTool = void 0;
exports.getDisputeTools = getDisputeTools;
const list_js_1 = require("./list.js");
Object.defineProperty(exports, "listDisputesTool", { enumerable: true, get: function () { return list_js_1.listDisputesTool; } });
const details_js_1 = require("./details.js");
Object.defineProperty(exports, "getDisputeDetailsTool", { enumerable: true, get: function () { return details_js_1.getDisputeDetailsTool; } });
const messages_js_1 = require("./messages.js");
Object.defineProperty(exports, "getDisputeMessagesTool", { enumerable: true, get: function () { return messages_js_1.getDisputeMessagesTool; } });
Object.defineProperty(exports, "sendDisputeMessageTool", { enumerable: true, get: function () { return messages_js_1.sendDisputeMessageTool; } });
const attachments_js_1 = require("./attachments.js");
Object.defineProperty(exports, "uploadDisputeAttachmentTool", { enumerable: true, get: function () { return attachments_js_1.uploadDisputeAttachmentTool; } });
function getDisputeTools() {
    return [
        list_js_1.listDisputesTool,
        details_js_1.getDisputeDetailsTool,
        messages_js_1.getDisputeMessagesTool,
        messages_js_1.sendDisputeMessageTool,
        attachments_js_1.uploadDisputeAttachmentTool
    ];
}
