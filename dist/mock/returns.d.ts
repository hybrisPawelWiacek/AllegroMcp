import type { AllegroReturn, AllegroRefund } from '../types/allegro.js';
declare class MockReturnStore {
    private returns;
    private refunds;
    private rejections;
    constructor();
    getReturn(returnId: string): Promise<AllegroReturn | null>;
    listReturns(limit?: number, offset?: number): Promise<{
        returns: AllegroReturn[];
        totalCount: number;
    }>;
    rejectReturn(returnId: string, reason: string, code: string): Promise<void>;
    processRefund(paymentId: string, reason: string, lineItems: Array<{
        lineItemId: string;
        quantity: number;
        amount: string;
    }>): Promise<AllegroRefund>;
    requestCommissionRefund(lineItemId: string, quantity: number): Promise<string>;
    getRefund(refundId: string): Promise<AllegroRefund | null>;
    getRejection(returnId: string): Promise<{
        reason: string;
        code: string;
        createdAt: string;
    } | undefined>;
}
export declare const mockReturnStore: MockReturnStore;
export {};
//# sourceMappingURL=returns.d.ts.map