
/**
 * MATH ENGINE (Motor Matemático)
 * Fonte Única de Verdade para o Ecossistema DeliveryMaster.
 * 
 * Regras:
 * 1. Todos os cálculos financeiros devem passar por roundFinance().
 * 2. Nenhuma formatação visual deve ser feita manualmente.
 */

import { Order } from '../../types';

export const POINT_VALUE = 0.05; // R$ 0,05 por ponto

// STORE LOCATION (Mock Central Point - Praça da Sé, SP)
const STORE_COORDS = { lat: -23.550520, lng: -46.633308 };

/**
 * Arredonda qualquer valor para 2 casas decimais com precisão segura.
 * Resolve o problema de 0.1 + 0.2 = 0.300000004
 */
export const roundFinance = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

/**
 * Calcula o valor do desconto baseado em pontos
 */
export const calculatePointsDiscount = (points: number): number => {
    return roundFinance(points * POINT_VALUE);
};

/**
 * Formata para Real Brasileiro (R$ 0,00)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Máscara de Telefone (WhatsApp)
 */
export const maskPhone = (value: string): string => {
  if (!value) return "";
  let v = value.replace(/\D/g, "");
  v = v.substring(0, 11);
  if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
  if (v.length > 9) v = v.replace(/(\d)(\d{4})$/, "$1-$2");
  return v;
};

/**
 * Máscara de Data (DD/MM/AAAA)
 */
export const maskDate = (value: string): string => {
  if (!value) return "";
  let v = value.replace(/\D/g, "");
  if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, "$1/$2");
  if (v.length > 5) v = v.replace(/^(\d{2})\/(\d{2})(\d)/g, "$1/$2/$3");
  return v.substring(0, 10);
};

/**
 * Verifica se a data (DD/MM/AAAA) é o aniversário de hoje
 */
export const isTodayBirthday = (dateString?: string): boolean => {
  if (!dateString || dateString.length < 5) return false;
  const today = new Date();
  const [day, month] = dateString.split('/');
  
  return parseInt(day) === today.getDate() && parseInt(month) === (today.getMonth() + 1);
};

/**
 * Calcula taxa (Fixa ou %)
 */
export const calculateFee = (subtotal: number, value: number, type: 'BRL' | 'PERCENT'): number => {
  const result = type === 'PERCENT' ? (subtotal * (value / 100)) : value;
  return roundFinance(result);
};

/**
 * Calcula total final da venda
 */
export const calculateFinalTotal = (
  subtotal: number,
  serviceFee: number,
  coverCharge: number,
  discount: number
): number => {
  const total = subtotal + serviceFee + coverCharge - discount;
  return roundFinance(Math.max(0, total));
};

/**
 * Calcula proporção para divisão de itens
 */
export const calculateProportional = (totalTaxValue: number, totalSubtotal: number, partSubtotal: number): number => {
  if (totalSubtotal <= 0) return 0;
  const ratio = partSubtotal / totalSubtotal;
  return roundFinance(totalTaxValue * ratio);
};

/**
 * Verifica se a conta está paga (aceita erro de 1 centavo para mais ou menos)
 */
export const isEffectivelyPaid = (balance: number): boolean => {
  return balance >= -0.01;
};

/**
 * Calcula troco
 */
export const calculateChange = (paidAmount: number, totalAmount: number): number => {
  const diff = paidAmount - totalAmount;
  return diff > 0.01 ? roundFinance(diff) : 0;
};

// --- KPI & ANALYTICS ENGINE (iFood Standard) ---

/**
 * Calcula o Ticket Médio
 * Fórmula: Receita Total / Número de Pedidos
 */
export const calculateAverageTicket = (totalRevenue: number, totalOrders: number): number => {
    if (totalOrders === 0) return 0;
    return roundFinance(totalRevenue / totalOrders);
};

/**
 * Calcula a Taxa de Cancelamento
 * Fórmula: (Pedidos Cancelados / Total de Pedidos) * 100
 */
export const calculateCancellationRate = (totalOrders: number, cancelledOrders: number): number => {
    if (totalOrders === 0) return 0;
    return roundFinance((cancelledOrders / totalOrders) * 100);
};

/**
 * Calcula o Crescimento Percentual (Mês a Mês ou Período a Período)
 * Fórmula: ((Atual - Anterior) / Anterior) * 100
 */
export const calculateGrowthRate = (currentValue: number, previousValue: number): number => {
    if (previousValue === 0) return currentValue > 0 ? 100 : 0;
    return roundFinance(((currentValue - previousValue) / previousValue) * 100);
};

/**
 * Calcula a Frequência de Compra por Cliente
 * Fórmula: Total de Pedidos / Total de Clientes Únicos no período
 */
export const calculatePurchaseFrequency = (orders: Order[]): number => {
    if (orders.length === 0) return 0;
    
    const uniqueCustomers = new Set();
    orders.forEach(order => {
        // Usa WhatsApp como ID principal, fallback para nome
        const customerId = order.customerWhatsapp || order.customerName;
        if (customerId) uniqueCustomers.add(customerId);
    });

    const totalCustomers = uniqueCustomers.size;
    if (totalCustomers === 0) return 0;

    return roundFinance(orders.length / totalCustomers);
};

/**
 * Calcula a Receita Total de uma lista de pedidos
 */
export const calculateTotalRevenue = (orders: Order[]): number => {
    return roundFinance(orders.reduce((acc, order) => acc + order.total, 0));
};

// --- GEOSPATIAL LOGIC ---

/**
 * Calcula distância entre dois pontos (Haversine Formula) em KM
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

/**
 * Determina o setor geográfico baseado na loja
 */
export const getSector = (lat: number, lng: number): 'NORTE' | 'SUL' | 'LESTE' | 'OESTE' | 'CENTRO' => {
    const latDiff = lat - STORE_COORDS.lat;
    const lngDiff = lng - STORE_COORDS.lng;
    
    // Pequena margem para considerar centro
    if (Math.abs(latDiff) < 0.005 && Math.abs(lngDiff) < 0.005) return 'CENTRO';

    // Lógica simplificada de quadrantes
    if (Math.abs(latDiff) > Math.abs(lngDiff)) {
        return latDiff > 0 ? 'NORTE' : 'SUL';
    } else {
        return lngDiff > 0 ? 'LESTE' : 'OESTE';
    }
};

/**
 * Otimizador de Rota (Algoritmo Vizinho Mais Próximo)
 */
export const optimizeRoute = (orders: any[]): any[] => {
    if (orders.length <= 1) return orders;

    const route = [];
    let currentPos = STORE_COORDS;
    const pool = [...orders];

    while (pool.length > 0) {
        let nearestIndex = -1;
        let minDistance = Infinity;

        // Encontra o pedido mais próximo da posição atual
        for (let i = 0; i < pool.length; i++) {
            const order = pool[i];
            const dist = calculateDistance(
                currentPos.lat, 
                currentPos.lng, 
                order.coordinates?.lat || STORE_COORDS.lat, 
                order.coordinates?.lng || STORE_COORDS.lng
            );
            
            if (dist < minDistance) {
                minDistance = dist;
                nearestIndex = i;
            }
        }

        if (nearestIndex !== -1) {
            const nextOrder = pool[nearestIndex];
            route.push(nextOrder);
            // Atualiza posição atual para o pedido encontrado
            if (nextOrder.coordinates) {
                currentPos = nextOrder.coordinates;
            }
            pool.splice(nearestIndex, 1);
        } else {
            break;
        }
    }

    return route;
};
