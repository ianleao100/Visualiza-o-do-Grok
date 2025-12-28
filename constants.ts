
import { Product, Order, OrderStatus, ProductExtra, RiderProfile, CustomerProfile } from './types';

// Theme Configuration
export const THEME_COLORS = {
    primary: '#EA2831',
    secondary: '#1e1b2e',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    backgroundLight: '#f8f6f6',
    backgroundDark: '#211111',
};

export const CATEGORIES = ['Individual', 'Equipe', 'Eventos'];

export const GLOBAL_EXTRAS: ProductExtra[] = [
    { id: 'bacon', name: 'Bacon Crocante', price: 4.00, available: true },
    { id: 'cheese', name: 'Queijo Cheddar Extra', price: 3.50, available: true },
    { id: 'sauce', name: 'Molho Especial', price: 2.00, available: true },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Executivo: Grelhado Premium',
    description: 'Filé de frango grelhado, arroz integral, feijão e legumes. Perfeito para almoço individual no escritório.',
    price: 32.00,
    category: 'Individual',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    available: true,
    needsPreparation: true,
    prepTime: 20
  },
  {
    id: 'prod-2',
    name: 'Combo Team: 4 Smash Burgers',
    description: '4 Burgers artesanais + Porção de Batatas Grande. Ideal para almoço rápido em equipe.',
    price: 98.00,
    category: 'Equipe',
    imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    available: true,
    needsPreparation: true,
    prepTime: 30
  },
  {
    id: 'prod-3',
    name: 'Kit Reunião: 20 Salgados Mix',
    description: 'Coxinha, quibe e bolinho de queijo fresquinhos. Acompanha molho da casa.',
    price: 45.00,
    category: 'Eventos',
    imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    available: true,
    needsPreparation: true,
    prepTime: 15
  },
  {
    id: 'prod-4',
    name: 'Suco Natural Laranja 1L',
    description: 'Suco de laranja 100% natural, sem açúcar, embalagem para compartilhar.',
    price: 22.00,
    category: 'Eventos',
    imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    available: true,
    needsPreparation: false,
    prepTime: 5
  },
  {
    id: 'prod-5',
    name: 'Coffee Box: 10 Donuts Variados',
    description: 'Caixa especial para o café da tarde corporativo com 10 unidades artesanais.',
    price: 55.00,
    category: 'Eventos',
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    available: true,
    needsPreparation: false,
    prepTime: 0
  },
  {
    id: 'prod-6',
    name: 'Salada Bowl: Salmão e Quinoa',
    description: 'Opção leve e nutritiva com salmão grelhado, mix de folhas e molho cítrico.',
    price: 38.00,
    category: 'Individual',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    available: true,
    needsPreparation: true,
    prepTime: 15
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'João Silva (Empresa Tech)',
    address: 'Rua das Flores, 123 - Conjunto 402',
    items: [
      { ...INITIAL_PRODUCTS[0], quantity: 1 }
    ],
    total: 32.00,
    status: OrderStatus.DELIVERED,
    timestamp: new Date(Date.now() - 1000 * 60 * 120)
  },
  {
    id: 'ORD-002',
    customerName: 'RH Dreamlícias',
    address: 'Av. Paulista, 1000 - 15º Andar',
    items: [
      { ...INITIAL_PRODUCTS[1], quantity: 2 }
    ],
    total: 196.00,
    status: OrderStatus.DELIVERED,
    timestamp: new Date(Date.now() - 1000 * 60 * 60)
  }
];

export const MOCK_DRIVERS: RiderProfile[] = [
    { id: '1', name: 'Carlos Motoboy', status: 'AVAILABLE', dailyOrdersCount: 12, vehicleType: 'MOTO' },
    { id: '2', name: 'Marcos Silva', status: 'BUSY', dailyOrdersCount: 5, vehicleType: 'MOTO' },
    { id: '3', name: 'João Paulo', status: 'AVAILABLE', dailyOrdersCount: 11, vehicleType: 'MOTO' },
    { id: '4', name: 'André Bike', status: 'AVAILABLE', dailyOrdersCount: 8, vehicleType: 'BIKE' }
];

export const MOCK_CUSTOMERS: CustomerProfile[] = [
    {
        id: 'cust-joao',
        name: 'João Silva',
        whatsapp: '(11) 99999-0001',
        points: 800,
        totalSpent: 1250.00,
        lastOrderAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), 
        orderCount: 25,
        addresses: [{ id: 'addr-1', label: 'Casa', icon: 'home', street: 'Rua das Acácias', number: '100', district: 'Centro', complement: '', reference: '', lat: 0, lng: 0 }]
    },
    {
        id: 'cust-maria',
        name: 'Maria Oliveira',
        whatsapp: '(11) 99999-0002',
        points: 350,
        totalSpent: 540.00,
        lastOrderAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        orderCount: 12,
        addresses: [{ id: 'addr-2', label: 'Trabalho', icon: 'work', street: 'Av. Paulista', number: '500', district: 'Bela Vista', complement: '', reference: '', lat: 0, lng: 0 }]
    },
    {
        id: 'cust-pedro',
        name: 'Pedro Santos',
        whatsapp: '(11) 99999-0003',
        points: 50,
        totalSpent: 98.00,
        lastOrderAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
        orderCount: 3,
        addresses: [{ id: 'addr-3', label: 'Casa', icon: 'home', street: 'Rua Augusta', number: '200', district: 'Consolação', complement: '', reference: '', lat: 0, lng: 0 }]
    },
    {
        id: 'cust-ana',
        name: 'Ana Costa',
        whatsapp: '(11) 99999-0004',
        points: 120,
        totalSpent: 420.00,
        lastOrderAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        orderCount: 8,
        addresses: [{ id: 'addr-4', label: 'Apartamento', icon: 'home', street: 'Rua Oscar Freire', number: '10', district: 'Jardins', complement: '', reference: '', lat: 0, lng: 0 }]
    },
    {
        id: 'cust-lucas',
        name: 'Lucas Lima',
        whatsapp: '(11) 99999-0005',
        points: 10,
        totalSpent: 65.00,
        lastOrderAt: new Date(),
        orderCount: 1,
        addresses: [{ id: 'addr-5', label: 'Casa', icon: 'home', street: 'Rua Vergueiro', number: '900', district: 'Liberdade', complement: '', reference: '', lat: 0, lng: 0 }]
    }
];

export const MOCK_PROFESSIONALS = [
    { id: '1', name: 'João Silva' },
    { id: '2', name: 'Maria Oliveira' },
    { id: '3', name: 'Pedro Santos' }
];
