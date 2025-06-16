import type { AllegroRefund } from '../../types/allegro.js';

// Utility functions for refund processing and calculations

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

// Standard Polish e-commerce refund policy
export const DEFAULT_REFUND_POLICY: RefundPolicy = {
  returnPeriodDays: 14,
  allowDeliveryRefund: true,
  restockingFee: 0,
  categories: {
    'Electronics': {
      returnable: true,
      conditions: ['Original packaging required', 'No signs of use', 'All accessories included']
    },
    'Clothing': {
      returnable: true,
      conditions: ['Tags attached', 'No wear or damage', 'Hygienic condition']
    },
    'Books': {
      returnable: true,
      conditions: ['No damage', 'No writing or highlighting']
    },
    'Software': {
      returnable: false,
      conditions: ['Digital products non-returnable after download']
    },
    'Food': {
      returnable: false,
      conditions: ['Perishable goods non-returnable']
    },
    'Personalized': {
      returnable: false,
      conditions: ['Custom-made items non-returnable']
    }
  }
};

/**
 * Calculate refund amount based on line items and policy
 */
export function calculateRefundAmount(
  lineItems: Array<{
    price: string;
    quantity: number;
    taxRate?: number;
  }>,
  deliveryCost: string = '0.00',
  includeDelivery: boolean = false,
  restockingFeeRate: number = 0
): RefundCalculation {
  const itemsTotal = lineItems.reduce((sum, item) => {
    return sum + (parseFloat(item.price) * item.quantity);
  }, 0);

  const deliveryRefund = includeDelivery ? parseFloat(deliveryCost) : 0;
  
  // Calculate tax refund (typically 23% VAT in Poland)
  const taxRefund = itemsTotal * 0.23;

  // Apply restocking fee if applicable
  const restockingFee = itemsTotal * restockingFeeRate;
  
  const totalRefund = itemsTotal + deliveryRefund - restockingFee;

  return {
    itemsTotal: Math.round(itemsTotal * 100) / 100,
    deliveryRefund: Math.round(deliveryRefund * 100) / 100,
    taxRefund: Math.round(taxRefund * 100) / 100,
    totalRefund: Math.round(totalRefund * 100) / 100,
    currency: 'PLN'
  };
}

/**
 * Validate if a return is eligible based on policy
 */
export function validateReturnEligibility(
  orderDate: string,
  category: string,
  condition: 'new' | 'used' | 'damaged',
  policy: RefundPolicy = DEFAULT_REFUND_POLICY
): {
  eligible: boolean;
  reasons: string[];
  warnings: string[];
} {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let eligible = true;

  // Check return period
  const daysSinceOrder = Math.floor(
    (Date.now() - new Date(orderDate).getTime()) / (24 * 60 * 60 * 1000)
  );

  if (daysSinceOrder > policy.returnPeriodDays) {
    eligible = false;
    reasons.push(`Return period exceeded (${daysSinceOrder} days > ${policy.returnPeriodDays} days)`);
  }

  // Check category eligibility
  const categoryPolicy = policy.categories[category];
  if (categoryPolicy && !categoryPolicy.returnable) {
    eligible = false;
    reasons.push(`Category "${category}" is not returnable`);
    reasons.push(...categoryPolicy.conditions);
  }

  // Check condition
  if (condition === 'damaged' || condition === 'used') {
    warnings.push('Item condition may affect refund amount');
    if (policy.restockingFee > 0) {
      warnings.push(`Restocking fee of ${(policy.restockingFee * 100).toFixed(1)}% may apply`);
    }
  }

  return {
    eligible,
    reasons,
    warnings
  };
}

/**
 * Generate refund timeline based on payment method
 */
export function getRefundTimeline(paymentMethod: string): {
  estimatedDays: number;
  description: string;
  steps: string[];
} {
  const timelines = {
    'PAYU': {
      estimatedDays: 3,
      description: 'PayU refunds typically process within 2-3 business days',
      steps: [
        'Refund initiated in PayU system',
        'Bank processing (1-2 days)',
        'Funds appear in customer account'
      ]
    },
    'P24': {
      estimatedDays: 5,
      description: 'Przelewy24 refunds may take 3-5 business days',
      steps: [
        'Refund request sent to P24',
        'Bank verification process',
        'Inter-bank transfer processing',
        'Customer account credit'
      ]
    },
    'ALLEGRO_PAY': {
      estimatedDays: 2,
      description: 'Allegro Pay refunds are typically fastest',
      steps: [
        'Instant refund processing',
        'Account balance update',
        'Customer notification'
      ]
    },
    'CASH_ON_DELIVERY': {
      estimatedDays: 7,
      description: 'Cash on delivery refunds require manual processing',
      steps: [
        'Return item verification',
        'Manual refund processing',
        'Bank transfer initiation',
        'Customer payment (5-7 days)'
      ]
    }
  };

  return timelines[paymentMethod] || {
    estimatedDays: 5,
    description: 'Standard refund processing time',
    steps: [
      'Refund processing initiated',
      'Payment provider verification',
      'Bank transfer processing',
      'Customer account credit'
    ]
  };
}

/**
 * Format refund details for customer communication
 */
export function formatRefundNotification(
  refund: AllegroRefund,
  calculation: RefundCalculation,
  timeline: ReturnType<typeof getRefundTimeline>
): string {
  return `
🎉 Potwierdzenie zwrotu środków

Szanowni Państwo,
Z przyjemnością informujemy, że Państwa zwrot został pomyślnie przetworzony.

💰 SZCZEGÓŁY ZWROTU:
• Numer zwrotu: ${refund.id}
• Kwota zwrotu: ${calculation.totalRefund.toFixed(2)} PLN
• Data przetworzenia: ${new Date(refund.createdAt).toLocaleDateString('pl-PL')}

📋 ROZLICZENIE:
• Wartość produktów: ${calculation.itemsTotal.toFixed(2)} PLN
${calculation.deliveryRefund > 0 ? `• Koszt dostawy: ${calculation.deliveryRefund.toFixed(2)} PLN` : ''}
• RAZEM: ${calculation.totalRefund.toFixed(2)} PLN

⏰ CZAS REALIZACJI:
• Szacowany czas: ${timeline.estimatedDays} dni roboczych
• ${timeline.description}

📞 KONTAKT:
W razie pytań prosimy o kontakt przez platformę Allegro.

Dziękujemy za zaufanie!
Zespół Obsługi Klienta
`.trim();
}

/**
 * Calculate commission refund estimate
 */
export function calculateCommissionRefund(
  saleAmount: number,
  commissionRate: number = 0.08,
  quantity: number = 1
): {
  originalCommission: number;
  refundAmount: number;
  currency: 'PLN';
} {
  const originalCommission = saleAmount * commissionRate * quantity;
  const refundAmount = originalCommission;

  return {
    originalCommission: Math.round(originalCommission * 100) / 100,
    refundAmount: Math.round(refundAmount * 100) / 100,
    currency: 'PLN'
  };
}

/**
 * Validate refund request parameters
 */
export function validateRefundRequest(
  paymentId: string,
  lineItems: Array<{
    lineItemId: string;
    quantity: number;
    amount: string;
  }>
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate payment ID format
  if (!paymentId || paymentId.length < 10) {
    errors.push('Invalid payment ID format');
  }

  // Validate line items
  if (!lineItems || lineItems.length === 0) {
    errors.push('At least one line item must be specified');
  }

  lineItems.forEach((item, index) => {
    if (!item.lineItemId) {
      errors.push(`Line item ${index + 1}: Missing line item ID`);
    }
    
    if (!item.quantity || item.quantity < 1) {
      errors.push(`Line item ${index + 1}: Invalid quantity`);
    }
    
    if (!item.amount || !/^\d+\.\d{2}$/.test(item.amount)) {
      errors.push(`Line item ${index + 1}: Invalid amount format (use XX.XX)`);
    }
    
    const amount = parseFloat(item.amount);
    if (amount <= 0 || amount > 10000) {
      errors.push(`Line item ${index + 1}: Amount out of valid range`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get refund status display information
 */
export function getRefundStatusInfo(status: string): {
  icon: string;
  message: string;
  actionRequired: boolean;
  customerMessage: string;
} {
  const statusInfo = {
    'PENDING': {
      icon: '⏳',
      message: 'Refund is being processed',
      actionRequired: false,
      customerMessage: 'Twój zwrot jest obecnie przetwarzany. Środki pojawią się na koncie w ciągu 2-5 dni roboczych.'
    },
    'SUCCEEDED': {
      icon: '✅',
      message: 'Refund completed successfully',
      actionRequired: false,
      customerMessage: 'Zwrot został pomyślnie przetworzony. Środki powinny być już widoczne na Twoim koncie.'
    },
    'FAILED': {
      icon: '❌',
      message: 'Refund failed - manual intervention required',
      actionRequired: true,
      customerMessage: 'Wystąpił problem z przetwarzaniem zwrotu. Skontaktuj się z obsługą klienta.'
    }
  };

  return statusInfo[status] || {
    icon: '❓',
    message: 'Unknown refund status',
    actionRequired: true,
    customerMessage: 'Status zwrotu jest nieznany. Skontaktuj się z obsługą klienta.'
  };
}
