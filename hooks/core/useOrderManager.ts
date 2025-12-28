
import { useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '../../types';
import { orderService } from '../../services/storage/orderService';
import { useCustomerLoyalty } from '../useCustomerLoyalty';

export const useOrderManager = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const { creditPoints, handleOrderCancellation } = useCustomerLoyalty();

    const loadOrders = useCallback(() => {
        const loaded = orderService.loadOrders();
        // Sort by newest first
        setOrders(loaded.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    }, []);

    // Initial Load & Real-time Sync
    useEffect(() => {
        loadOrders();

        const handleUpdate = () => {
            loadOrders();
        };

        window.addEventListener('storage-update', handleUpdate);
        window.addEventListener('storage', handleUpdate);

        // Cleanup function obrigatória
        return () => {
            window.removeEventListener('storage-update', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, [loadOrders]);

    const updateOrderStatus = useCallback((order: Order, newStatus: OrderStatus, extraData?: Partial<Order>) => {
        const now = new Date();
        const updates: Partial<Order> = { ...extraData, status: newStatus };
        const grossTotal = (order.subtotal || order.total) + (order.deliveryFee || 0);

        // Lifecycle Timestamps
        if (newStatus === OrderStatus.PREPARING) updates.preparedAt = now;
        if (newStatus === OrderStatus.DISPATCHED) updates.dispatchedAt = now;
        
        // Completion Logic (Loyalty Credit)
        if (newStatus === OrderStatus.DELIVERED) {
            updates.deliveredAt = now;
            if (order.customerWhatsapp) {
                creditPoints(order.customerWhatsapp, grossTotal);
                updates.pointsEarned = Math.floor(grossTotal);
            }
        }

        // Cancellation Logic (Loyalty Rollback)
        if (newStatus === OrderStatus.CANCELLED) {
            if (order.customerWhatsapp) {
                const wasDelivered = order.status === OrderStatus.DELIVERED;
                const pointsUsed = order.pointsUsed || 0;
                const pointsEarned = order.pointsEarned || Math.floor(grossTotal);
                handleOrderCancellation(order.customerWhatsapp, pointsEarned, pointsUsed, wasDelivered);
            }
        }

        const updatedOrder = { ...order, ...updates };
        
        // Optimistic UI Update
        setOrders(prev => prev.map(o => o.id === order.id ? updatedOrder : o));
        
        // Persistence
        orderService.updateOrder(updatedOrder);
    }, [creditPoints, handleOrderCancellation]);

    return {
        orders,
        setOrders, // Exposed for filtering/sorting in UI
        loadOrders,
        updateOrderStatus
    };
};
