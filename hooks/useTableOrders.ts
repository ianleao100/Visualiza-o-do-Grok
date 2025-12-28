
import { useState, useCallback, useEffect } from 'react';
import { TableConfig, TableSession, CartItem, Product } from '../types';
import { orderService } from '../services/storage/orderService';

export const useTableOrders = (initialTables: TableConfig[]) => {
  const [tablesConfig, setTablesConfig] = useState<TableConfig[]>(initialTables);
  const [tableSessions, setTableSessions] = useState<Record<string, TableSession>>(() => 
    orderService.loadActiveOrders()
  );

  // Auto-save sempre que as sessões mudarem
  useEffect(() => {
    orderService.saveActiveOrders(tableSessions);
  }, [tableSessions]);

  const calculateItemPrice = useCallback((product: Product, extras: { price: number }[]) => {
    const extrasTotal = extras.reduce((sum, extra) => sum + extra.price, 0);
    return product.price + extrasTotal;
  }, []);

  const isTableOccupied = useCallback((tableId: string) => !!tableSessions[tableId], [tableSessions]);

  const saveSession = useCallback((tableId: string, tableNumber: string, customerName: string, items: CartItem[], customerWhatsapp?: string) => {
    setTableSessions(prev => ({
      ...prev,
      [tableId]: {
        tableId,
        tableNumber,
        customerName: customerName || `Mesa ${tableNumber}`,
        customerWhatsapp: customerWhatsapp || '',
        items: [...items],
        openedAt: prev[tableId]?.openedAt || new Date(),
        status: 'OPEN'
      }
    }));
  }, []);

  const transferTableOrder = useCallback((fromId: string, toId: string) => {
    setTableSessions(prev => {
      const session = prev[fromId];
      if (!session) return prev;
      
      const newConfig = tablesConfig.find(t => t.id === toId);
      if (!newConfig) return prev;

      const next = { ...prev };
      delete next[fromId];
      
      next[toId] = {
        ...session,
        tableId: toId,
        tableNumber: newConfig.number
      };
      
      return next;
    });
  }, [tablesConfig]);

  const closeSession = useCallback((tableId: string) => {
    setTableSessions(prev => {
      const next = { ...prev };
      delete next[tableId];
      return next;
    });
  }, []);

  const updateTableConfig = useCallback((table: TableConfig) => {
    setTablesConfig(prev => {
      const exists = prev.find(t => t.id === table.id);
      if (exists) return prev.map(t => t.id === table.id ? table : t);
      return [...prev, table];
    });
  }, []);

  const removeTableConfig = useCallback((tableId: string) => {
    setTablesConfig(prev => prev.filter(t => t.id !== tableId));
  }, []);

  return {
    tablesConfig,
    tableSessions,
    isTableOccupied,
    calculateItemPrice,
    saveSession,
    transferTableOrder,
    closeSession,
    updateTableConfig,
    removeTableConfig
  };
};
