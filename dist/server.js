"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAllegroServer = createAllegroServer;
const fastmcp_1 = require("fastmcp");
const index_js_1 = require("./tools/index.js");
const logger_js_1 = require("./utils/logger.js");
function createAllegroServer() {
    const server = new fastmcp_1.FastMCP({
        name: process.env.MCP_SERVER_NAME || 'allegro-mcp',
        version: '1.0.0',
        instructions: `
AllegroMCP provides AI agents with comprehensive access to Allegro e-commerce operations.

🚀 Available capabilities:
• Order management and event monitoring
• Customer dispute resolution and communication  
• Return processing and refund management
• Real-time status updates and tracking

📋 Tool Categories:
• Orders: monitor_order_events, get_order_details, update_order_status, add_tracking_number
• Disputes: list_disputes, get_dispute_details, get_dispute_messages, send_dispute_message, upload_dispute_attachment
• Returns: get_return_details, reject_return, process_refund, request_commission_refund

🔧 All tools use realistic mock data for safe testing and demonstration.
🌍 Server is publicly accessible via SSE endpoint for AI agent integration.

💡 This server enables AI-driven automation for Polish e-commerce merchants using Allegro platform.
    `.trim(),
        // No authenticate function = public access
    });
    // Register all Allegro tools
    const tools = (0, index_js_1.getAllegroTools)();
    logger_js_1.logger.info(`📦 Registering ${tools.length} Allegro tools...`);
    tools.forEach(tool => {
        server.addTool(tool);
        logger_js_1.logger.debug(`✅ Registered tool: ${tool.name}`);
    });
    // Add server events for monitoring
    server.on('connect', (event) => {
        logger_js_1.logger.info(`🔗 Client connected: ${event.session || 'unknown'}`);
    });
    server.on('disconnect', (event) => {
        logger_js_1.logger.info(`🔌 Client disconnected: ${event.session || 'unknown'}`);
    });
    return server;
}
