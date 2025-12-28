
import { Order, TableSession, CartItem, OrderStatus } from '../../types';
import { KEYS } from './keys';
import { INITIAL_PRODUCTS } from '../../constants';

const dispatchEvents = () => {
    window.dispatchEvent(new Event('storage-update'));
    window.dispatchEvent(new Event('storage'));
};

// Helper para gerar mocks de vendas se o storage estiver vazio
const generateMockOrders = (): Order[] => {
    const paymentMethods = ['PIX', 'Cartão de Crédito', 'Dinheiro', 'Cartão de Débito', 'PIX', 'Cartão de Crédito', 'Dinheiro', 'Cartão de Débito', 'PIX', 'Dinheiro'];
    const statuses = [OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.DELIVERED];
    const now = new Date();

    return Array.from({ length: 10 }, (_, i) => {
        const itemIndex = i % INITIAL_PRODUCTS.length;
        const product = INITIAL_PRODUCTS[itemIndex];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const total = product.price * quantity;

        return {
            id: `MOCK-ORD-${1000 + i}`,
            customerName: `Cliente Teste ${i + 1}`,
            customerWhatsapp: `(11) 99999-000${i}`,
            items: [{ ...product, quantity, selectedExtras: [] }],
            total: total,
            subtotal: total,
            deliveryFee: 0,
            status: statuses[i],
            timestamp: new Date(now.getTime() - (i * 3600000)), // Espalha 1 pedido por hora
            address: 'Balcão / Retirada',
            paymentMethod: paymentMethods[i],
            tableNumber: i % 3 === 0 ? undefined : `${i + 1}`,
            isDelivery: i % 4 === 0
        };
    });
};

export const orderService = {
    // --- PEDIDOS ---
    saveOrders: (orders: Order[]) => {
        try { 
            localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders)); 
            dispatchEvents();
        } catch (e) {}
    },

    loadOrders: (): Order[] => {
        try {
            const data = localStorage.getItem(KEYS.ORDERS);
            if (!data) {
                // Injeta Mocks se vazio
                const mocks = generateMockOrders();
                localStorage.setItem(KEYS.ORDERS, JSON.stringify(mocks));
                return mocks;
            }
            const parsed = JSON.parse(data);
            return parsed.map((o: any) => ({ ...o, timestamp: new Date(o.timestamp) }));
        } catch (e) { return []; }
    },

    addOrder: (order: Order) => {
        const orders = orderService.loadOrders();
        orders.unshift(order);
        orderService.saveOrders(orders);
    },

    updateOrder: (updatedOrder: Order) => {
        const orders = orderService.loadOrders();
        const index = orders.findIndex(o => o.id === updatedOrder.id);
        if (index > -1) {
            orders[index] = updatedOrder;
            orderService.saveOrders(orders);
        }
    },

    // --- MESAS ---
    saveActiveOrders: (sessions: Record<string, TableSession>) => {
        try { 
            localStorage.setItem(KEYS.ACTIVE_TABLES, JSON.stringify(sessions)); 
            dispatchEvents();
        } catch (e) {}
    },

    loadActiveOrders: (): Record<string, TableSession> => {
        try {
            const data = localStorage.getItem(KEYS.ACTIVE_TABLES);
            if (!data) return {};
            const parsed = JSON.parse(data);
            Object.values(parsed).forEach((session: any) => { if (session.openedAt) session.openedAt = new Date(session.openedAt); });
            return parsed;
        } catch (e) { return {}; }
    },

    // --- POS RASCUNHO ---
    savePosDraft: (cart: CartItem[], customer: { name: string; whatsapp: string }) => {
        localStorage.setItem(KEYS.POS_DRAFT, JSON.stringify({ cart, customer }));
        dispatchEvents();
    },

    loadPosDraft: (): { cart: CartItem[], customer: { name: string; whatsapp: string } } | null => {
        const data = localStorage.getItem(KEYS.POS_DRAFT);
        return data ? JSON.parse(data) : null;
    }
};
