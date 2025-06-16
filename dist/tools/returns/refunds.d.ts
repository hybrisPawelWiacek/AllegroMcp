import type { AllegroRefund } from '../../types/allegro.js';
export interface RefundCalculation {
    itemsTotal: number;
    deliveryRefund: number;
    taxRefund: number;
    totalRefund: number;
    currency: 'PLN';
}
export interface RefundPolicy {
    returnPeriodDays: number;
    allowDeliveryRefund: boolean;
    restockingFee: number;
    categories: {
        [category: string]: {
            returnable: boolean;
            conditions: string[];
        };
    };
}
export declare const DEFAULT_REFUND_POLICY: RefundPolicy;
/**
 * Calculate refund amount based on line items and policy
 */
export declare function calculateRefundAmount(lineItems: Array<{
    price: string;
    quantity: number;
    taxRate?: number;
}>, deliveryCost?: string, includeDelivery?: boolean, restockingFeeRate?: number): RefundCalculation;
/**
 * Validate if a return is eligible based on policy
 */
export declare function validateReturnEligibility(orderDate: string, category: string, condition: 'new' | 'used' | 'damaged', policy?: RefundPolicy): {
    eligible: boolean;
    reasons: string[];
    warnings: string[];
};
/**
 * Generate refund timeline based on payment method
 */
export declare function getRefundTimeline(paymentMethod: string): {
    estimatedDays: number;
    description: string;
    steps: string[];
};
/**
 * Format refund details for customer communication
 */
export declare function formatRefundNotification(refund: AllegroRefund, calculation: RefundCalculation, timeline: ReturnType<typeof getRefundTimeline>): string;
/**
 * Calculate commission refund estimate
 */
export declare function calculateCommissionRefund(saleAmount: number, commissionRate?: number, quantity?: number): {
    originalCommission: number;
    refundAmount: number;
    currency: 'PLN';
};
/**
 * Validate refund request parameters
 */
export declare function validateRefundRequest(paymentId: string, lineItems: Array<{
    lineItemId: string;
    quantity: number;
    amount: string;
}>): {
    valid: boolean;
    errors: string[];
};
/**
 * Get refund status display information
 */
export declare function getRefundStatusInfo(status: string): {
    icon: string;
    message: string;
    actionRequired: boolean;
    customerMessage: string;
};
//# sourceMappingURL=refunds.d.ts.map