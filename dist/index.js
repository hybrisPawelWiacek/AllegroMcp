import { config } from 'dotenv';
import { createAllegroServer } from './server.js';
import { logger } from './utils/logger.js';
// Load environment variables
config();
async function main() {
    try {
        const server = createAllegroServer();
        // Configure for public SSE access
        const port = parseInt(process.env.PORT || '5000');
        logger.info('🚀 Starting AllegroMCP Server...');
        logger.info(`📡 SSE endpoint will be available at: http://localhost:${port}/sse`);
        logger.info(`🌍 Public access: ${process.env.ENABLE_PUBLIC_ACCESS === 'true' ? 'ENABLED' : 'DISABLED'}`);
        await server.start({
            transportType: 'stdio'
        });
        logger.info('✅ AllegroMCP Server is running and publicly accessible!');
        logger.info(`🔗 Connect via: http://localhost:${port}/sse`);
    }
    catch (error) {
        logger.error('❌ Failed to start AllegroMCP Server:', error);
        process.exit(1);
    }
}
// Handle graceful shutdown
process.on('SIGINT', () => {
    logger.info('🛑 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});
process.on('SIGTERM', () => {
    logger.info('🛑 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});
main().catch((error) => {
    logger.error('💥 Unhandled error in main:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map