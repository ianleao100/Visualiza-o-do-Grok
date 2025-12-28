
import React, { useState, useEffect } from 'react';
import { Bike, Power, Navigation, Map, List } from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { storageService } from '../../services/storageService';
import ActiveDelivery from './ActiveDelivery';
import DeliveryHistory from './DeliveryHistory';
import { useCustomerLoyalty } from '../../hooks/useCustomerLoyalty';

interface RiderDashboardProps {
  onLogout: () => void;
}

export const RiderDashboard: React.FC<RiderDashboardProps> = ({ onLogout }) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [activeRoute, setActiveRoute] = useState<Order[]>([]); // Lista de pedidos na rota
  const [todaysDeliveries, setTodaysDeliveries] = useState<Order[]>([]);
  
  // Custom Hook para Fidelidade (para creditar pontos na entrega)
  const { creditPoints } = useCustomerLoyalty();

  // Load Initial Data
  useEffect(() => {
    const fetchOrders = () => {
      const allOrders = storageService.loadOrders();
      
      // Filtrar pedidos atribuídos (DISPATCHED)
      // Simulação: Pega TODOS os dispatched para o demo
      const dispatched = allOrders
        .filter(o => o.status === OrderStatus.DISPATCHED && !o.deliveredAt)
        .sort((a, b) => (a.routeSequence || 99) - (b.routeSequence || 99)); // Ordena pela sequência da rota

      setActiveRoute(dispatched);

      // Histórico do dia
      const today = new Date().toDateString();
      const history = allOrders.filter(o => 
        o.status === OrderStatus.DELIVERED && 
        new Date(o.deliveredAt || o.timestamp).toDateString() === today
      );
      setTodaysDeliveries(history);
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Poll for updates
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = (order: Order, newStatus: OrderStatus) => {
    const updatedOrder = { 
        ...order, 
        status: newStatus,
        deliveredAt: newStatus === OrderStatus.DELIVERED ? new Date() : undefined
    };
    
    storageService.updateOrder(updatedOrder);
    
    if (newStatus === OrderStatus.DELIVERED) {
        // Creditar Pontos ao Cliente
        if (order.customerWhatsapp) {
            const grossTotal = (order.subtotal || order.total) + (order.deliveryFee || 0);
            creditPoints(order.customerWhatsapp, grossTotal);
        }
        
        // Remove da rota ativa localmente para feedback imediato
        setActiveRoute(prev => prev.filter(o => o.id !== order.id));
        setTodaysDeliveries(prev => [updatedOrder, ...prev]);
        
        // Verifica se tem mais na rota
        if (activeRoute.length > 1) {
            alert("Entrega Concluída! Iniciando próxima parada...");
        } else {
            alert("Rota Finalizada! Bom trabalho. 🚀");
        }
    }
  };

  const currentStop = activeRoute.length > 0 ? activeRoute[0] : null;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* HEADER FIXO */}
      <header className="bg-black text-white p-6 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
            <div className="bg-[#EA2831] p-2 rounded-lg">
                <Bike className="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 className="text-xl font-black uppercase tracking-widest leading-none">RIDER</h1>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Dreamlícias Express</span>
            </div>
        </div>
        <button onClick={onLogout} className="p-3 bg-gray-800 rounded-full hover:bg-red-600 transition-colors">
            <Power className="w-6 h-6" />
        </button>
      </header>

      {/* BARRA DE ROTA (SE HOUVER MÚLTIPLOS) */}
      {activeRoute.length > 0 && (
          <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between border-t border-gray-800">
              <div className="flex items-center gap-2">
                  <Map className="w-4 h-4 text-[#EA2831]" />
                  <span className="text-xs font-bold uppercase tracking-widest">Viagem Atual</span>
              </div>
              <span className="bg-[#EA2831] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  Parada 1 de {activeRoute.length}
              </span>
          </div>
      )}

      {/* MAIN AREA */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {currentStop ? (
            <ActiveDelivery 
                order={currentStop} 
                onUpdateStatus={handleStatusUpdate}
                totalStops={activeRoute.length}
                currentStopIndex={1}
            />
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 animate-[fadeIn_0.5s]">
                <div className={`size-48 rounded-full border-[8px] flex items-center justify-center transition-all duration-500 ${isAvailable ? 'border-[#EA2831] bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                    <button 
                        onClick={() => setIsAvailable(!isAvailable)}
                        className={`w-full h-full rounded-full flex flex-col items-center justify-center gap-2 ${isAvailable ? 'text-[#EA2831]' : 'text-gray-400'}`}
                    >
                        <Power className="w-16 h-16" />
                        <span className="text-lg font-black uppercase tracking-widest">
                            {isAvailable ? 'ONLINE' : 'OFFLINE'}
                        </span>
                    </button>
                </div>
                
                <div className="space-y-2 max-w-xs mx-auto">
                    <h2 className="text-2xl font-black text-black uppercase">
                        {isAvailable ? 'Procurando Entregas...' : 'Você está invisível'}
                    </h2>
                    <p className="text-gray-500 font-bold text-sm">
                        {isAvailable 
                            ? 'Fique atento! Novas rotas aparecerão automaticamente.' 
                            : 'Toque no botão acima para iniciar seu turno.'}
                    </p>
                </div>

                {isAvailable && (
                    <div className="animate-pulse flex items-center gap-2 text-[#EA2831] font-bold text-xs uppercase tracking-widest bg-red-50 px-4 py-2 rounded-full">
                        <Navigation className="w-4 h-4 animate-spin" /> Buscando rotas próximas
                    </div>
                )}
            </div>
        )}
      </main>

      {/* FOOTER - RESUMO DO TURNO */}
      <DeliveryHistory deliveries={todaysDeliveries} />
    </div>
  );
};