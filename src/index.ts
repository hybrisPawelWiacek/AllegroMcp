import { config } from 'dotenv';
import { createAllegroServer } from './server.js';
import { logger } from './utils/logger.js';

// Load environment variables
config();

async function main() {
  try {
    const server = createAllegroServer();
    
    // Configure for public access
    const port = parseInt(process.env.PORT || '5000');
    
    logger.info('🚀 Starting AllegroMCP Server...');
    logger.info(`📡 SSE endpoint will be available at: http://0.0.0.0:${port}/sse`);
    logger.info(`🌍 Public access: ENABLED`);
    
    await server.start({
      transportType: 'httpStream',
      httpStream: {
        port: port,
        endpoint: '/sse'
      }
    });
    
    logger.info('✅ AllegroMCP Server is running and publicly accessible!');
    logger.info(`🔗 Connect via: http://0.0.0.0:${port}/sse`);
    
  } catch (error) {
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
