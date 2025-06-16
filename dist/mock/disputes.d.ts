import type { AllegroDispute, AllegroDisputeMessage } from '../types/allegro.js';
declare class MockDisputeStore {
    private disputes;
    private disputeMessages;
    private attachments;
    constructor();
    listDisputes(limit?: number, offset?: number): Promise<{
        disputes: AllegroDispute[];
        totalCount: number;
    }>;
    getDispute(disputeId: string): Promise<AllegroDispute | null>;
    getDisputeMessages(disputeId: string): Promise<AllegroDisputeMessage[]>;
    sendDisputeMessage(disputeId: string, messageText: string, attachmentId?: string): Promise<AllegroDisputeMessage>;
    uploadAttachment(disputeId: string, fileName: string, fileContent: string): Promise<string>;
    getAttachment(attachmentId: string): Promise<{
        id: string;
        fileName: string;
        disputeId: string;
        uploadedAt: string;
    } | undefined>;
}
export declare const mockDisputeStore: MockDisputeStore;
export {};
//# sourceMappingURL=disputes.d.ts.map