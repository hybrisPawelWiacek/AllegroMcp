"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const server_js_1 = require("./server.js");
const logger_js_1 = require("./utils/logger.js");
// Load environment variables
(0, dotenv_1.config)();
async function main() {
    try {
        const server = (0, server_js_1.createAllegroServer)();
        // Configure for public SSE access
        const port = parseInt(process.env.PORT || '5000');
        logger_js_1.logger.info('🚀 Starting AllegroMCP Server...');
        logger_js_1.logger.info(`📡 SSE endpoint will be available at: http://localhost:${port}/sse`);
        logger_js_1.logger.info(`🌍 Public access: ${process.env.ENABLE_PUBLIC_ACCESS === 'true' ? 'ENABLED' : 'DISABLED'}`);
        await server.start({
            transportType: 'stdio'
        });
        logger_js_1.logger.info('✅ AllegroMCP Server is running and publicly accessible!');
        logger_js_1.logger.info(`🔗 Connect via: http://localhost:${port}/sse`);
    }
    catch (error) {
        logger_js_1.logger.error('❌ Failed to start AllegroMCP Server:', error);
        process.exit(1);
    }
}
// Handle graceful shutdown
process.on('SIGINT', () => {
    logger_js_1.logger.info('🛑 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});
process.on('SIGTERM', () => {
    logger_js_1.logger.info('🛑 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});
main().catch((error) => {
    logger_js_1.logger.error('💥 Unhandled error in main:', error);
    process.exit(1);
});
