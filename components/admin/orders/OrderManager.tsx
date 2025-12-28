
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, AlertTriangle, Filter, Users, Split, CheckSquare } from 'lucide-react';
import { Order, OrderStatus, RiderProfile } from '../../../types';
import { storageService } from '../../../services/storageService';
import { OrderMetrics } from './OrderMetrics';
import { OrderCard } from './OrderCard';
import { OrderDetailsModal } from './OrderDetailsModal';
import { useOrderTimer } from '../../../hooks/useOrderTimer';
import { BaseModal } from '../../ui/BaseModal';
import { getSector, optimizeRoute } from '../../../shared/utils/mathEngine';
import { useOrderManager } from '../../../hooks/core/useOrderManager';

// Limite Rígido de Segurança
const BAG_LIMIT = 6;

export default function OrderManager() {
  const { orders, updateOrderStatus } = useOrderManager();
  const [drivers, setDrivers] = useState<RiderProfile[]>([]);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  
  // Selection State
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter State
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');
  
  // Custom Hook para Tempo
  const { getElapsedTimeInMinutes } = useOrderTimer();

  // Estado para Modal de Confirmação Crítica
  const [confirmModal, setConfirmModal] = useState<{
      isOpen: boolean;
      type: 'REJECT' | 'CANCEL';
      order: Order | null;
  }>({ isOpen: false, type: 'REJECT', order: null });

  // Load Drivers only (Orders handled by hook)
  useEffect(() => {
      const load = () => {
          setDrivers(storageService.loadDrivers());
      };
      load();
      const interval = setInterval(load, 5000); 
      return () => clearInterval(interval);
  }, []);

  // --- CÁLCULO DE CARGA ATIVA (Trava de Segurança) ---
  const driversWithLoad = useMemo(() => {
      return drivers.map(driver => {
          // Conta quantos pedidos estão DISPATCHED (Em rota) para este motorista
          const activeLoad = orders.filter(o => 
              o.status === OrderStatus.DISPATCHED && 
              o.driverName === driver.name && // Idealmente usar ID, mas o mock usa name em alguns lugares
              !o.deliveredAt
          ).length;
          
          return { ...driver, activeLoad };
      }).sort((a, b) => {
          // 1. Prioridade: Quem tem MENOS entregas no dia (Justiça)
          if (a.dailyOrdersCount !== b.dailyOrdersCount) return a.dailyOrdersCount - b.dailyOrdersCount;
          // 2. Desempate: Quem está mais livre agora
          return a.activeLoad - b.activeLoad;
      });
  }, [drivers, orders]);

  // 1. Single Dispatch (Com Validação de Carga)
  const handleBulkDispatch = useCallback((driverId: string, driverName: string, activeLoad: number) => {
      const targets = orders.filter(o => selectedOrders.includes(o.id));
      
      // TRAVA DE SEGURANÇA
      if (activeLoad + targets.length > BAG_LIMIT) {
          alert(`OPERAÇÃO BLOQUEADA!\n\nO entregador ${driverName} já tem ${activeLoad} pedidos ativos.\nAdicionar +${targets.length} excederia o limite de segurança de ${BAG_LIMIT} pedidos por bag.`);
          return;
      }

      const optimizedRoute = optimizeRoute(targets);
      
      optimizedRoute.forEach((order, index) => {
          updateOrderStatus(order, OrderStatus.DISPATCHED, { 
              driverName,
              routeSequence: index + 1
          });
      });

      storageService.incrementDriverCount(driverId, targets.length);
      setDrivers(storageService.loadDrivers()); 

      setIsDriverModalOpen(false);
      setSelectedOrders([]);
  }, [selectedOrders, orders, updateOrderStatus]);

  // 2. Smart Split Dispatch (Divisão Automática)
  const handleSmartSplitDispatch = useCallback(() => {
      const targets = orders.filter(o => selectedOrders.includes(o.id));
      
      // Pega os 2 motoristas mais livres (já ordenados)
      const driverA = driversWithLoad[0];
      const driverB = driversWithLoad[1];

      if (!driverA || !driverB) {
          alert("Não há entregadores suficientes para dividir.");
          return;
      }

      const midPoint = Math.ceil(targets.length / 2);
      const batchA = targets.slice(0, midPoint);
      const batchB = targets.slice(midPoint);

      // Despacha Batch A
      const routeA = optimizeRoute(batchA);
      routeA.forEach((order, idx) => updateOrderStatus(order, OrderStatus.DISPATCHED, { driverName: driverA.name, routeSequence: idx + 1 }));
      storageService.incrementDriverCount(driverA.id, batchA.length);

      // Despacha Batch B
      const routeB = optimizeRoute(batchB);
      routeB.forEach((order, idx) => updateOrderStatus(order, OrderStatus.DISPATCHED, { driverName: driverB.name, routeSequence: idx + 1 }));
      storageService.incrementDriverCount(driverB.id, batchB.length);

      setDrivers(storageService.loadDrivers());
      setIsDriverModalOpen(false);
      setSelectedOrders([]);
      alert(`Lote dividido com sucesso!\n\n${driverA.name}: ${batchA.length} pedidos\n${driverB.name}: ${batchB.length} pedidos`);

  }, [selectedOrders, orders, driversWithLoad, updateOrderStatus]);

  const toggleSelection = (orderId: string) => {
      setSelectedOrders(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]);
  };

  const openConfirmModal = useCallback((order: Order, type: 'REJECT' | 'CANCEL') => {
      setConfirmModal({ isOpen: true, type, order });
  }, []);

  const executeConfirmAction = useCallback(() => {
      if (confirmModal.order) {
          updateOrderStatus(confirmModal.order, OrderStatus.CANCELLED);
          setConfirmModal({ isOpen: false, type: 'REJECT', order: null });
      }
  }, [confirmModal, updateOrderStatus]);

  const getOrdersByStatus = useCallback((status: OrderStatus) => {
      return orders
          .filter(o => {
              const statusMatch = o.status === status;
              const searchMatch = (o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
              const sectorMatch = sectorFilter === 'ALL' || o.sector === sectorFilter;
              if (status === OrderStatus.READY) return statusMatch && searchMatch && sectorMatch;
              return statusMatch && searchMatch;
          })
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [orders, searchTerm, sectorFilter]);

  const handleNavigateOrder = useCallback((direction: 'prev' | 'next') => {
      if (!detailOrder) return;
      const currentList = getOrdersByStatus(detailOrder.status);
      const currentIndex = currentList.findIndex(o => o.id === detailOrder.id);
      if (currentIndex === -1) return;
      const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex >= 0 && newIndex < currentList.length) setDetailOrder(currentList[newIndex]);
  }, [detailOrder, getOrdersByStatus]);

  const columns = [
      { id: OrderStatus.PENDING, label: 'NOVOS PEDIDOS', color: 'bg-yellow-400' },
      { id: OrderStatus.PREPARING, label: 'EM PREPARO', color: 'bg-blue-400' },
      { id: OrderStatus.READY, label: 'PRONTO (AGUARDANDO)', color: 'bg-orange-400' },
      { id: OrderStatus.DISPATCHED, label: 'EM ROTA', color: 'bg-purple-400' },
  ];

  return (
    <div className="min-h-screen flex flex-col animate-[fadeIn_0.3s_ease-out] bg-[#f8f6f6] dark:bg-background-dark pb-10">
      
      {/* HEADER */}
      <div className="px-4 pt-4 pb-2 grid grid-cols-12 gap-4 items-center shrink-0">
        <div className="col-span-3 flex flex-col justify-center">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Expedição</h1>
            <button 
                onClick={() => setIsAuditModalOpen(true)}
                className="text-slate-500 font-bold text-xs flex items-center gap-1 hover:text-[#EA2831] w-fit"
            >
                <Users className="w-3 h-3" /> Auditoria de Frota
            </button>
        </div>

        <div className="col-span-6 flex justify-center -mt-2">
             <OrderMetrics orders={orders} />
        </div>

        <div className="col-span-3 flex justify-end gap-3">
            <div className="relative">
                <select 
                    value={sectorFilter}
                    onChange={(e) => setSectorFilter(e.target.value)}
                    className="appearance-none bg-white dark:bg-surface-dark pl-9 pr-8 py-2.5 rounded-xl text-xs font-black border border-gray-200 dark:border-gray-800 text-slate-700 dark:text-white focus:ring-1 focus:ring-[#EA2831] outline-none shadow-sm cursor-pointer hover:bg-gray-50 uppercase tracking-wide"
                >
                    <option value="ALL">Todas Zonas</option>
                    <option value="NORTE">Zona Norte</option>
                    <option value="SUL">Zona Sul</option>
                    <option value="LESTE">Zona Leste</option>
                    <option value="OESTE">Zona Oeste</option>
                    <option value="CENTRO">Centro</option>
                </select>
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative group w-full max-w-[200px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#EA2831] w-3.5 h-3.5 transition-colors" />
                <input 
                    type="text" 
                    placeholder="BUSCAR..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-black shadow-sm focus:outline-none focus:border-[#EA2831] focus:ring-1 focus:ring-[#EA2831] transition-all uppercase placeholder:normal-case placeholder:font-medium"
                />
            </div>
        </div>
      </div>
      
      {/* KANBAN */}
      <div className="flex-1 px-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full min-h-[600px]">
              {columns.map(col => {
                  const items = getOrdersByStatus(col.id as OrderStatus);
                  return (
                    <div key={col.id} className="flex flex-col h-full">
                        <div className={`flex items-center gap-3 mb-3 px-2`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${col.color} shadow-[0_0_10px_rgba(0,0,0,0.2)]`}></div>
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{col.label}</h3>
                            <span className="ml-auto bg-white dark:bg-surface-dark px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-500 shadow-sm border border-gray-100 dark:border-gray-700">
                                {items.length}
                            </span>
                        </div>
                        <div className="flex-1 bg-gray-100/50 dark:bg-gray-800/20 rounded-[24px] p-3 border border-dashed border-gray-200 dark:border-gray-800 relative overflow-y-auto no-scrollbar space-y-3">
                            {items.length === 0 && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 pointer-events-none opacity-50">
                                    <span className="text-4xl font-black opacity-20">0</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Vazio</span>
                                </div>
                            )}
                            {items.map(order => (
                                <div key={order.id} className="relative group">
                                    {col.id === OrderStatus.READY && (
                                        <div className="absolute top-3 left-3 z-30">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); toggleSelection(order.id); }}
                                                className={`p-1 rounded-lg transition-all ${selectedOrders.includes(order.id) ? 'bg-[#EA2831] text-white' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`}
                                            >
                                                <CheckSquare className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                    <OrderCard 
                                        order={order}
                                        elapsedMinutes={getElapsedTimeInMinutes(order.timestamp)}
                                        onSelect={(o) => setDetailOrder(o)}
                                        onUpdateStatus={updateOrderStatus}
                                        onDispatchOpen={(o) => { setSelectedOrders([o.id]); setIsDriverModalOpen(true); }}
                                        onRequestCancel={openConfirmModal}
                                    />
                                    {order.sector && (
                                        <div className="absolute bottom-3 right-3 z-20 bg-slate-900 text-white text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider pointer-events-none opacity-80">
                                            {order.sector}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                  );
              })}
          </div>
      </div>

      {detailOrder && (
          <OrderDetailsModal 
              order={detailOrder}
              onClose={() => setDetailOrder(null)}
              onNavigate={handleNavigateOrder}
              onUpdateStatus={updateOrderStatus}
              onDispatch={(o) => { setSelectedOrders([o.id]); setIsDriverModalOpen(true); setDetailOrder(null); }}
              onRequestCancel={(o, type) => { openConfirmModal(o, type); setDetailOrder(null); }}
              getElapsedTime={getElapsedTimeInMinutes}
          />
      )}

      {isDriverModalOpen && (
          <BaseModal onClose={() => setIsDriverModalOpen(false)} className="max-w-xl" title="Logística de Entrega">
              <div className="p-6 pt-0 space-y-6">
                  {selectedOrders.length > BAG_LIMIT && (
                      <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl animate-[fadeIn_0.3s]">
                          <div className="flex items-start gap-3">
                              <Split className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                              <div className="flex-1">
                                  <h4 className="text-sm font-black text-blue-800 uppercase tracking-wide">Volume Excede Limite da Bag</h4>
                                  <p className="text-xs text-blue-700 mt-1 mb-3 leading-relaxed">
                                      Você selecionou <b>{selectedOrders.length} pedidos</b>. Recomendamos dividir este lote.
                                  </p>
                                  <button 
                                      onClick={handleSmartSplitDispatch}
                                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                                  >
                                      Dividir entre os 2 mais livres
                                  </button>
                              </div>
                          </div>
                      </div>
                  )}

                  <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto no-scrollbar">
                      {driversWithLoad.map((driver, index) => {
                          const isRecommended = index === 0 && selectedOrders.length <= BAG_LIMIT;
                          const willExceedLimit = driver.activeLoad + selectedOrders.length > BAG_LIMIT;
                          
                          return (
                              <button 
                                  key={driver.id}
                                  disabled={willExceedLimit}
                                  onClick={() => handleBulkDispatch(driver.id, driver.name, driver.activeLoad)}
                                  className={`flex items-center gap-4 p-4 border rounded-2xl transition-all group relative ${willExceedLimit ? 'opacity-50 grayscale' : 'hover:bg-gray-50'}`}
                              >
                                  <div className="text-left flex-1">
                                      <span className="font-black text-sm">{driver.name}</span>
                                      <span className="block text-xs text-slate-500">{driver.activeLoad} ativos</span>
                                  </div>
                              </button>
                          );
                      })}
                  </div>
              </div>
          </BaseModal>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
          <BaseModal onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} className="max-w-md">
              <div className="p-6 text-center">
                  <h3 className="text-xl font-black mb-2">{confirmModal.type === 'REJECT' ? 'Rejeitar?' : 'Cancelar?'}</h3>
                  <div className="flex gap-3 mt-6">
                      <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Voltar</button>
                      <button onClick={executeConfirmAction} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold">Confirmar</button>
                  </div>
              </div>
          </BaseModal>
      )}
    </div>
  );
}
