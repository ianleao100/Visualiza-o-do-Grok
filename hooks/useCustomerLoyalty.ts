
import { useState, useCallback, useEffect } from 'react';
import { CustomerProfile } from '../types';
import { customerService } from '../services/storage/customerService';
import { MOCK_CUSTOMERS } from '../constants';

export const useCustomerLoyalty = () => {
  // Inicialização única
  const [customers, setCustomers] = useState<CustomerProfile[]>(() => {
      const stored = customerService.loadCustomers();
      if (stored.length === 0) {
          return MOCK_CUSTOMERS;
      }
      return stored;
  });

  // Listener para manter o estado sincronizado com o Storage (Fonte de Verdade)
  useEffect(() => {
      const handleUpdate = () => {
          setCustomers(customerService.loadCustomers());
      };
      
      window.addEventListener('storage-update', handleUpdate);
      window.addEventListener('storage', handleUpdate);
      
      // Cleanup function obrigatória
      return () => {
          window.removeEventListener('storage-update', handleUpdate);
          window.removeEventListener('storage', handleUpdate);
      };
  }, []);

  const debitPoints = useCallback((whatsapp: string, pointsToDebit: number) => {
      if (!whatsapp || pointsToDebit <= 0) return;
      
      const currentCustomers = customerService.loadCustomers();
      const newState = currentCustomers.map(c => {
          if (c.whatsapp === whatsapp) {
              return { ...c, points: Math.max(0, c.points - pointsToDebit) };
          }
          return c;
      });
      customerService.saveCustomers(newState);
  }, []);

  const creditPoints = useCallback((whatsapp: string, pointsToAdd: number) => {
      if (!whatsapp || pointsToAdd <= 0) return;
      
      const currentCustomers = customerService.loadCustomers();
      const newState = currentCustomers.map(c => {
          if (c.whatsapp === whatsapp) {
              return { ...c, points: c.points + Math.floor(pointsToAdd) };
          }
          return c;
      });
      customerService.saveCustomers(newState);
  }, []);

  const handleOrderCancellation = useCallback((whatsapp: string, pointsEarnedInOrder: number, pointsUsedInOrder: number, wasDelivered: boolean) => {
      if (!whatsapp) return;

      const currentCustomers = customerService.loadCustomers();
      const newState = currentCustomers.map(c => {
          if (c.whatsapp === whatsapp) {
              let newPoints = c.points;
              if (pointsUsedInOrder > 0) newPoints += pointsUsedInOrder;
              if (wasDelivered && pointsEarnedInOrder > 0) newPoints = Math.max(0, newPoints - pointsEarnedInOrder);
              return { ...c, points: newPoints };
          }
          return c;
      });
      customerService.saveCustomers(newState);
  }, []);

  const updateCustomerStats = useCallback((name: string, whatsapp: string, amount: number) => {
      if (!name && !whatsapp) return;

      const prev = customerService.loadCustomers();
      const existingIdx = prev.findIndex(c => 
          (whatsapp && c.whatsapp === whatsapp) || 
          (!whatsapp && c.name.toLowerCase() === name.toLowerCase())
      );

      let newState;
      if (existingIdx > -1) {
          newState = [...prev];
          newState[existingIdx] = {
              ...newState[existingIdx],
              name: name || newState[existingIdx].name,
              whatsapp: whatsapp || newState[existingIdx].whatsapp,
              totalSpent: newState[existingIdx].totalSpent + amount,
              lastOrderAt: new Date(),
              orderCount: newState[existingIdx].orderCount + 1
          };
      } else {
          const newCustomer: CustomerProfile = {
              id: Math.random().toString(36).substr(2, 9),
              name: name || 'Cliente Avulso',
              whatsapp: whatsapp || '',
              points: 0, 
              totalSpent: amount,
              lastOrderAt: new Date(),
              orderCount: 1,
              addresses: []
          };
          newState = [newCustomer, ...prev];
      }
      
      customerService.saveCustomers(newState);
  }, []);

  const addCustomer = useCallback((customerData: any) => {
      const prev = customerService.loadCustomers();
      const newCustomer: CustomerProfile = {
          id: Math.random().toString(36).substr(2, 9),
          name: customerData.name,
          whatsapp: customerData.whatsapp,
          points: customerData.points || 0,
          totalSpent: 0,
          lastOrderAt: new Date(),
          orderCount: 0,
          addresses: customerData.addresses || [],
          email: customerData.email,
          photo: customerData.photo,
          birthDate: customerData.birthDate,
          observations: customerData.observations
      };
      const newState = [newCustomer, ...prev];
      customerService.saveCustomers(newState);
  }, []);

  const editCustomer = useCallback((updatedCustomer: CustomerProfile) => {
      customerService.updateCustomer(updatedCustomer);
  }, []);

  const removeCustomer = useCallback((customerId: string) => {
      // Fonte de Verdade Centralizada: Chama o serviço, não filtra manualmente.
      // O estado local (customers) será atualizado via listener de evento (adicionado no useEffect).
      customerService.deleteCustomer(customerId);
  }, []);

  return {
    customers,
    debitPoints,
    creditPoints,
    handleOrderCancellation,
    updateCustomerStats,
    addCustomer,
    editCustomer,
    removeCustomer
  };
};
