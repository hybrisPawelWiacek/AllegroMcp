import type { AllegroOrder, AllegroOrderEvent, AllegroShipment } from '../types/allegro.js';
import type { PolishAddress, PolishPersonalData, PolishCarrier } from '../types/common.js';
import { logger } from '../utils/logger.js';

// Polish mock data constants
const POLISH_FIRST_NAMES = ['Jan', 'Anna', 'Piotr', 'Katarzyna', 'Tomasz', 'Agnieszka', 'Krzysztof', 'Małgorzata', 'Andrzej', 'Barbara'];
const POLISH_LAST_NAMES = ['Kowalski', 'Nowak', 'Wiśniewski', 'Wójcik', 'Kowalczyk', 'Kamiński', 'Lewandowski', 'Zieliński', 'Szymański', 'Woźniak'];
const POLISH_CITIES = ['Warszawa', 'Kraków', 'Gdańsk', 'Wrocław', 'Poznań', 'Łódź', 'Katowice', 'Lublin', 'Szczecin', 'Bydgoszcz'];
const POLISH_STREETS = ['Marszałkowska', 'Krakowska', 'Warszawska', 'Piłsudskiego', 'Sienkiewicza', 'Mickiewicza', 'Słowackiego', 'Kościuszki'];
const POLISH_PRODUCTS = [
  'iPhone 15 Pro 128GB Titanium Blue',
  'Samsung Galaxy S24 256GB Phantom Black',
  'Laptop Dell Inspiron 15 3000',
  'Książka "Wiedźmin" - Andrzej Sapkowski',
  'Bluza Nike Air Max Essential',
  'Słuchawki Sony WH-1000XM5',
  'Smartwatch Garmin Venu 3',
  'Kamera Canon EOS R50',
  'Tablet iPad Air 10.9"',
  'Perfumy Chanel No. 5'
];
const POLISH_CARRIERS: PolishCarrier[] = ['InPost', 'DPD', 'DHL', 'UPS', 'Poczta Polska', 'GLS'];

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)] as T;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function generatePolishPostCode(): string {
  const first = randomInt(10, 99).toString().padStart(2, '0');
  const second = randomInt(100, 999).toString().padStart(3, '0');
  return `${first}-${second}`;
}

function generatePolishPhone(): string {
  return `+48 ${randomInt(500, 999)} ${randomInt(100, 999)} ${randomInt(100, 999)}`;
}

function generatePolishPersonalData(): PolishPersonalData {
  const firstName = randomChoice(POLISH_FIRST_NAMES);
  const lastName = randomChoice(POLISH_LAST_NAMES);
  const login = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
  const email = `${login}@example.pl`;
  
  return {
    firstName,
    lastName,
    login,
    email,
    phoneNumber: generatePolishPhone()
  };
}

function generatePolishAddress(): PolishAddress {
  return {
    street: `ul. ${randomChoice(POLISH_STREETS)} ${randomInt(1, 200)}`,
    city: randomChoice(POLISH_CITIES),
    postCode: generatePolishPostCode(),
    countryCode: 'PL'
  };
}

function generateMockOrder(orderId?: string): AllegroOrder {
  const id = orderId || generateUUID();
  const buyer = generatePolishPersonalData();
  const address = generatePolishAddress();
  const createdAt = new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000).toISOString();
  
  const lineItems = Array.from({ length: randomInt(1, 3) }, () => ({
    id: generateUUID(),
    offer: {
      id: generateUUID(),
      name: randomChoice(POLISH_PRODUCTS),
      external: { id: `EXT-${randomInt(1000, 9999)}` },
      isAllegroStandardProgram: Math.random() > 0.5
    },
    quantity: randomInt(1, 3),
    originalPrice: {
      amount: (randomInt(50, 2000)).toFixed(2),
      currency: 'PLN' as const
    },
    price: {
      amount: (randomInt(50, 2000)).toFixed(2),
      currency: 'PLN' as const
    },
    reconciliation: {
      value: {
        amount: (randomInt(50, 2000)).toFixed(2),
        currency: 'PLN' as const
      },
      type: 'REGULAR' as const
    },
    boughtAt: createdAt
  }));

  return {
    id,
    status: randomChoice(['NEW', 'PROCESSING', 'READY_FOR_SHIPMENT', 'SENT', 'DELIVERED'] as const),
    createdAt,
    updatedAt: new Date().toISOString(),
    buyer: {
      id: generateUUID(),
      email: buyer.email,
      login: buyer.login,
      firstName: buyer.firstName,
      lastName: buyer.lastName,
      guest: false
    },
    payment: {
      id: generateUUID(),
      type: randomChoice(['ONLINE', 'WIRE_TRANSFER', 'CASH_ON_DELIVERY'] as const),
      provider: randomChoice(['PAYU', 'P24', 'ALLEGRO_PAY'] as const),
      finishedAt: createdAt,
      paidAmount: {
        amount: lineItems.reduce((sum, item) => sum + parseFloat(item.price.amount) * item.quantity, 0).toFixed(2),
        currency: 'PLN'
      }
    },
    fulfillment: {
      status: randomChoice(['NEW', 'PROCESSING', 'READY_FOR_SHIPMENT', 'SENT'] as const),
      shipmentSummary: {
        lineItemsSent: lineItems.reduce((sum, item) => sum + item.quantity, 0)
      }
    },
    delivery: {
      method: {
        id: generateUUID(),
        name: 'Kurier standardowy'
      },
      cost: {
        amount: randomInt(10, 30).toFixed(2),
        currency: 'PLN'
      },
      time: {
        from: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        to: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      smart: Math.random() > 0.7,
      calculatedNumberOfPackages: 1,
      address: {
        firstName: buyer.firstName,
        lastName: buyer.lastName,
        street: address.street,
        city: address.city,
        postCode: address.postCode,
        countryCode: address.countryCode,
        phoneNumber: buyer.phoneNumber
      }
    },
    lineItems,
    surcharges: [
      {
        id: generateUUID(),
        type: 'DELIVERY_FEE',
        name: 'Koszt dostawy',
        value: {
          amount: randomInt(10, 30).toFixed(2),
          currency: 'PLN'
        }
      }
    ],
    discounts: [],
    marketplace: {
      id: 'allegro-pl'
    }
  };
}

function generateOrderEvent(): AllegroOrderEvent {
  return {
    id: generateUUID(),
    type: randomChoice(['ORDER_STATUS_CHANGED', 'FULFILLMENT_STATUS_CHANGED', 'PAYMENT_STATUS_CHANGED'] as const),
    order: {
      checkoutForm: {
        id: generateUUID()
      }
    },
    occurredAt: new Date().toISOString()
  };
}

class MockOrderStore {
  private orders = new Map<string, AllegroOrder>();
  private events: AllegroOrderEvent[] = [];
  private shipments = new Map<string, AllegroShipment[]>();

  constructor() {
    // Pre-populate with some orders
    for (let i = 0; i < 10; i++) {
      const order = generateMockOrder();
      this.orders.set(order.id, order);
    }

    // Generate initial events
    for (let i = 0; i < 20; i++) {
      this.events.push(generateOrderEvent());
    }

    logger.info(`Mock order store initialized with ${this.orders.size} orders and ${this.events.length} events`);
  }

  async getOrder(orderId: string): Promise<AllegroOrder | null> {
    let order = this.orders.get(orderId);
    if (!order) {
      // Generate new order if not found
      order = generateMockOrder(orderId);
      this.orders.set(orderId, order);
      logger.debug(`Generated new mock order: ${orderId}`);
    }
    return order;
  }

  async listOrders(limit: number = 20, offset: number = 0): Promise<{ orders: AllegroOrder[], totalCount: number }> {
    const allOrders = Array.from(this.orders.values());
    const orders = allOrders.slice(offset, offset + limit);
    return { orders, totalCount: allOrders.length };
  }

  async updateOrderStatus(orderId: string, status: AllegroOrder['status']): Promise<AllegroOrder> {
    const order = await this.getOrder(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();
    
    // Update fulfillment status based on order status
    if (status === 'PROCESSING') {
      order.fulfillment.status = 'PROCESSING';
    } else if (status === 'READY_FOR_SHIPMENT') {
      order.fulfillment.status = 'READY_FOR_SHIPMENT';
    } else if (status === 'SENT') {
      order.fulfillment.status = 'SENT';
    }

    this.orders.set(orderId, order);
    
    // Generate status change event
    this.events.push({
      id: generateUUID(),
      type: 'ORDER_STATUS_CHANGED',
      order: { checkoutForm: { id: orderId } },
      occurredAt: new Date().toISOString()
    });

    logger.info(`Updated order ${orderId} status to ${status}`);
    return order;
  }

  async addShipment(orderId: string, carrierName: string, trackingNumber: string, lineItemIds: string[]): Promise<AllegroShipment> {
    const order = await this.getOrder(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const shipment: AllegroShipment = {
      id: generateUUID(),
      waybill: trackingNumber,
      carrierId: generateUUID(),
      carrierName,
      lineItems: lineItemIds.map(id => ({
        id,
        quantity: 1
      })),
      createdAt: new Date().toISOString()
    };

    const orderShipments = this.shipments.get(orderId) || [];
    orderShipments.push(shipment);
    this.shipments.set(orderId, orderShipments);

    // Update order status to SENT
    await this.updateOrderStatus(orderId, 'SENT');

    logger.info(`Added shipment for order ${orderId}: ${trackingNumber}`);
    return shipment;
  }

  async getEvents(fromEventId?: string, limit: number = 100): Promise<AllegroOrderEvent[]> {
    // Generate some new events periodically
    if (Math.random() < 0.3) {
      this.events.push(generateOrderEvent());
    }

    let events = this.events;
    
    if (fromEventId) {
      const fromIndex = events.findIndex(e => e.id === fromEventId);
      if (fromIndex >= 0) {
        events = events.slice(fromIndex + 1);
      }
    }

    return events.slice(0, limit);
  }

  async getShipments(orderId: string): Promise<AllegroShipment[]> {
    return this.shipments.get(orderId) || [];
  }
}

export const mockOrderStore = new MockOrderStore();
