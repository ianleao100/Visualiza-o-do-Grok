
import { useState, useCallback, useEffect } from 'react';
import { CartItem } from '../types';
import { orderService } from '../services/storage/orderService';

export const useCheckoutPersistence = () => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const draft = orderService.loadPosDraft();
    return draft ? draft.cart : [];
  });
  
  const [customerData, setCustomerData] = useState(() => {
    const draft = orderService.loadPosDraft();
    return draft ? draft.customer : { name: '', whatsapp: '' };
  });

  // Auto-save rascunho
  useEffect(() => {
    orderService.savePosDraft(cart, customerData);
  }, [cart, customerData]);

  const clearCheckout = useCallback(() => {
    setCart([]);
    setCustomerData({ name: '', whatsapp: '' });
    // O clearCheckout já refletirá no useEffect de save, limpando o localStorage
  }, []);

  const updateCustomer = useCallback((updates: Partial<{ name: string; whatsapp: string }>) => {
    setCustomerData(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    cart,
    setCart,
    customerData,
    updateCustomer,
    clearCheckout
  };
};
