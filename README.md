# AllegroMCP Server

A TypeScript FastMCP server that provides AI agents with comprehensive access to Allegro e-commerce API operations through 13 specialized tools for order management, dispute resolution, and returns processing.

## Features

- **Order Management**: Monitor events, get details, update status, add tracking
- **Dispute Resolution**: List disputes, manage messages, handle attachments
- **Returns Processing**: Process refunds, reject returns, commission refunds
- **Real-time SSE**: Server-Sent Events endpoint for AI agent integration
- **Mock Data**: Realistic Polish e-commerce data for testing

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start the server
npm run dev
```

The server will be available at `http://localhost:5000/sse`

### Production Deployment (Standard VM/VPS)

```bash
# Install dependencies
npm install

# Start production server
npm start
```

## Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Mock Data Configuration (optional)
MOCK_DELAY_MS=200
MOCK_ERROR_RATE=0.05
LOG_LEVEL=info
```

## API Endpoints

- **SSE Endpoint**: `/sse` - Server-Sent Events for MCP communication
- **HTTP Stream**: `/mcp` - Alternative HTTP stream endpoint

## Available Tools

### Order Tools
- `monitor_order_events` - Real-time order event monitoring
- `get_order_details` - Retrieve detailed order information
- `update_order_status` - Change order fulfillment status
- `add_tracking_number` - Add shipping tracking information

### Dispute Tools
- `list_disputes` - Get paginated dispute listings
- `get_dispute_details` - Retrieve dispute information
- `get_dispute_messages` - Fetch dispute conversation history
- `send_dispute_message` - Send messages in disputes
- `upload_dispute_attachment` - Handle dispute file uploads

### Return Tools
- `get_return_details` - Retrieve return request information
- `reject_return` - Reject return requests with reasons
- `process_refund` - Process customer refunds
- `request_commission_refund` - Request Allegro commission refunds

## Architecture

```
src/
├── index.ts              # Server entry point
├── server.ts             # FastMCP server configuration
├── tools/                # MCP tool implementations
│   ├── orders/           # Order management tools
│   ├── disputes/         # Dispute resolution tools
│   └── returns/          # Return processing tools
├── mock/                 # Mock data stores
├── types/                # TypeScript type definitions
└── utils/                # Logging and error handling
```

## Deployment Options

### Standard VM/VPS
```bash
# Using PM2
npm install -g pm2
pm2 start npm --name "allegro-mcp" -- start

# Using systemd
sudo systemctl enable allegro-mcp.service
sudo systemctl start allegro-mcp.service
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Cloud Platforms
- Railway: Connect GitHub repo, auto-deploys
- Vercel: Serverless deployment
- DigitalOcean App Platform: Standard Node.js app
- AWS/GCP/Azure: Container or VM deployment

## n8n Integration

To use AllegroMCP with n8n's MCP Client tool node:

### Configuration
1. **SSE Endpoint**: Enter your server URL with `/sse` path
   ```
   http://your-server:5000/sse
   ```

2. **Authentication**: Select "None" (AllegroMCP runs in public mode)

3. **Tools to Include**: Select "All" to access all 13 Allegro tools

### Available Tools in n8n
Once connected, you'll have access to:
- **Order Management**: Monitor events, get details, update status
- **Dispute Resolution**: List disputes, send messages, handle attachments  
- **Returns Processing**: Process refunds, reject returns, commission refunds

### Example n8n Workflow
```json
{
  "nodes": [
    {
      "name": "MCP Client",
      "type": "@n8n/n8n-nodes-mcp.mcpClient",
      "parameters": {
        "sseEndpoint": "http://localhost:5000/sse",
        "authentication": "none",
        "toolsToInclude": "all",
        "tool": "get_order_details",
        "toolParameters": {
          "orderId": "12345"
        }
      }
    }
  ]
}
```

## Testing

```bash
# Run tests
npm test

# Test SSE endpoint
curl -H "Accept: text/event-stream" http://localhost:5000/sse
```

## License

ISC