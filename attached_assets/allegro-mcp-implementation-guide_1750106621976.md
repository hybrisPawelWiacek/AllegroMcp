# AllegroMCP Implementation Reference Guide
## TypeScript FastMCP Patterns and Examples

---

## 1. Project Structure

```
src/
├── index.ts                 # Main server entry point
├── server.ts               # FastMCP server configuration
├── tools/
│   ├── index.ts            # Tool exports
│   ├── orders/
│   │   ├── index.ts        # Order tool exports
│   │   ├── monitor.ts      # Order event monitoring
│   │   ├── details.ts      # Order details retrieval
│   │   ├── status.ts       # Order status updates
│   │   └── shipping.ts     # Tracking management
│   ├── disputes/
│   │   ├── index.ts        # Dispute tool exports
│   │   ├── list.ts         # List disputes
│   │   ├── details.ts      # Dispute details
│   │   ├── messages.ts     # Message management
│   │   └── attachments.ts  # File handling
│   └── returns/
│       ├── index.ts        # Return tool exports
│       ├── details.ts      # Return information
│       ├── process.ts      # Return decisions
│       └── refunds.ts      # Refund processing
├── mock/
│   ├── index.ts            # Mock data exports
│   ├── orders.ts           # Order mock data
│   ├── disputes.ts         # Dispute mock data
│   └── returns.ts          # Return mock data
├── types/
│   ├── allegro.ts          # Allegro API types
│   └── common.ts           # Common type definitions
└── utils/
    ├── logger.ts           # Logging utilities
    └── errors.ts           # Error handling
```

---

## 2. Main Server Setup

### src/index.ts
```typescript
import { FastMCP } from 'fastmcp';
import { createAllegroServer } from './server.js';
import { config } from 'dotenv';

config();

async function main() {
  const server = createAllegroServer();
  
  // Configure for public SSE access
  const port = parseInt(process.env.PORT || '8000');
  
  console.log('🚀 Starting AllegroMCP Server...');
  console.log(`📡 SSE endpoint will be available at: http://localhost:${port}/sse`);
  
  await server.start({
    transportType: 'sse',
    sse: {
      endpoint: '/sse',
      port: port
    }
  });
  
  console.log('✅ AllegroMCP Server is running and publicly accessible!');
}

main().catch(console.error);
```

### src/server.ts
```typescript
import { FastMCP } from 'fastmcp';
import { getAllegroTools } from './tools/index.js';

export function createAllegroServer(): FastMCP {
  const server = new FastMCP({
    name: 'allegro-mcp',
    version: '1.0.0',
    instructions: `
AllegroMCP provides AI agents with comprehensive access to Allegro e-commerce operations.

Available capabilities:
- Order management and event monitoring
- Customer dispute resolution and communication  
- Return processing and refund management
- Real-time status updates and tracking

All tools use mock data for safe testing and demonstration.
    `.trim(),
    // No authenticate function = public access
  });

  // Register all Allegro tools
  const tools = getAllegroTools();
  tools.forEach(tool => {
    server.addTool(tool);
  });

  // Add server events for monitoring
  server.on('connect', (event) => {
    console.log(`🔗 Client connected: ${event.session?.id || 'unknown'}`);
  });

  server.on('disconnect', (event) => {
    console.log(`🔌 Client disconnected: ${event.session?.id || 'unknown'}`);
  });

  return server;
}
```

---

## 3. Tool Definition Patterns

### Basic Tool Structure
```typescript
import { z } from 'zod';
import type { Tool } from 'fastmcp';

export const getOrderDetailsTool: Tool = {
  name: 'get_order_details',
  description: 'Retrieve comprehensive order information by checkout form ID',
  parameters: z.object({
    order_id: z.string()
      .min(1, 'Order ID is required')
      .describe('Allegro checkout form ID (UUID format)')
  }),
  execute: async ({ order_id }, { session, reportProgress }) => {
    try {
      await reportProgress({ progress: 0, total: 100 });
      
      // Mock API call simulation
      await reportProgress({ progress: 50, total: 100 });
      const order = await fetchOrderFromMock(order_id);
      
      await reportProgress({ progress: 100, total: 100 });
      
      return formatOrderResponse(order);
    } catch (error) {
      throw new Error(`Failed to retrieve order ${order_id}: ${error.message}`);
    }
  }
};
```

### Tool with File Handling
```typescript
import { imageContent } from 'fastmcp';

export const uploadDisputeAttachmentTool: Tool = {
  name: 'upload_dispute_attachment',
  description: 'Upload attachment for dispute communication',
  parameters: z.object({
    dispute_id: z.string().uuid('Must be valid UUID'),
    file_name: z.string().min(1, 'File name required'),
    file_content: z.string().describe('Base64 encoded file content'),
    mime_type: z.string().default('image/png')
  }),
  execute: async ({ dispute_id, file_name, file_content, mime_type }) => {
    // Simulate attachment upload process
    const attachmentId = generateMockAttachmentId();
    
    // Store in mock database
    await storeMockAttachment({
      id: attachmentId,
      disputeId: dispute_id,
      fileName: file_name,
      mimeType: mime_type,
      uploadedAt: new Date().toISOString()
    });

    return {
      content: [
        {
          type: 'text',
          text: `Attachment uploaded successfully. ID: ${attachmentId}`
        },
        imageContent({
          buffer: Buffer.from(file_content, 'base64'),
          mimeType: mime_type
        })
      ]
    };
  }
};
```

---

## 4. Mock Data Implementation

### src/mock/orders.ts
```typescript
export interface MockOrder {
  id: string;
  status: 'NEW' | 'PROCESSING' | 'READY_FOR_SHIPMENT' | 'SENT';
  createdAt: string;
  buyer: {
    id: string;
    email: string;
    login: string;
    firstName: string;
    lastName: string;
  };
  lineItems: {
    id: string;
    offer: {
      id: string;
      name: string;
    };
    quantity: number;
    price: {
      amount: string;
      currency: 'PLN';
    };
  }[];
  delivery: {
    address: {
      street: string;
      city: string;
      postCode: string;
      countryCode: 'PL';
    };
  };
}

// Mock data generator
export function generateMockOrder(orderId?: string): MockOrder {
  const id = orderId || generateUUID();
  
  return {
    id,
    status: randomChoice(['NEW', 'PROCESSING', 'READY_FOR_SHIPMENT', 'SENT']),
    createdAt: new Date().toISOString(),
    buyer: {
      id: generateUUID(),
      email: generatePolishEmail(),
      login: generatePolishLogin(),
      firstName: randomChoice(['Jan', 'Anna', 'Piotr', 'Katarzyna', 'Tomasz']),
      lastName: randomChoice(['Kowalski', 'Nowak', 'Wiśniewski', 'Wójcik'])
    },
    lineItems: [
      {
        id: generateUUID(),
        offer: {
          id: generateOfferId(),
          name: randomChoice([
            'iPhone 15 Pro 128GB',
            'Samsung Galaxy S24',
            'Laptop Dell Inspiron',
            'Książka "Wiedźmin"',
            'Bluza Nike Air'
          ])
        },
        quantity: randomInt(1, 3),
        price: {
          amount: (randomInt(50, 2000)).toString() + '.00',
          currency: 'PLN'
        }
      }
    ],
    delivery: {
      address: {
        street: `ul. ${randomChoice(['Marszałkowska', 'Krakowska', 'Warszawska'])} ${randomInt(1, 200)}`,
        city: randomChoice(['Warszawa', 'Kraków', 'Gdańsk', 'Wrocław', 'Poznań']),
        postCode: generatePolishPostCode(),
        countryCode: 'PL'
      }
    }
  };
}

// Mock data store (in-memory with Replit DB fallback)
class MockOrderStore {
  private orders = new Map<string, MockOrder>();
  
  async getOrder(orderId: string): Promise<MockOrder | null> {
    if (this.orders.has(orderId)) {
      return this.orders.get(orderId)!;
    }
    
    // Generate new mock order if not found
    const order = generateMockOrder(orderId);
    this.orders.set(orderId, order);
    return order;
  }
  
  async updateOrderStatus(orderId: string, status: MockOrder['status']): Promise<MockOrder> {
    const order = await this.getOrder(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }
    
    order.status = status;
    this.orders.set(orderId, order);
    return order;
  }
}

export const mockOrderStore = new MockOrderStore();
```

### src/mock/disputes.ts
```typescript
export interface MockDispute {
  id: string;
  subject: { name: string };
  status: 'ONGOING' | 'CLOSED' | 'UNRESOLVED';
  messagesStatus: 'NEW' | 'BUYER_REPLIED' | 'SELLER_REPLIED';
  buyer: {
    id: string;
    login: string;
  };
  checkoutForm: {
    id: string;
    createdAt: string;
  };
  messages: MockDisputeMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface MockDisputeMessage {
  id: string;
  text: string;
  type: 'REGULAR' | 'END_REQUEST';
  author: {
    login: string;
    role: 'BUYER' | 'SELLER' | 'ALLEGRO_ADVISOR';
  };
  attachment?: {
    fileName: string;
    url: string;
  };
  createdAt: string;
}

export function generateMockDispute(disputeId?: string): MockDispute {
  const id = disputeId || generateUUID();
  const orderId = generateUUID();
  
  return {
    id,
    subject: { 
      name: randomChoice([
        'przedmiot jest uszkodzony',
        'nie otrzymałem zamówienia', 
        'produkt nie zgodny z opisem',
        'problem z płatnością',
        'opóźnienie w dostawie'
      ])
    },
    status: randomChoice(['ONGOING', 'CLOSED', 'UNRESOLVED']),
    messagesStatus: randomChoice(['NEW', 'BUYER_REPLIED', 'SELLER_REPLIED']),
    buyer: {
      id: generateUUID(),
      login: generatePolishLogin()
    },
    checkoutForm: {
      id: orderId,
      createdAt: new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000).toISOString()
    },
    messages: generateMockMessages(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function generateMockMessages(): MockDisputeMessage[] {
  const messageCount = randomInt(1, 5);
  const messages: MockDisputeMessage[] = [];
  
  for (let i = 0; i < messageCount; i++) {
    messages.push({
      id: generateUUID(),
      text: randomChoice([
        'Witam, mam problem z zamówieniem.',
        'Produkt przyszedł uszkodzony.',
        'Dziękuję za kontakt, sprawdzę sprawę.',
        'Przepraszam za niedogodności.',
        'Problem został rozwiązany.'
      ]),
      type: 'REGULAR',
      author: {
        login: i % 2 === 0 ? 'buyer_login' : 'seller_login',
        role: i % 2 === 0 ? 'BUYER' : 'SELLER'
      },
      createdAt: new Date(Date.now() - (messageCount - i) * 60 * 60 * 1000).toISOString()
    });
  }
  
  return messages;
}
```

---

## 5. Tool Implementation Examples

### Order Management Tool
```typescript
// src/tools/orders/details.ts
import { z } from 'zod';
import { mockOrderStore } from '../../mock/orders.js';
import type { Tool } from 'fastmcp';

export const getOrderDetailsTool: Tool = {
  name: 'get_order_details',
  description: 'Retrieve comprehensive order information including buyer details, items, and delivery information',
  parameters: z.object({
    order_id: z.string()
      .min(1, 'Order ID cannot be empty')
      .describe('Allegro checkout form ID (order identifier)')
  }),
  execute: async ({ order_id }, { reportProgress }) => {
    try {
      await reportProgress({ progress: 25, total: 100 });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      await reportProgress({ progress: 75, total: 100 });
      
      const order = await mockOrderStore.getOrder(order_id);
      if (!order) {
        throw new Error(`Order ${order_id} not found`);
      }
      
      await reportProgress({ progress: 100, total: 100 });
      
      // Format response for AI consumption
      return `📦 **Order Details**

**Order ID:** ${order.id}
**Status:** ${order.status}
**Created:** ${new Date(order.createdAt).toLocaleString('pl-PL')}

**👤 Buyer Information:**
- Name: ${order.buyer.firstName} ${order.buyer.lastName}
- Email: ${order.buyer.email}
- Login: ${order.buyer.login}

**📋 Items:**
${order.lineItems.map(item => 
  `- ${item.offer.name} (${item.quantity}x) - ${item.price.amount} ${item.price.currency}`
).join('\n')}

**🚚 Delivery Address:**
${order.delivery.address.street}
${order.delivery.address.postCode} ${order.delivery.address.city}

**Total Value:** ${order.lineItems.reduce((sum, item) => 
  sum + parseFloat(item.price.amount) * item.quantity, 0
).toFixed(2)} PLN`;
    } catch (error) {
      throw new Error(`Failed to retrieve order details: ${error.message}`);
    }
  }
};
```

### Dispute Management Tool
```typescript
// src/tools/disputes/list.ts
import { z } from 'zod';
import { mockDisputeStore } from '../../mock/disputes.js';
import type { Tool } from 'fastmcp';

export const listDisputesTool: Tool = {
  name: 'list_disputes',
  description: 'Retrieve all customer disputes with filtering options',
  parameters: z.object({
    status: z.enum(['ONGOING', 'CLOSED', 'UNRESOLVED']).optional()
      .describe('Filter disputes by status'),
    limit: z.number().min(1).max(100).default(20)
      .describe('Maximum number of disputes to return'),
    offset: z.number().min(0).default(0)
      .describe('Number of disputes to skip for pagination')
  }),
  execute: async ({ status, limit, offset }, { reportProgress }) => {
    try {
      await reportProgress({ progress: 30, total: 100 });
      
      const disputes = await mockDisputeStore.getDisputes({ status, limit, offset });
      
      await reportProgress({ progress: 100, total: 100 });
      
      if (disputes.length === 0) {
        return '📭 No disputes found matching the criteria.';
      }
      
      let response = `🎫 **Found ${disputes.length} Dispute(s)**\n\n`;
      
      disputes.forEach((dispute, index) => {
        response += `**${index + 1}. ${dispute.subject.name}**
- ID: ${dispute.id}
- Status: ${dispute.status} (${dispute.messagesStatus})
- Buyer: ${dispute.buyer.login}
- Order: ${dispute.checkoutForm.id}
- Created: ${new Date(dispute.createdAt).toLocaleString('pl-PL')}
- Messages: ${dispute.messages.length}

`;
      });
      
      return response;
    } catch (error) {
      throw new Error(`Failed to retrieve disputes: ${error.message}`);
    }
  }
};
```

---

## 6. Error Handling Patterns

### src/utils/errors.ts
```typescript
export class AllegroAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'AllegroAPIError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function handleToolError(error: unknown): string {
  if (error instanceof AllegroAPIError) {
    return `❌ Allegro API Error: ${error.message} (Code: ${error.errorCode || 'Unknown'})`;
  }
  
  if (error instanceof ValidationError) {
    return `⚠️ Validation Error: ${error.message}${error.field ? ` (Field: ${error.field})` : ''}`;
  }
  
  if (error instanceof Error) {
    return `💥 Error: ${error.message}`;
  }
  
  return '💥 An unexpected error occurred';
}
```

### Error Handling in Tools
```typescript
export const updateOrderStatusTool: Tool = {
  name: 'update_order_status',
  description: 'Update order fulfillment status',
  parameters: z.object({
    order_id: z.string().min(1),
    status: z.enum(['NEW', 'PROCESSING', 'READY_FOR_SHIPMENT', 'SENT'])
  }),
  execute: async ({ order_id, status }, { reportProgress }) => {
    try {
      await reportProgress({ progress: 25, total: 100 });
      
      // Validate order exists
      const order = await mockOrderStore.getOrder(order_id);
      if (!order) {
        throw new AllegroAPIError(`Order ${order_id} not found`, 404, 'ORDER_NOT_FOUND');
      }
      
      await reportProgress({ progress: 75, total: 100 });
      
      // Update status
      const updatedOrder = await mockOrderStore.updateOrderStatus(order_id, status);
      
      await reportProgress({ progress: 100, total: 100 });
      
      return `✅ Order ${order_id} status updated to ${status}
      
**Previous Status:** ${order.status}
**New Status:** ${updatedOrder.status}
**Updated At:** ${new Date().toLocaleString('pl-PL')}`;
      
    } catch (error) {
      const errorMessage = handleToolError(error);
      throw new Error(errorMessage);
    }
  }
};
```

---

## 7. Testing Patterns

### Test Setup
```typescript
// tests/setup.ts
import { beforeEach, afterEach } from 'vitest';
import { FastMCP } from 'fastmcp';
import { createAllegroServer } from '../src/server.js';

let testServer: FastMCP;

beforeEach(async () => {
  testServer = createAllegroServer();
  // Reset mock data before each test
  await resetMockData();
});

afterEach(async () => {
  if (testServer) {
    await testServer.stop();
  }
});

export { testServer };
```

### Tool Testing
```typescript
// tests/tools/orders.test.ts
import { describe, it, expect } from 'vitest';
import { testServer } from '../setup.js';

describe('Order Management Tools', () => {
  it('should retrieve order details with valid ID', async () => {
    const result = await testServer.tools.get('get_order_details')?.execute(
      { order_id: 'test-order-123' },
      { 
        session: {},
        reportProgress: async () => {},
        log: async () => {}
      }
    );
    
    expect(result).toContain('Order Details');
    expect(result).toContain('test-order-123');
    expect(result).toContain('PLN');
  });
  
  it('should handle invalid order ID gracefully', async () => {
    await expect(
      testServer.tools.get('get_order_details')?.execute(
        { order_id: '' },
        { session: {}, reportProgress: async () => {}, log: async () => {} }
      )
    ).rejects.toThrow('Order ID cannot be empty');
  });
});
```

### SSE Endpoint Testing
```typescript
// tests/sse.test.ts
import { describe, it, expect } from 'vitest';
import { EventSource } from 'eventsource';

describe('SSE Public Endpoint', () => {
  it('should accept connections without authentication', async () => {
    const eventSource = new EventSource('http://localhost:8000/sse');
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 5000);
      
      eventSource.onopen = () => {
        clearTimeout(timeout);
        eventSource.close();
        resolve(true);
      };
      
      eventSource.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };
    });
  });
});
```

---

## 8. Deployment Configuration

### package.json
```json
{
  "name": "allegro-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  },
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
    "tsx": "^4.7.0",
    "eslint": "^8.57.0",
    "prettier": "^3.2.0"
  }
}
```

### Replit Configuration
```toml
# .replit
modules = ["nodejs-20"]

[nix]
channel = "stable-24_05"

[[ports]]
localPort = 8000
externalPort = 80

[deployment]
run = ["npm", "run", "build", "&&", "npm", "start"]
deploymentTarget = "cloudrun"

[env]
NODE_ENV = "production"
USE_MOCK_API = "true"
```

---

## 9. Key Implementation Notes

### Transport Configuration
```typescript
// For public SSE access (main deployment)
server.start({
  transportType: 'sse',
  sse: {
    endpoint: '/sse',
    port: 8000
  }
});

// For n8n integration (alternative)
server.start({
  transportType: 'httpStream',
  httpStream: {
    endpoint: '/mcp',
    port: 8080
  }
});
```

### Mock Data Persistence
```typescript
// Use Replit Database for persistence across restarts
import Database from '@replit/database';
const db = new Database();

async function persistMockData(key: string, data: any) {
  await db.set(`mock:${key}`, JSON.stringify(data));
}

async function loadMockData(key: string) {
  const data = await db.get(`mock:${key}`);
  return data ? JSON.parse(data) : null;
}
```

### Progress Reporting
```typescript
// Always use progress reporting for better UX
execute: async (params, { reportProgress }) => {
  await reportProgress({ progress: 0, total: 100 });
  
  // Step 1: Validation
  await reportProgress({ progress: 25, total: 100 });
  
  // Step 2: Data fetching
  await reportProgress({ progress: 75, total: 100 });
  
  // Step 3: Complete
  await reportProgress({ progress: 100, total: 100 });
  
  return result;
}
```

---

This reference guide provides the foundational patterns needed to implement the complete AllegroMCP server. The implementing AI agent should follow these patterns while building out all 12 tools according to the PRD specifications.