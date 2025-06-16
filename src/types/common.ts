export interface ApiResponse<T> {
  data: T;
  count?: number;
  totalCount?: number;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface ErrorResponse {
  errors: {
    code: string;
    message: string;
    details?: string;
    userMessage?: string;
  }[];
}

export interface MockStoreConfig {
  delayMs: number;
  errorRate: number;
  enableLogging: boolean;
}

export type MockEntityId = string;

export interface MockEntity {
  id: MockEntityId;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressReporter {
  reportProgress: (progress: { progress: number; total: number }) => Promise<void>;
}

export interface ToolExecutionContext {
  session?: {
    id: string;
  };
  reportProgress: (progress: { progress: number; total: number }) => Promise<void>;
}

// Polish-specific types for mock data generation
export interface PolishAddress {
  street: string;
  city: string;
  postCode: string; // Format: XX-XXX
  countryCode: 'PL';
}

export interface PolishPersonalData {
  firstName: string;
  lastName: string;
  email: string;
  login: string;
  phoneNumber?: string;
}

// Carriers operating in Poland
export type PolishCarrier = 
  | 'InPost'
  | 'DPD'
  | 'DHL'
  | 'UPS'
  | 'FedEx'
  | 'Poczta Polska'
  | 'GLS';

// Popular Polish product categories
export type PolishProductCategory =
  | 'Elektronika'
  | 'Dom i Ogród'
  | 'Moda'
  | 'Sport i Turystyka'
  | 'Motoryzacja'
  | 'Zdrowie i Uroda'
  | 'Dziecko'
  | 'Kultura i Rozrywka'
  | 'Allegro Smart';
