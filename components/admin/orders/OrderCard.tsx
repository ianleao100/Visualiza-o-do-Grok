
import React, { useMemo } from 'react';
import { Clock, User, AlertTriangle, Cake, Info } from 'lucide-react';
import { Order, OrderStatus } from '../../../types';
import { formatCurrency, isTodayBirthday } from '../../../shared/utils/mathEngine';
import { OrderBadge } from './OrderBadge';
import { useCustomerLoyalty } from '../../../hooks/useCustomerLoyalty';

interface OrderCardProps {
  order: Order;
  elapsedMinutes: number;
  onSelect: (order: Order) => void;
  onUpdateStatus: (order: Order, status: OrderStatus) => void;
  onDispatchOpen: (order: Order) => void;
  onRequestCancel: (order: Order, type: 'REJECT' | 'CANCEL') => void;
}

export const OrderCard = ({ order, elapsedMinutes, onSelect, onUpdateStatus, onDispatchOpen, onRequestCancel }: OrderCardProps) => {
  
  const { customers } = useCustomerLoyalty();

  // Encontra dados do cliente para exibir alertas
  const customerInfo = useMemo(() => {
      if (!order.customerWhatsapp) return null;
      return customers.find(c => c.whatsapp === order.customerWhatsapp);
  }, [customers, order.customerWhatsapp]);

  const isBirthday = customerInfo ? isTodayBirthday(customerInfo.birthDate) : false;
  const hasObservations = customerInfo?.observations && customerInfo.observations.trim().length > 0;

  const isCritical = elapsedMinutes >= 60;
  const isWarning = elapsedMinutes >= 40 && elapsedMinutes < 60;

  // Borda base
  let borderClass = 'border-transparent';
  if (isWarning) borderClass = 'border-yellow-400';
  else if (!isCritical) borderClass = 'border-green-500';

  return (
    <div 
      onClick={() => onSelect(order)}
      className="relative group cursor-pointer"
    >
      {/* EFEITO NEON (BORDA PISCANTE ISOLADA) - APENAS SE CRÍTICO */}
      {isCritical && (
        <div className="absolute inset-0 border-2 border-[#EA2831] rounded-[24px] animate-pulse z-20 shadow-[0_0_15px_rgba(234,40,49,0.5)] pointer-events-none"></div>
      )}

      {/* CONTEÚDO ESTÁTICO DO CARD */}
      <div className={`relative z-10 bg-white dark:bg-surface-dark p-4 rounded-[24px] flex flex-col gap-3 hover:shadow-xl transition-all hover:scale-[1.02] border-2 ${!isCritical ? borderClass : 'border-transparent'}`}>
        
        {/* Header do Card: ID e Badge de Origem */}
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
                <span className="font-black text-lg text-slate-900 dark:text-white leading-none">#{order.id.slice(-4)}</span>
                <OrderBadge order={order} />
            </div>
            
            <div className={`shrink-0 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${isWarning ? 'bg-yellow-50 text-yellow-700' : isCritical ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                <Clock className="w-3 h-3" />
                {elapsedMinutes} min
            </div>
        </div>

        {/* Linha 2: Cliente e Valor */}
        <div className="flex justify-between items-end">
            <div className="flex flex-col min-w-0 pr-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300 line-clamp-1 leading-tight">{order.customerName}</span>
                    {isBirthday && (
                        <span className="shrink-0 flex items-center gap-1 bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase animate-pulse">
                            <Cake className="w-3 h-3" /> Niver
                        </span>
                    )}
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white font-display mt-1">{formatCurrency(order.total)}</span>
            </div>
        </div>

        {/* ALERTA DE OBSERVAÇÕES DO CLIENTE (ALERGIA) */}
        {hasObservations && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-2 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-red-700 dark:text-red-400 font-bold leading-tight line-clamp-2">
                    <span className="uppercase tracking-wide">Atenção:</span> {customerInfo?.observations}
                </p>
            </div>
        )}

        {/* Logística - Condicional */}
        {order.status === OrderStatus.DISPATCHED && order.driverName && (
          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-700 w-fit">
            <User className="w-3 h-3" /> 
            <span className="truncate max-w-[120px]">{order.driverName}</span>
          </div>
        )}

        {/* Ações Rápidas (Stop Propagation) */}
        <div className="pt-3 mt-1 border-t border-dashed border-gray-100 dark:border-gray-700 flex justify-center items-center w-full">
          <div className="flex gap-2 w-full" onClick={(e) => e.stopPropagation()}>
            
            {order.status === OrderStatus.PENDING && (
              <>
                <button 
                    onClick={() => onRequestCancel(order, 'REJECT')} 
                    className="flex-1 px-2 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl font-black text-[10px] uppercase tracking-wide transition-colors"
                >
                    Rejeitar
                </button>
                <button 
                    onClick={() => onUpdateStatus(order, OrderStatus.PREPARING)} 
                    className="flex-[2] px-2 py-2 bg-green-500 text-white rounded-xl font-black text-[10px] uppercase tracking-wide hover:bg-green-600 shadow-sm transition-colors"
                >
                    Aceitar
                </button>
              </>
            )}

            {order.status === OrderStatus.PREPARING && (
                <>
                    <button 
                        onClick={() => onRequestCancel(order, 'CANCEL')} 
                        className="flex-1 px-2 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl font-black text-[10px] uppercase tracking-wide transition-colors"
                    >
                        Cancelar
                    </button>
                    {order.origin === 'DELIVERY' || order.isDelivery ? (
                        <button 
                            onClick={() => onDispatchOpen(order)} 
                            className="flex-[2] px-2 py-2 bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase tracking-wide hover:bg-blue-600 shadow-sm transition-colors"
                        >
                            Chamar Entregador
                        </button>
                    ) : (
                        <button 
                            onClick={() => onUpdateStatus(order, OrderStatus.DELIVERED)} 
                            className="flex-[2] px-2 py-2 bg-purple-500 text-white rounded-xl font-black text-[10px] uppercase tracking-wide hover:bg-purple-600 shadow-sm transition-colors"
                        >
                            Pronto (Notificar)
                        </button>
                    )}
                </>
            )}

            {order.status === OrderStatus.DISPATCHED && (
                <>
                    <button 
                        onClick={() => onRequestCancel(order, 'CANCEL')} 
                        className="flex-1 px-2 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl font-black text-[10px] uppercase tracking-wide transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={() => onUpdateStatus(order, OrderStatus.DELIVERED)} 
                        className="flex-[2] px-2 py-2 bg-green-600 text-white rounded-xl font-black text-[10px] uppercase tracking-wide hover:bg-green-700 shadow-sm transition-colors"
                    >
                        Concluir
                    </button>
                </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
