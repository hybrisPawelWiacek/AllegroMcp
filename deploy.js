#!/usr/bin/env node

// Production deployment script for AllegroMCP Server
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting AllegroMCP Server for production deployment...');

const startServer = () => {
  const serverPath = path.join(__dirname, 'src', 'index.ts');
  
  const server = spawn('npx', ['tsx', serverPath], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: process.env.PORT || '5000'
    }
  });

  server.on('error', (err) => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  });

  server.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ Server process exited with code ${code}`);
      process.exit(code);
    }
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    server.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down...');
    server.kill('SIGTERM');
  });
};

startServer();