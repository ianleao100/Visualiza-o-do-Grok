
import { useMemo } from 'react';
import { Order, OrderStatus } from '../types';
import { storageService } from '../services/storageService';
import { roundFinance } from '../shared/utils/mathEngine';

export const useFinancialCalculations = (ordersInput?: Order[]) => {
    // Use provided orders or load from storage if not provided
    // Guarda de Nulos: Garante array vazio caso storage ou prop falhem para evitar crash
    const orders = useMemo(() => {
        return ordersInput ?? storageService.loadOrders() ?? [];
    }, [ordersInput]);

    // Filter valid sales (Delivered only for financial accuracy)
    const completedOrders = useMemo(() => {
        if (!orders || !Array.isArray(orders)) return [];
        return orders.filter(o => o.status === OrderStatus.DELIVERED);
    }, [orders]);

    // --- Basic KPIs ---
    const metrics = useMemo(() => {
        const totalRevenue = roundFinance(completedOrders.reduce((acc, o) => acc + (o.total || 0), 0));
        const totalCount = completedOrders.length;
        const avgTicket = totalCount > 0 ? roundFinance(totalRevenue / totalCount) : 0;
        
        return { totalRevenue, totalCount, avgTicket };
    }, [completedOrders]);

    // --- Breakdown by Payment Method ---
    const paymentBreakdown = useMemo(() => {
        const breakdown = {
            PIX: 0,
            CARD: 0, // Consolidated Credit + Debit
            CASH: 0,
            OTHER: 0
        };

        completedOrders.forEach(order => {
            const method = order.paymentMethod?.toUpperCase() || 'OTHER';
            const total = order.total || 0;
            
            if (method.includes('PIX')) breakdown.PIX += total;
            else if (method.includes('CARTÃO') || method.includes('CREDIT') || method.includes('DEBIT')) breakdown.CARD += total;
            else if (method.includes('DINHEIRO') || method.includes('CASH')) breakdown.CASH += total;
            else breakdown.OTHER += total;
        });

        return breakdown;
    }, [completedOrders]);

    // --- Breakdown by Channel (Delivery vs POS vs Tables) ---
    const channelBreakdown = useMemo(() => {
        const breakdown = {
            DELIVERY: 0,
            POS: 0,
            TABLES: 0
        };

        completedOrders.forEach(order => {
            if (order.isDelivery) breakdown.DELIVERY++;
            else if (order.tableNumber) breakdown.TABLES++;
            else breakdown.POS++;
        });

        return breakdown;
    }, [completedOrders]);

    // --- Recurrence Logic (Complex Calculation) ---
    const recurrenceDays = useMemo(() => {
        // 1. Group dates by customer
        const customerDates: Record<string, Date[]> = {};

        completedOrders.forEach(order => {
            const key = order.customerWhatsapp || order.customerName;
            if (!key) return;
            
            if (!customerDates[key]) {
                customerDates[key] = [];
            }
            if (order.timestamp) {
                customerDates[key].push(new Date(order.timestamp));
            }
        });

        let totalAvgGap = 0;
        let customersWithRecurrenceCount = 0;

        // 2. Calculate individual averages
        Object.values(customerDates).forEach(dates => {
            if (dates.length < 2) return;

            dates.sort((a, b) => a.getTime() - b.getTime());

            const firstOrder = dates[0].getTime();
            const lastOrder = dates[dates.length - 1].getTime();
            
            const totalDaysSpan = (lastOrder - firstOrder) / (1000 * 60 * 60 * 24);
            const numberOfGaps = dates.length - 1;
            
            const avgGap = totalDaysSpan / numberOfGaps;
            
            totalAvgGap += avgGap;
            customersWithRecurrenceCount++;
        });

        // 3. Global Average
        if (customersWithRecurrenceCount > 0) {
            return Math.round(totalAvgGap / customersWithRecurrenceCount);
        }
        return 0;
    }, [completedOrders]);

    return {
        orders, // Return source orders if needed
        completedOrders,
        ...metrics,
        paymentBreakdown,
        channelBreakdown,
        recurrenceDays
    };
};
