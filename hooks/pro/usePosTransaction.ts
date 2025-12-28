
import { useState } from 'react';
import { PaymentMethodType, Order, OrderStatus, TableConfig } from '../../types';
import { roundFinance } from '../../shared/utils/mathEngine';
import { storageService } from '../../services/storageService';

interface UsePosTransactionProps {
    cashierRegistry: any;
    loyaltySystem: any;
    cart: any[];
    customerData: any;
    selectedTableId: string | null;
    tablesConfig: TableConfig[];
    saveSession: any;
    closeSession: any;
    clearCheckout: () => void;
    setCart: (cart: any[]) => void;
    setSelectedIndices: (indices: number[]) => void;
    setPosMode: (mode: 'QUICK' | 'TABLES' | 'DELIVERY') => void;
}

export const usePosTransaction = ({
    cashierRegistry,
    loyaltySystem,
    cart,
    customerData,
    selectedTableId,
    tablesConfig,
    saveSession,
    closeSession,
    clearCheckout,
    setCart,
    setSelectedIndices,
    setPosMode
}: UsePosTransactionProps) => {
    const { registerTransaction } = cashierRegistry;
    const { debitPoints, creditPoints, updateCustomerStats } = loyaltySystem;

    // Financial Configuration State
    const [serviceFee, setServiceFee] = useState(0);
    const [serviceFeeType, setServiceFeeType] = useState<'BRL' | 'PERCENT'>('BRL');
    const [coverCharge, setCoverCharge] = useState(0);
    const [coverChargeType, setCoverChargeType] = useState<'BRL' | 'PERCENT'>('BRL');
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState<'BRL' | 'PERCENT'>('BRL');
    const [splitCount, setSplitCount] = useState(1);
    const [showExtraOptions, setShowExtraOptions] = useState(false);

    // Modal States
    const [paymentState, setPaymentState] = useState<{ subtotal: number, serviceFee: number, coverCharge: number, indices?: number[] } | null>(null);
    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);

    // Logic: Process Standard Payment (Quick Sale or Table)
    const processPaymentSuccess = (
        payments: Record<string, number>, 
        meta: { receivedAmount: number, changeAmount: number, customerName: string, customerWhatsapp: string, isDelivery: boolean, pointsUsed: number }
    ) => {
        const methodsArray = Object.entries(payments).map(([method, amount]) => ({
            method: method as PaymentMethodType,
            amount
        }));
        
        const totalSaleValue = roundFinance(meta.receivedAmount - meta.changeAmount);
        
        // Calculate gross for points (ignoring discounts for earning rules)
        let grossTotalForPoints = totalSaleValue; 
        if (paymentState) {
            grossTotalForPoints = paymentState.subtotal + paymentState.serviceFee + paymentState.coverCharge;
        }

        const description = selectedTableId 
            ? `Fechamento Mesa ${tablesConfig.find(t => t.id === selectedTableId)?.number}`
            : `Venda Rápida - ${meta.customerName || 'Geral'}`;

        // 1. Cashier Register
        registerTransaction('SALE', methodsArray, description, meta);
        
        // 2. Loyalty Processing
        if (meta.customerWhatsapp) {
            if (meta.pointsUsed > 0) debitPoints(meta.customerWhatsapp, meta.pointsUsed);
            if (grossTotalForPoints > 0) creditPoints(meta.customerWhatsapp, grossTotalForPoints);
            updateCustomerStats(meta.customerName, meta.customerWhatsapp, totalSaleValue);
        }

        // 3. Create Order Logic with Smart Dispatch
        const originType = selectedTableId ? 'MESA' : 'BALCAO';
        
        // Determinando items a serem processados (Parcial vs Total)
        const itemsToProcess = paymentState?.indices 
            ? cart.filter((_, idx) => paymentState.indices!.includes(idx)) 
            : [...cart];

        // Regra de Despacho Inteligente:
        // Se houver PELO MENOS UM item que requer preparo -> PENDING (Cozinha)
        // Se TODOS os itens forem prontos (needsPreparation: false) -> DELIVERED (Concluído)
        const hasPrepItems = itemsToProcess.some(item => item.needsPreparation === true);
        const initialStatus = hasPrepItems ? OrderStatus.PENDING : OrderStatus.DELIVERED;

        const newOrder: Order = {
            id: `ORD-POS-${Math.floor(Math.random() * 100000)}`,
            customerName: meta.customerName,
            customerWhatsapp: meta.customerWhatsapp,
            items: itemsToProcess,
            total: totalSaleValue,
            subtotal: paymentState?.subtotal,
            deliveryFee: 0,
            status: initialStatus,
            origin: originType,
            timestamp: new Date(),
            address: 'Balcão',
            tableNumber: selectedTableId ? tablesConfig.find(t => t.id === selectedTableId)?.number : undefined,
            paymentMethod: Object.keys(payments).join(', '),
            // Se for concluído direto, marcamos deliveredAt
            deliveredAt: initialStatus === OrderStatus.DELIVERED ? new Date() : undefined
        };
        
        storageService.addOrder(newOrder);

        // 4. Session/Cart Cleanup
        if (paymentState?.indices) {
            // Partial Payment Logic
            const indicesToRemove = paymentState.indices;
            const newCart = cart.filter((_, idx) => !indicesToRemove.includes(idx));
            if (selectedTableId) {
                const tableNum = tablesConfig.find(t => t.id === selectedTableId)?.number || '';
                saveSession(selectedTableId, tableNum, meta.customerName, newCart, meta.customerWhatsapp);
            }
            setCart(newCart);
            setSelectedIndices([]);
        } else {
            // Full Payment Logic
            if (selectedTableId) closeSession(selectedTableId);
            clearCheckout();
            setSelectedIndices([]);
        }
        setPaymentState(null);
    };

    // Logic: Process Delivery
    const handleDeliveryComplete = (orderData: any) => {
        // Regra de Despacho Inteligente para Delivery:
        const hasPrepItems = cart.some(item => item.needsPreparation === true);
        const initialStatus = hasPrepItems ? OrderStatus.PENDING : OrderStatus.DELIVERED;

        // 1. Create Order (Kitchen/Dispatch)
        const newOrder: Order = {
            id: `ORD-POS-DEL-${Math.floor(Math.random() * 100000)}`,
            customerName: `${orderData.customer.name} (PDV)`, 
            customerWhatsapp: orderData.customer.whatsapp,
            pointsUsed: orderData.customer.pointsUsed,
            items: [...cart],
            total: orderData.payment.total,
            subtotal: orderData.payment.subtotal,
            deliveryFee: orderData.delivery.fee,
            discount: orderData.payment.discount, 
            status: initialStatus,
            origin: 'DELIVERY',
            timestamp: new Date(),
            address: orderData.customer.address,
            isDelivery: true,
            driverName: orderData.delivery.driverName !== 'A definir' ? orderData.delivery.driverName : undefined,
            paymentMethod: orderData.payment.method,
            deliveredAt: initialStatus === OrderStatus.DELIVERED ? new Date() : undefined
        };
        
        storageService.addOrder(newOrder);

        // 2. Financial Register
        const methodsArray = [{ method: orderData.payment.method as PaymentMethodType, amount: orderData.payment.total }];
        registerTransaction('SALE', methodsArray, `Venda Delivery PDV - ${orderData.customer.name}`, { 
            receivedAmount: orderData.payment.total, 
            changeAmount: 0 
        });

        // 3. Loyalty
        if (orderData.customer.whatsapp) {
            if (orderData.customer.pointsUsed > 0) debitPoints(orderData.customer.whatsapp, orderData.customer.pointsUsed);
            updateCustomerStats(orderData.customer.name, orderData.customer.whatsapp, orderData.payment.subtotal);
        }

        clearCheckout();
        setIsDeliveryModalOpen(false);
        setPosMode('QUICK');
    };

    return {
        serviceFee, setServiceFee,
        serviceFeeType, setServiceFeeType,
        coverCharge, setCoverCharge,
        coverChargeType, setCoverChargeType,
        discount, setDiscount,
        discountType, setDiscountType,
        splitCount, setSplitCount,
        showExtraOptions, setShowExtraOptions,
        paymentState, setPaymentState,
        isDeliveryModalOpen, setIsDeliveryModalOpen,
        processPaymentSuccess,
        handleDeliveryComplete
    };
};