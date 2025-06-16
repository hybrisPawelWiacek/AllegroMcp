# AllegroMCP Server - Technical Product Requirements Document

## Executive Summary

AllegroMCP is a Model Context Protocol (MCP) server that wraps the Allegro e-commerce API, enabling AI agents to interact with merchant operations through standardized tools. This server focuses on two primary operational scopes: Customer Communication Management (dispute handling) and Order/Returns Management (order processing, shipments, returns, and refunds).

## Product Overview

### Vision
Create a working proof-of-concept MCP server that demonstrates AI-driven automation for Allegro merchants.

### Goals
- Enable AI-driven customer communication for dispute resolution
- Automate order status updates and tracking information
- Streamline return and refund processes
- Provide real-time order event monitoring through polling architecture
- **Support rapid development with mock Allegro API responses**

### Target Users
- Developers building AI automation for Allegro merchants
- AI agents (Claude, ChatGPT) accessing Allegro operations
- **Developers testing integrations without production API access**

## Functional Requirements

### 1. Customer Communication Management (Disputes)

Based on the attached Allegro API scope for "Zarządzanie komunikacją z klientami":

#### 1.1 Dispute Monitoring
- **Tool Name**: `list_disputes`
- **Description**: Retrieve all active disputes
- **API Endpoint**: `GET /sale/disputes`
- **Parameters**: 
  - `limit`: Number of results (optional)
  - `offset`: Pagination offset (optional)
- **Returns**: List of disputes with buyer info, messages, and status

#### 1.2 Dispute Details
- **Tool Name**: `get_dispute_details`
- **Description**: Get comprehensive information about specific dispute
- **API Endpoint**: `GET /sale/disputes/{disputeId}`
- **Parameters**: `dispute_id` (UUID)
- **Returns**: Full dispute information including messages

#### 1.3 Dispute Messages
- **Tool Name**: `get_dispute_messages`
- **Description**: Retrieve message thread from dispute
- **API Endpoint**: `GET /sale/disputes/{disputeId}/messages`
- **Parameters**: `dispute_id` (UUID)
- **Returns**: Chronological message list with attachments

#### 1.4 Send Dispute Message
- **Tool Name**: `send_dispute_message`
- **Description**: Send message in existing dispute
- **API Endpoint**: `POST /sale/disputes/{disputeId}/messages`
- **Parameters**: 
  - `dispute_id`: UUID of dispute
  - `message`: Text content
  - `attachment_id`: Optional attachment reference
- **Returns**: Message confirmation

#### 1.5 Attachment Management
- **Tool Name**: `upload_dispute_attachment`
- **Description**: Upload file attachment for dispute
- **API Endpoints**: 
  - `POST /sale/dispute-attachments` (declare)
  - `PUT /sale/dispute-attachments/{attachmentId}` (upload)
- **Parameters**: `file_path`, `file_type`
- **Returns**: Attachment ID for message reference

### 2. Order and Returns Management

Based on the attached Allegro API scope for "Obsługa zamówień i zwrotów":

#### 2.1 Order Event Monitoring
- **Tool Name**: `monitor_order_events`
- **Description**: Poll for order changes and events
- **API Endpoint**: `GET /order/events`
- **Parameters**: 
  - `from`: Event ID for pagination
  - `type`: Event type filter
  - `limit`: Number of events
- **Returns**: List of order events with details

#### 2.2 Order Details
- **Tool Name**: `get_order_details`
- **Description**: Retrieve complete order information
- **API Endpoint**: `GET /order/checkout-forms/{id}`
- **Parameters**: `order_id` (checkout form ID)
- **Returns**: Full order with buyer, payment, delivery, line items

#### 2.3 Order Status Management
- **Tool Name**: `update_order_status`
- **Description**: Change order fulfillment status
- **API Endpoint**: `PUT /order/checkout-forms/{id}/fulfillment`
- **Parameters**: 
  - `order_id`: Checkout form ID
  - `status`: New fulfillment status
- **Returns**: Status update confirmation

#### 2.4 Shipment Tracking
- **Tool Name**: `add_tracking_number`
- **Description**: Add tracking information to order
- **API Endpoint**: `POST /order/checkout-forms/{id}/shipments`
- **Parameters**: 
  - `order_id`: Checkout form ID
  - `carrier_id`: Shipping carrier
  - `tracking_number`: Waybill number
  - `line_items`: Items being shipped
- **Returns**: Shipment confirmation

#### 2.5 Returns Processing
- **Tool Name**: `get_return_details`
- **Description**: Retrieve customer return information
- **API Endpoint**: `GET /order/customer-returns/{customerReturnId}`
- **Parameters**: `return_id` (UUID)
- **Returns**: Return details with items and refund info

#### 2.6 Return Decision
- **Tool Name**: `reject_return`
- **Description**: Reject customer return request
- **API Endpoint**: `POST /order/customer-returns/{customerReturnId}/rejection`
- **Parameters**: 
  - `return_id`: Return UUID
  - `reason`: Rejection explanation
  - `code`: Rejection code
- **Returns**: Rejection confirmation

#### 2.7 Refund Processing
- **Tool Name**: `process_refund`
- **Description**: Issue refund for payment
- **API Endpoint**: `POST /payments/refunds`
- **Parameters**: 
  - `payment_id`: Payment UUID
  - `reason`: Refund reason
  - `line_items`: Items to refund
  - `amount`: Refund amount
- **Returns**: Refund transaction details

#### 2.8 Commission Refunds
- **Tool Name**: `request_commission_refund`
- **Description**: Request Allegro commission refund
- **API Endpoint**: `POST /order/refund-claims`
- **Parameters**: 
  - `line_item_id`: Line item UUID
  - `quantity`: Quantity to refund
- **Returns**: Refund claim ID

## Technical Requirements

### Platform: Replit with TypeScript FastMCP
- **Language**: TypeScript/Node.js 20+
- **Framework**: FastMCP v2.0+ (punkpeye/fastmcp)
- **Transport**: SSE for public access, HTTP streaming for n8n, STDIO for local development
- **Database**: Replit Database for mock data and state
- **Deployment**: **Required - deployed on Replit and publicly accessible online**

### Public Access Requirements
- **SSE Endpoint**: Must be available at `https://your-repl-name.repl.co/sse`
- **Authentication**: **No credentials required for SSE endpoint**
- **Tool Exposure**: **All tools must be publicly accessible via SSE**
- **CORS**: Properly configured for cross-origin access
- **Uptime**: 24/7 availability through Replit's always-on deployment

### Dependencies
```json
{
  "dependencies": {
    "fastmcp": "^2.0.0",
    "@modelcontextprotocol/sdk": "^1.10.2",
    "zod": "^3.24.3",
    "undici": "^7.8.0",
    "dotenv": "^16.4.0"
  },
  "devDependencies": {
    "vitest": "^1.6.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.4.0",
    "tsx": "^4.7.0"
  }
}
```

### Transport Configuration
- **SSE (Primary)**: Public endpoint for demonstrations and testing
- **HTTP Streaming**: For n8n workflow integration
- **STDIO**: Local development and debugging with `npx fastmcp dev`

### Server Configuration
```typescript
// Multi-transport server setup
const server = new FastMCP({
  name: 'allegro-mcp',
  version: '1.0.0',
  // No authentication function - public access
});

// Start with SSE transport for public access
server.start({
  transportType: 'sse',
  sse: {
    endpoint: '/sse',
    port: parseInt(process.env.PORT || '8000')
  }
});
```

## Implementation Plan

### Phase 1: FastMCP Foundation & Public Deployment (Week 1)
1. Set up Replit project with TypeScript and FastMCP v2.0
2. **Configure SSE transport for public access without authentication**
3. **Deploy to Replit and verify public accessibility at https://your-repl.repl.co/sse**
4. Implement mock data layer with TypeScript interfaces
5. Create basic health check and server info tools
6. **Test public SSE endpoint with MCP Inspector**

### Phase 2: Order Management Tools (Week 2)
1. Implement `monitor_order_events` with mock event generation
2. Create `get_order_details` with realistic Polish order data
3. Add `update_order_status` with state persistence
4. Implement `add_tracking_number` with carrier mock data
5. Set up polling mechanism with configurable intervals
6. **Verify all tools are accessible via public SSE endpoint**

### Phase 3: Dispute Management Tools (Week 3)
1. Implement `list_disputes` with mock dispute scenarios
2. Create `get_dispute_details` and `get_dispute_messages`
3. Add `send_dispute_message` with conversation simulation
4. Implement `upload_dispute_attachment` with file handling
5. Test complete dispute resolution workflows
6. **Ensure all dispute tools work through public SSE access**

### Phase 4: Returns and Refunds (Week 4)
1. Implement `get_return_details` with mock return data
2. Create `reject_return` with proper reason codes
3. Add `process_refund` with mock payment processing
4. Implement `request_commission_refund` functionality
5. Complete end-to-end testing of all workflows
6. **Validate full tool suite via public SSE endpoint**

### Phase 5: Integration and Production Readiness (Week 5)
1. **Optimize Replit deployment for 24/7 uptime**
2. Test n8n integration with HTTP streaming transport
3. Add comprehensive error handling and logging
4. Create API documentation with public endpoint examples
5. **Document public SSE endpoint usage for external developers**
6. Prepare for optional real Allegro API integration

## Environment Configuration

```env
# Server Configuration
NODE_ENV=production
MCP_SERVER_NAME=allegro-mcp
MCP_SERVER_VERSION=1.0.0
PORT=8000

# Public Access Configuration
ENABLE_PUBLIC_ACCESS=true
CORS_ORIGINS=*
SSE_ENDPOINT=/sse

# Mock Configuration
USE_MOCK_API=true
MOCK_DELAY_MS=200
MOCK_ERROR_RATE=0.05

# Allegro API (for future production integration)
# ALLEGRO_CLIENT_ID=your_client_id
# ALLEGRO_CLIENT_SECRET=your_client_secret
# ALLEGRO_API_URL=https://api.allegro.pl
```

### Replit Configuration (.replit)
```toml
modules = ["nodejs-20"]

[nix]
channel = "stable-24_05"

[[ports]]
localPort = 8000
externalPort = 80

[deployment]
run = ["npm", "start"]
deploymentTarget = "cloudrun"

[env]
NODE_ENV = "production"
USE_MOCK_API = "true"
ENABLE_PUBLIC_ACCESS = "true"
```

## Success Criteria

### Technical Metrics
- All 12 core tools implemented and functional
- **SSE endpoint publicly accessible at https://your-repl.repl.co/sse**
- **All tools accessible without authentication via SSE**
- <500ms response time for mock API calls
- 100% TypeScript type coverage
- Working n8n integration via HTTP streaming
- Comprehensive test coverage with Vitest

### Deployment Metrics
- **24/7 uptime on Replit platform**
- **Public SSE endpoint responds to connections**
- **CORS properly configured for cross-origin access**
- **All 12 tools discoverable via MCP protocol over SSE**
- Fast cold start times (<3 seconds)

### Functional Metrics
- Complete order lifecycle automation demo
- End-to-end dispute resolution workflow
- Return and refund processing capability
- Real-time event monitoring simulation
- Mock data persistence between sessions
- **External developers can connect to public SSE endpoint**

## Testing Strategy

### Unit Tests (Vitest + TypeScript)
- Tool parameter validation with Zod schemas
- Mock API response generation and consistency
- Error handling and edge cases
- Session management and authentication

### Integration Tests
- FastMCP server startup and tool registration
- **SSE transport functionality and public accessibility**
- HTTP streaming transport functionality
- Mock data persistence and state management
- End-to-end workflow testing

### Public Endpoint Testing
- **SSE connection establishment without credentials**
- **Tool discovery via MCP protocol over SSE**
- **Cross-origin requests (CORS) validation**
- **MCP Inspector compatibility testing**
- **External client connection testing**

### Example Test Structure
```typescript
describe('Allegro Order Tools', () => {
  it('should retrieve order details with mock data', async () => {
    const server = createTestServer();
    const result = await server.callTool('get_order_details', {
      order_id: 'mock-order-123'
    });
    
    expect(result).toContain('mock-order-123');
    expect(result).toContain('READY_FOR_PROCESSING');
  });

  it('should be accessible via public SSE endpoint', async () => {
    const sseUrl = 'https://your-repl.repl.co/sse';
    const connection = await connectToSSE(sseUrl);
    
    expect(connection.status).toBe('connected');
    expect(connection.tools).toContain('get_order_details');
  });
});
```

This PRD focuses on delivering a working proof-of-concept with comprehensive mock data, enabling rapid development and testing without requiring production Allegro API access.