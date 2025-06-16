export interface AllegroOrder {
    id: string;
    status: 'NEW' | 'PROCESSING' | 'READY_FOR_SHIPMENT' | 'SENT' | 'DELIVERED' | 'CANCELLED';
    messageToSeller?: string;
    createdAt: string;
    updatedAt: string;
    buyer: {
        id: string;
        email: string;
        login: string;
        firstName?: string;
        lastName?: string;
        companyName?: string;
        guest: boolean;
        personalIdentity?: string;
    };
    payment: {
        id: string;
        type: 'CASH_ON_DELIVERY' | 'WIRE_TRANSFER' | 'ONLINE';
        provider: 'PAYU' | 'P24' | 'ALLEGRO_PAY' | 'CASH_ON_DELIVERY';
        finishedAt?: string;
        paidAmount: {
            amount: string;
            currency: 'PLN';
        };
    };
    fulfillment: {
        status: 'NEW' | 'PROCESSING' | 'READY_FOR_SHIPMENT' | 'SENT';
        shipmentSummary?: {
            lineItemsSent: number;
        };
    };
    delivery: {
        method: {
            id: string;
            name: string;
        };
        cost: {
            amount: string;
            currency: 'PLN';
        };
        time: {
            from?: string;
            to?: string;
            guaranteed?: {
                from: string;
                to: string;
            };
        };
        smart?: boolean;
        calculatedNumberOfPackages?: number;
        address: {
            firstName: string;
            lastName: string;
            street: string;
            city: string;
            postCode: string;
            countryCode: 'PL';
            companyName?: string;
            phoneNumber?: string;
        };
        pickupPoint?: {
            id: string;
            name: string;
            description: string;
            address: {
                street: string;
                city: string;
                postCode: string;
                countryCode: 'PL';
            };
        };
    };
    invoice?: {
        required: boolean;
        address?: {
            company?: {
                name: string;
                taxId: string;
            };
            naturalPerson?: {
                firstName: string;
                lastName: string;
            };
            address: {
                street: string;
                city: string;
                postCode: string;
                countryCode: 'PL';
            };
        };
    };
    lineItems: AllegroLineItem[];
    surcharges: AllegroSurcharge[];
    discounts: AllegroDiscount[];
    note?: string;
    marketplace: {
        id: string;
    };
}
export interface AllegroLineItem {
    id: string;
    offer: {
        id: string;
        name: string;
        external?: {
            id: string;
        };
        isAllegroStandardProgram: boolean;
    };
    quantity: number;
    originalPrice: {
        amount: string;
        currency: 'PLN';
    };
    price: {
        amount: string;
        currency: 'PLN';
    };
    reconciliation: {
        value: {
            amount: string;
            currency: 'PLN';
        };
        type: 'REGULAR' | 'ALLEGRO_COINS' | 'COUPON';
    };
    selectedAdditionalServices?: {
        definitionId: string;
        name: string;
        price: {
            amount: string;
            currency: 'PLN';
        };
    }[];
    boughtAt: string;
}
export interface AllegroSurcharge {
    id: string;
    type: 'ALLEGRO_DELIVERY_SMART' | 'DELIVERY_FEE';
    name: string;
    value: {
        amount: string;
        currency: 'PLN';
    };
}
export interface AllegroDiscount {
    type: 'COUPON' | 'ALLEGRO_COINS' | 'CAMPAIGN_DISCOUNT';
    name?: string;
    value: {
        amount: string;
        currency: 'PLN';
    };
}
export interface AllegroDispute {
    id: string;
    subject: {
        id: string;
        name: string;
    };
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
    createdAt: string;
    updatedAt: string;
}
export interface AllegroDisputeMessage {
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
export interface AllegroReturn {
    id: string;
    buyer: {
        id: string;
        login: string;
    };
    parcel: {
        waybill: string;
        carrierName: string;
        carrierTrackingUrl: string;
    };
    items: {
        lineItemId: string;
        name: string;
        imageUrl?: string;
        quantity: {
            returned: number;
            unit: string;
        };
        reason: {
            id: string;
            returnReason: string;
            userComment?: string;
        };
        marketplace: {
            id: string;
        };
    }[];
    refund: {
        value: {
            amount: string;
            currency: 'PLN';
        };
        items: {
            lineItemId: string;
            lineItemValue: {
                amount: string;
                currency: 'PLN';
            };
        }[];
    };
    createdAt: string;
    updatedAt: string;
}
export interface AllegroOrderEvent {
    id: string;
    type: 'ORDER_STATUS_CHANGED' | 'FULFILLMENT_STATUS_CHANGED' | 'PAYMENT_STATUS_CHANGED' | 'DISPUTE_CREATED' | 'RETURN_CREATED';
    order: {
        checkoutForm: {
            id: string;
        };
    };
    occurredAt: string;
}
export interface AllegroShipment {
    id: string;
    waybill: string;
    carrierId: string;
    carrierName: string;
    lineItems: {
        id: string;
        quantity: number;
    }[];
    createdAt: string;
}
export interface AllegroRefund {
    id: string;
    payment: {
        id: string;
    };
    reason: {
        id: string;
        name: string;
    };
    status: 'PENDING' | 'SUCCEEDED' | 'FAILED';
    value: {
        amount: string;
        currency: 'PLN';
    };
    lineItems: {
        lineItemId: string;
        quantity: number;
        amount: {
            amount: string;
            currency: 'PLN';
        };
    }[];
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=allegro.d.ts.map