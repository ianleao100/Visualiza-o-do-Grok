
import { useState, useMemo, useCallback } from 'react';
import { CartItem, Product } from '../../types';
import { roundFinance, calculateFinalTotal, calculatePointsDiscount } from '../../shared/utils/mathEngine';

export const useCartLogic = (initialCart: CartItem[] = []) => {
    const [cart, setCart] = useState<CartItem[]>(initialCart);
    const [deliveryFee, setDeliveryFee] = useState(5.00);
    const [discount, setDiscount] = useState(0);
    const [pointsToUse, setPointsToUse] = useState(0);

    // --- Actions ---

    const addToCart = useCallback((itemToAdd: CartItem) => {
        setCart(prev => {
            const existingIdx = prev.findIndex(item => 
                item.id === itemToAdd.id && 
                JSON.stringify(item.selectedExtras) === JSON.stringify(itemToAdd.selectedExtras) &&
                item.notes === itemToAdd.notes
            );

            if (existingIdx > -1) {
                const newCart = [...prev];
                newCart[existingIdx].quantity += itemToAdd.quantity;
                return newCart;
            }
            return [...prev, itemToAdd];
        });
    }, []);

    const removeFromCart = useCallback((itemId: string) => {
        setCart(prev => prev.filter(item => item.id !== itemId));
    }, []);

    const updateQuantity = useCallback((itemId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === itemId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }).filter(item => item.quantity > 0)); // Remove if 0 (optional constraint)
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
        setPointsToUse(0);
        setDiscount(0);
    }, []);

    // --- Calculations ---

    const subtotal = useMemo(() => {
        return roundFinance(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0));
    }, [cart]);

    const itemsCount = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }, [cart]);

    const pointsDiscountValue = useMemo(() => {
        return calculatePointsDiscount(pointsToUse);
    }, [pointsToUse]);

    const total = useMemo(() => {
        // Using mathEngine to ensure precision
        return calculateFinalTotal(subtotal, 0, 0, discount + pointsDiscountValue) + deliveryFee;
    }, [subtotal, deliveryFee, discount, pointsDiscountValue]);

    return {
        cart,
        setCart, // Exposed for specialized cases (like loading drafts)
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        
        // State Setters for Checkout Context
        setDeliveryFee,
        setDiscount,
        setPointsToUse,
        
        // Computed Values
        subtotal,
        deliveryFee,
        discount,
        pointsToUse,
        pointsDiscountValue,
        total,
        itemsCount
    };
};
