
import { useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus, PaymentMethodType } from '../types';
import { useCartLogic } from './core/useCartLogic';

interface PaymentSelection {
    id: number;
    method: PaymentMethodType;
    value: number;
    changeFor?: string;
    cardDetails?: {
        brand: string;
        last4: string;
    };
}

interface UseCheckoutLogicProps {
    cartLogic: ReturnType<typeof useCartLogic>;
    userProfile: any;
    savedAddresses: any[];
    setSavedAddresses: (addresses: any[]) => void;
    onCheckoutComplete: (order: Order) => void;
}

export const useCheckoutLogic = ({
    cartLogic,
    userProfile,
    savedAddresses,
    setSavedAddresses,
    onCheckoutComplete
}: UseCheckoutLogicProps) => {
    const { cart, total, subtotal, deliveryFee, setDeliveryFee, pointsDiscountValue, setPointsToUse } = cartLogic;

    // State
    const [orderNotes, setOrderNotes] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
    const [selectedAddressId, setSelectedAddressId] = useState<string>('1');
    const [usePoints, setUsePoints] = useState(false);
    
    // Payment State
    const [paymentSelections, setPaymentSelections] = useState<PaymentSelection[]>([
        { id: 1, method: 'PIX', value: 0 } 
    ]);
    const [activePaymentIdToUpdate, setActivePaymentIdToUpdate] = useState<number | null>(null);

    // Map State (Coordinates only, Leaflet logic is in component)
    const [coordinates, setCoordinates] = useState<{lat: number, lng: number}>({ 
        lat: -14.2233, 
        lng: -42.7766 
    });

    // Address Editing State
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [editingAddressData, setEditingAddressData] = useState<any>(undefined);

    // Effects
    useEffect(() => {
        setDeliveryFee(deliveryMethod === 'DELIVERY' ? 5.00 : 0);
    }, [deliveryMethod, setDeliveryFee]);

    useEffect(() => {
        setPointsToUse(usePoints ? 100 : 0);
    }, [usePoints, setPointsToUse]);

    // Handlers
    const handleSelectAddress = (id: string) => {
        setSelectedAddressId(id);
        const addr = savedAddresses.find(a => a.id === id);
        if (addr) {
            setCoordinates({ lat: addr.lat, lng: addr.lng });
        }
    };

    const handleEditAddress = (addr: any) => {
        setEditingAddressData(addr);
        setIsAddingAddress(true);
    };

    const saveAddress = (addressData: any) => {
        const newId = addressData.id || Date.now().toString();
        const newAddress = { ...addressData, id: newId };
        if (addressData.id) {
            setSavedAddresses(savedAddresses.map(a => a.id === addressData.id ? newAddress : a));
        } else {
            setSavedAddresses([...savedAddresses, newAddress]);
        }
        setSelectedAddressId(newId);
        if (addressData.lat && addressData.lng) {
            setCoordinates({ lat: addressData.lat, lng: addressData.lng });
        }
        setIsAddingAddress(false);
        setEditingAddressData(undefined);
    };

    // Payment Logic
    const handleAddPaymentMethod = () => {
        if (paymentSelections.length >= 2) return;
        const newId = 2; 
        setPaymentSelections(prev => {
            if (prev.length === 1) {
                return [
                    { ...prev[0], value: 0 },
                    { id: newId, method: 'CREDIT', value: 0 }
                ];
            }
            return prev;
        });
        setActivePaymentIdToUpdate(newId);
    };

    const handleRemovePaymentMethod = (id: number) => {
        if (id === 1) return;
        setPaymentSelections(prev => {
            const remaining = prev.filter(p => p.id !== id);
            if (remaining.length === 1) {
                remaining[0].value = 0; 
            }
            return remaining;
        });
    };

    const updatePaymentMethod = (id: number, method: PaymentMethodType) => {
        setPaymentSelections(prev => prev.map(p => {
            if (p.id === id) {
                return { ...p, method, changeFor: method === 'CASH' ? p.changeFor : undefined };
            }
            return p;
        }));
    };

    const handlePaymentValueUpdate = (id: number, val: number) => {
        setPaymentSelections(prev => {
            const newSelections = prev.map(p => p.id === id ? { ...p, value: val } : p);
            if (newSelections.length === 2) {
                 const other = newSelections.find(p => p.id !== id);
                 if (other) {
                    other.value = Math.max(0, parseFloat((total - val).toFixed(2)));
                 }
            }
            return newSelections;
        });
    };

    const handlePaymentFieldChange = (id: number, field: string, value: any) => {
        setPaymentSelections(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const finalizeCheckout = () => {
        let finalAddress = "Retirada na Loja";
        if (deliveryMethod === 'DELIVERY') {
            const addr = savedAddresses.find(a => a.id === selectedAddressId);
            if (!addr) {
                alert("Por favor, selecione um endereço de entrega.");
                return;
            }
            finalAddress = `${addr.street}, ${addr.number}`;
        }

        const newOrder: Order = {
            id: `ORD-${Math.floor(Math.random() * 100000)}`,
            customerName: userProfile.fullName || "Guest User",
            items: [...cart],
            total: total,
            subtotal: subtotal,
            deliveryFee: deliveryFee,
            discount: pointsDiscountValue,
            status: OrderStatus.PENDING,
            timestamp: new Date(),
            address: finalAddress
        };
        (newOrder as any).code = Math.floor(100000 + Math.random() * 900000).toString();
        onCheckoutComplete(newOrder);
    };

    return {
        // State
        orderNotes, setOrderNotes,
        deliveryMethod, setDeliveryMethod,
        selectedAddressId,
        usePoints, setUsePoints,
        paymentSelections,
        activePaymentIdToUpdate, setActivePaymentIdToUpdate,
        coordinates, setCoordinates,
        isAddingAddress, setIsAddingAddress,
        editingAddressData, setEditingAddressData,
        
        // Actions
        handleSelectAddress,
        handleEditAddress,
        saveAddress,
        handleAddPaymentMethod,
        handleRemovePaymentMethod,
        updatePaymentMethod,
        handlePaymentValueUpdate,
        handlePaymentFieldChange,
        finalizeCheckout
    };
};
