
export enum UserRole {
  CLIENT = 'CLIENT',
  PROFESSIONAL = 'PROFESSIONAL',
  ADMIN = 'ADMIN',
  GUEST = 'GUEST',
  RIDER = 'RIDER'
}

// Entregador (Frota)
export interface RiderProfile {
  id: string;
  name: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  dailyOrdersCount: number; // Contador para equidade
  vehicleType?: 'MOTO' | 'BIKE' | 'CAR';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  available?: boolean;
  needsPreparation?: boolean; // Novo campo: Precisa de preparo na cozinha?
  prepTime?: number; // Novo campo: Tempo estimado em minutos
}

export interface ProductExtra {
  id: string;
  name: string;
  price: number;
  available: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedExtras?: { id: string; name: string; price: number }[];
  notes?: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',       
  CONFIRMED = 'CONFIRMED',   
  PREPARING = 'PREPARING',   
  DISPATCHED = 'DISPATCHED', 
  READY = 'READY',           
  DELIVERED = 'DELIVERED',   
  CANCELLED = 'CANCELLED',   
  SCHEDULED = 'SCHEDULED'    
}

export interface Order {
  id: string;
  customerName: string;
  customerWhatsapp?: string; // Identificador Único para Fidelidade
  pointsUsed?: number; // Pontos debitados neste pedido
  pointsEarned?: number; // Pontos a serem creditados
  items: CartItem[];
  total: number;
  status: OrderStatus;
  timestamp: Date;
  address: string;
  
  // Geolocation & Routing
  coordinates?: { lat: number; lng: number };
  sector?: 'NORTE' | 'SUL' | 'LESTE' | 'OESTE' | 'CENTRO';
  routeSequence?: number; // Ordem na rota de entrega
  
  // Novo Campo de Origem do Pedido
  origin?: 'MESA' | 'DELIVERY' | 'BALCAO';

  code?: string;
  subtotal?: number;
  deliveryFee?: number;
  discount?: number;
  paymentMethod?: string;
  scheduledTime?: string;
  tableNumber?: string;
  driverName?: string;
  isDelivery?: boolean;
  changeFor?: string;
  
  // Timestamps de Ciclo de Vida
  preparedAt?: Date;
  dispatchedAt?: Date;
  deliveredAt?: Date;
  
  // Review Data
  clientReview?: { rating: number, comment: string };
}

export type ViewState = 'LANDING' | 'CLIENT_MENU' | 'CLIENT_LOGIN' | 'PROFESSIONAL_LOGIN' | 'PROFESSIONAL_DASHBOARD' | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD' | 'RIDER_LOGIN' | 'RIDER_DASHBOARD';

export type ClientViewMode = 'MENU' | 'CART' | 'CHECKOUT_DELIVERY' | 'CHECKOUT_PAYMENT' | 'ORDERS' | 'PROFILE' | 'REVIEWS' | 'ORDER_TRACKING';

export interface AuthState {
  role: UserRole | null;
  isAuthenticated: boolean;
}

// Dados de Perfil do Cliente (Sessão do Cliente)
export interface UserProfile {
  fullName: string;
  whatsapp: string;
  email: string;
  photo: string;
  points: number;
  birthDate?: string;
  observations?: string; // Alergias ou preferências
}

// CRM: Dados do Cliente (Base de Dados Administrativa)
export interface CustomerProfile {
  id: string;
  name: string;
  whatsapp: string;
  points: number;
  totalSpent: number;
  lastOrderAt: Date;
  orderCount: number;
  addresses?: Address[];
  email?: string;
  photo?: string;
  birthDate?: string;     // NOVO
  observations?: string;  // NOVO
}

export interface Address {
  id: string;
  label: string;
  icon: string;
  street: string;
  number: string;
  district: string;
  complement: string;
  reference: string;
  lat: number;
  lng: number;
  cep?: string;
  city?: string;
}

export interface SavedCard {
  id: string;
  type: string;
  last4: string;
  holder: string;
}

export interface Review {
  id: string;
  userName: string;
  userImage: string;
  rating: number;
  date: string;
  comment: string;
  hasPhoto?: boolean;
}

export type ProTab = 'FINANCES' | 'POS' | 'KITCHEN' | 'MENU' | 'CUSTOMERS' | 'HISTORY' | 'ORDERS';
export type AdminTab = 'DASHBOARD' | 'MENU' | 'CRM' | 'REPORTS' | 'HISTORY' | 'FINANCIAL' | 'MARKETING' | 'SETTINGS';

export interface CashierSession {
  isOpen: boolean;
  openedAt?: Date;
  initialValue: number;
  responsibleName: string;
}

export interface CashierHistoryRecord {
  id: string;
  openedAt: Date;
  closedAt: Date;
  responsibleName: string;
  initialValue: number;
  finalSystemValue: number;
  finalRealValue: number;
  difference: number;
  status: 'OK' | 'SHORTAGE' | 'SURPLUS';
  transactions: CashTransaction[];
  summary: {
      sales: number;
      deposits: number;
      withdrawals: number;
      pix: number;
      card: number;
      cash: number;
  };
}

export type TransactionType = 'SALE' | 'WITHDRAWAL' | 'DEPOSIT';
export type PaymentMethodType = 'PIX' | 'CASH' | 'CREDIT' | 'DEBIT';

export interface CashTransaction {
  id: string;
  type: TransactionType;
  methods: { method: PaymentMethodType; amount: number }[];
  total: number;
  receivedAmount?: number;
  changeAmount?: number;
  timestamp: Date;
  description: string;
  responsible: string;
}

export interface TableConfig {
  id: string;
  number: string;
  description: string;
}

export interface TableSession {
  tableId: string;
  tableNumber: string;
  customerName: string;
  customerWhatsapp?: string;
  items: CartItem[];
  openedAt: Date;
  status: 'OPEN' | 'BILL_REQUESTED' | 'FREE';
}
