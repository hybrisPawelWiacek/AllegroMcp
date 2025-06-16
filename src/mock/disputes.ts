import type { AllegroDispute, AllegroDisputeMessage } from '../types/allegro.js';
import { logger } from '../utils/logger.js';

const DISPUTE_SUBJECTS = [
  'Przedmiot jest uszkodzony',
  'Nie otrzymałem zamówienia',
  'Produkt nie zgodny z opisem',
  'Problem z płatnością',
  'Opóźnienie w dostawie',
  'Złe rozmiary produktu',
  'Brak akcesoriów w zestawie',
  'Produkt nie działa prawidłowo'
];

const BUYER_MESSAGES = [
  'Witam, mam problem z moim zamówieniem.',
  'Produkt przyszedł uszkodzony, co mam zrobić?',
  'Zamówienie nie dotarło w przewidywanym terminie.',
  'Otrzymany produkt różni się od opisu na stronie.',
  'Proszę o kontakt w sprawie zwrotu.',
  'Czy mogę wymienić produkt na inny rozmiar?',
  'Produkt nie spełnia moich oczekiwań.',
  'Brakuje części w dostarczonym zestawie.'
];

const SELLER_MESSAGES = [
  'Dziękuję za kontakt, sprawdzę Państwa sprawę.',
  'Przepraszam za niedogodności, postaram się pomóc.',
  'Czy może Pan/Pani przesłać zdjęcia uszkodzonego produktu?',
  'Sprawdzę status Państwa przesyłki.',
  'Oczywiście możemy wymienić produkt.',
  'Proszę o podanie numeru zamówienia.',
  'Skontaktuję się z kurierem w tej sprawie.',
  'Problem został rozwiązany, dziękuję za cierpliwość.'
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

function generateMockDisputeMessages(disputeId: string): AllegroDisputeMessage[] {
  const messageCount = randomInt(1, 6);
  const messages: AllegroDisputeMessage[] = [];
  
  for (let i = 0; i < messageCount; i++) {
    const isBuyer = i % 2 === 0;
    messages.push({
      id: generateUUID(),
      text: randomChoice(isBuyer ? BUYER_MESSAGES : SELLER_MESSAGES),
      type: i === messageCount - 1 && Math.random() > 0.8 ? 'END_REQUEST' : 'REGULAR',
      author: {
        login: isBuyer ? `buyer_${randomInt(1000, 9999)}` : `seller_${randomInt(1000, 9999)}`,
        role: isBuyer ? 'BUYER' : 'SELLER'
      },
      createdAt: new Date(Date.now() - (messageCount - i) * 60 * 60 * 1000).toISOString()
    });
  }
  
  return messages;
}

function generateMockDispute(disputeId?: string): AllegroDispute {
  const id = disputeId || generateUUID();
  const createdAt = new Date(Date.now() - randomInt(1, 14) * 24 * 60 * 60 * 1000).toISOString();
  
  return {
    id,
    subject: {
      id: generateUUID(),
      name: randomChoice(DISPUTE_SUBJECTS)
    },
    status: randomChoice(['ONGOING', 'CLOSED', 'UNRESOLVED'] as const),
    messagesStatus: randomChoice(['NEW', 'BUYER_REPLIED', 'SELLER_REPLIED'] as const),
    buyer: {
      id: generateUUID(),
      login: `buyer_${randomInt(1000, 9999)}`
    },
    checkoutForm: {
      id: generateUUID(),
      createdAt: new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000).toISOString()
    },
    createdAt,
    updatedAt: new Date().toISOString()
  };
}

class MockDisputeStore {
  private disputes = new Map<string, AllegroDispute>();
  private disputeMessages = new Map<string, AllegroDisputeMessage[]>();
  private attachments = new Map<string, { id: string; fileName: string; disputeId: string; uploadedAt: string }>();

  constructor() {
    // Pre-populate with some disputes
    for (let i = 0; i < 15; i++) {
      const dispute = generateMockDispute();
      this.disputes.set(dispute.id, dispute);
      this.disputeMessages.set(dispute.id, generateMockDisputeMessages(dispute.id));
    }
    
    logger.info(`Mock dispute store initialized with ${this.disputes.size} disputes`);
  }

  async listDisputes(limit: number = 20, offset: number = 0): Promise<{ disputes: AllegroDispute[], totalCount: number }> {
    const allDisputes = Array.from(this.disputes.values());
    const disputes = allDisputes.slice(offset, offset + limit);
    return { disputes, totalCount: allDisputes.length };
  }

  async getDispute(disputeId: string): Promise<AllegroDispute | null> {
    let dispute = this.disputes.get(disputeId);
    if (!dispute) {
      // Generate new dispute if not found
      dispute = generateMockDispute(disputeId);
      this.disputes.set(disputeId, dispute);
      this.disputeMessages.set(disputeId, generateMockDisputeMessages(disputeId));
      logger.debug(`Generated new mock dispute: ${disputeId}`);
    }
    return dispute;
  }

  async getDisputeMessages(disputeId: string): Promise<AllegroDisputeMessage[]> {
    const dispute = await this.getDispute(disputeId);
    if (!dispute) {
      throw new Error(`Dispute ${disputeId} not found`);
    }
    
    return this.disputeMessages.get(disputeId) || [];
  }

  async sendDisputeMessage(disputeId: string, messageText: string, attachmentId?: string): Promise<AllegroDisputeMessage> {
    const dispute = await this.getDispute(disputeId);
    if (!dispute) {
      throw new Error(`Dispute ${disputeId} not found`);
    }

    const message: AllegroDisputeMessage = {
      id: generateUUID(),
      text: messageText,
      type: 'REGULAR',
      author: {
        login: `seller_${randomInt(1000, 9999)}`,
        role: 'SELLER'
      },
      createdAt: new Date().toISOString()
    };

    if (attachmentId && this.attachments.has(attachmentId)) {
      const attachment = this.attachments.get(attachmentId)!;
      message.attachment = {
        fileName: attachment.fileName,
        url: `https://mock-attachments.example.com/${attachmentId}`
      };
    }

    const messages = this.disputeMessages.get(disputeId) || [];
    messages.push(message);
    this.disputeMessages.set(disputeId, messages);

    // Update dispute status
    dispute.messagesStatus = 'SELLER_REPLIED';
    dispute.updatedAt = new Date().toISOString();
    this.disputes.set(disputeId, dispute);

    logger.info(`Added message to dispute ${disputeId}`);
    return message;
  }

  async uploadAttachment(disputeId: string, fileName: string, fileContent: string): Promise<string> {
    const dispute = await this.getDispute(disputeId);
    if (!dispute) {
      throw new Error(`Dispute ${disputeId} not found`);
    }

    const attachmentId = generateUUID();
    this.attachments.set(attachmentId, {
      id: attachmentId,
      fileName,
      disputeId,
      uploadedAt: new Date().toISOString()
    });

    logger.info(`Uploaded attachment ${fileName} for dispute ${disputeId}`);
    return attachmentId;
  }

  async getAttachment(attachmentId: string) {
    return this.attachments.get(attachmentId);
  }
}

export const mockDisputeStore = new MockDisputeStore();
