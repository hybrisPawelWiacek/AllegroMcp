import type { AllegroOrder, AllegroOrderEvent, AllegroShipment } from '../types/allegro.js';
declare class MockOrderStore {
    private orders;
    private events;
    private shipments;
    constructor();
    getOrder(orderId: string): Promise<AllegroOrder | null>;
    listOrders(limit?: number, offset?: number): Promise<{
        orders: AllegroOrder[];
        totalCount: number;
    }>;
    updateOrderStatus(orderId: string, status: AllegroOrder['status']): Promise<AllegroOrder>;
    addShipment(orderId: string, carrierName: string, trackingNumber: string, lineItemIds: string[]): Promise<AllegroShipment>;
    getEvents(fromEventId?: string, limit?: number): Promise<AllegroOrderEvent[]>;
    getShipments(orderId: string): Promise<AllegroShipment[]>;
}
export declare const mockOrderStore: MockOrderStore;
export {};
//# sourceMappingURL=orders.d.ts.map