import type { AllegroReturn, AllegroRefund } from '../types/allegro.js';
import { logger } from '../utils/logger.js';

const RETURN_REASONS = [
  'Produkt nie spełnia oczekiwań',
  'Uszkodzony podczas transportu',
  'Błędnie zamówiony rozmiar',
  'Niezgodność z opisem',
  'Opóźnienie w dostawie',
  'Zmiana zdania kupującego',
  'Wada fabryczna produktu',
  'Niepełne akcesoria'
];

const REJECTION_REASONS = [
  'Przekroczony termin zwrotu',
  'Produkt był używany',
  'Brak oryginalnego opakowania',
  'Produkt jest niezdatny do zwrotu',
  'Niezgodne z polityką zwrotów'
];

const PRODUCT_NAMES = [
  'iPhone 15 Pro 128GB',
  'Samsung Galaxy S24',
  'Laptop Dell Inspiron',
  'Bluza Nike Air Max',
  'Słuchawki AirPods Pro',
  'Smartwatch Apple Watch',
  'Tablet iPad Air',
  'Kamera Canon EOS',
  'Perfumy Chanel',
  'Książka bestseller'
];

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

function generateTrackingNumber(): string {
  return `PL${randomInt(100000000, 999999999)}`;
}

function generateMockReturn(returnId?: string): AllegroReturn {
  const id = returnId || generateUUID();
  const itemCount = randomInt(1, 3);
  const lineItems = Array.from({ length: itemCount }, () => ({
    lineItemId: generateUUID(),
    name: randomChoice(PRODUCT_NAMES),
    imageUrl: `https://mock-images.example.com/${generateUUID()}.jpg`,
    quantity: {
      returned: randomInt(1, 2),
      unit: 'szt'
    },
    reason: {
      id: generateUUID(),
      returnReason: randomChoice(RETURN_REASONS),
      userComment: Math.random() > 0.5 ? 'Dodatkowy komentarz od kupującego' : undefined
    },
    marketplace: {
      id: 'allegro-pl'
    }
  }));

  const totalValue = lineItems.reduce((sum, item) => sum + randomInt(50, 500), 0);

  return {
    id,
    buyer: {
      id: generateUUID(),
      login: `buyer_${randomInt(1000, 9999)}`
    },
    parcel: {
      waybill: generateTrackingNumber(),
      carrierName: randomChoice(['InPost', 'DPD', 'Poczta Polska']),
      carrierTrackingUrl: `https://tracking.example.com/${generateTrackingNumber()}`
    },
    items: lineItems,
    refund: {
      value: {
        amount: totalValue.toFixed(2),
        currency: 'PLN'
      },
      items: lineItems.map(item => ({
        lineItemId: item.lineItemId,
        lineItemValue: {
          amount: randomInt(50, 500).toFixed(2),
          currency: 'PLN'
        }
      }))
    },
    createdAt: new Date(Date.now() - randomInt(1, 14) * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  };
}

class MockReturnStore {
  private returns = new Map<string, AllegroReturn>();
  private refunds = new Map<string, AllegroRefund>();
  private rejections = new Map<string, { reason: string; code: string; createdAt: string }>();

  constructor() {
    // Pre-populate with some returns
    for (let i = 0; i < 8; i++) {
      const returnItem = generateMockReturn();
      this.returns.set(returnItem.id, returnItem);
    }
    
    logger.info(`Mock return store initialized with ${this.returns.size} returns`);
  }

  async getReturn(returnId: string): Promise<AllegroReturn | null> {
    let returnItem = this.returns.get(returnId);
    if (!returnItem) {
      // Generate new return if not found
      returnItem = generateMockReturn(returnId);
      this.returns.set(returnId, returnItem);
      logger.debug(`Generated new mock return: ${returnId}`);
    }
    return returnItem;
  }

  async listReturns(limit: number = 20, offset: number = 0): Promise<{ returns: AllegroReturn[], totalCount: number }> {
    const allReturns = Array.from(this.returns.values());
    const returns = allReturns.slice(offset, offset + limit);
    return { returns, totalCount: allReturns.length };
  }

  async rejectReturn(returnId: string, reason: string, code: string): Promise<void> {
    const returnItem = await this.getReturn(returnId);
    if (!returnItem) {
      throw new Error(`Return ${returnId} not found`);
    }

    this.rejections.set(returnId, {
      reason,
      code,
      createdAt: new Date().toISOString()
    });

    logger.info(`Rejected return ${returnId}: ${reason}`);
  }

  async processRefund(paymentId: string, reason: string, lineItems: Array<{ lineItemId: string; quantity: number; amount: string }>): Promise<AllegroRefund> {
    const refund: AllegroRefund = {
      id: generateUUID(),
      payment: {
        id: paymentId
      },
      reason: {
        id: generateUUID(),
        name: reason
      },
      status: randomChoice(['PENDING', 'SUCCEEDED'] as const),
      value: {
        amount: lineItems.reduce((sum, item) => sum + parseFloat(item.amount), 0).toFixed(2),
        currency: 'PLN'
      },
      lineItems: lineItems.map(item => ({
        lineItemId: item.lineItemId,
        quantity: item.quantity,
        amount: {
          amount: item.amount,
          currency: 'PLN'
        }
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.refunds.set(refund.id, refund);
    logger.info(`Processed refund ${refund.id} for payment ${paymentId}`);
    return refund;
  }

  async requestCommissionRefund(lineItemId: string, quantity: number): Promise<string> {
    const claimId = generateUUID();
    
    // Simulate commission refund claim
    logger.info(`Created commission refund claim ${claimId} for line item ${lineItemId}`);
    return claimId;
  }

  async getRefund(refundId: string): Promise<AllegroRefund | null> {
    return this.refunds.get(refundId) || null;
  }

  async getRejection(returnId: string) {
    return this.rejections.get(returnId);
  }
}

export const mockReturnStore = new MockReturnStore();
