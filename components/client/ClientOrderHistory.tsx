
import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';

interface ClientOrderHistoryProps {
    onBack: () => void;
    myOrders: Order[];
    onRepeatOrder: (order: Order) => void;
    onTrackOrder: (order: Order) => void; 
}

const Icon: React.FC<{ name: string, className?: string, style?: React.CSSProperties }> = ({ name, className = "", style }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{name}</span>
);

export const ClientOrderHistory: React.FC<ClientOrderHistoryProps> = ({ onBack, myOrders, onRepeatOrder, onTrackOrder }) => {
    const [historyTab, setHistoryTab] = useState<'PEDIDOS' | 'AGENDADOS'>('PEDIDOS');
    const [activeModal, setActiveModal] = useState<'NONE' | 'DETAILS'>('NONE');
    const [focusedOrder, setFocusedOrder] = useState<Order | null>(null);

    const handleHelp = () => {
        const phoneNumber = "5511999999999"; 
        const message = "Olá, preciso de ajuda com um pedido no App.";
        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const getStatusBadge = (order: Order) => {
        const { status, scheduledTime } = order;
        switch (status) {
            case OrderStatus.PENDING:
                return (
                    <div className="px-3 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-xs font-bold flex items-center gap-1.5 border border-yellow-200 dark:border-yellow-800 transition-colors">
                        <Icon name="hourglass_top" className="text-[14px]" />
                        Aguardando Confirmação
                    </div>
                );
            case OrderStatus.CONFIRMED:
                return (
                    <div className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5 border border-blue-200 dark:border-blue-800 transition-colors">
                        <Icon name="thumb_up" className="text-[14px]" />
                        Confirmado
                    </div>
                );
            case OrderStatus.PREPARING:
                return (
                    <div className="px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 text-xs font-bold flex items-center gap-1.5 border border-orange-200 dark:border-orange-800 transition-colors">
                        <Icon name="skillet" className="text-[14px]" />
                        Em preparo
                    </div>
                );
            case OrderStatus.READY:
                 return (
                    <div className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-xs font-bold flex items-center gap-1.5 border border-purple-200 dark:border-purple-800 transition-colors">
                        <Icon name="two_wheeler" className="text-[14px]" />
                        Em Trânsito
                    </div>
                );
            case OrderStatus.DELIVERED:
                return (
                    <div className="px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 text-xs font-bold flex items-center gap-1.5 border border-green-200 dark:border-green-800 transition-colors">
                        <Icon name="done_all" className="text-[14px]" />
                        Entregue
                    </div>
                );
            case OrderStatus.CANCELLED:
                 return (
                    <div className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 transition-colors">
                        <Icon name="cancel" className="text-[14px]" />
                        Cancelado
                    </div>
                );
            case OrderStatus.SCHEDULED:
                return (
                    <div className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800 transition-colors">
                        <Icon name="calendar_today" className="text-[14px]" />
                        Agendado para às {scheduledTime || '20:00'}
                    </div>
                );
            default:
                return null;
        }
    };

    const renderOrderCard = (order: Order) => {
        const isCancelled = order.status === OrderStatus.CANCELLED;
        const isScheduled = order.status === OrderStatus.SCHEDULED;

        return (
            <div 
                key={order.id} 
                className={`bg-white dark:bg-[#2a1a1a] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 transition-all ${isCancelled ? 'grayscale brightness-90 opacity-80' : ''}`}
            >
                <div className="flex justify-between items-center pb-3 border-b border-gray-50 dark:border-gray-800/30">
                    <span className="text-sm font-bold text-gray-400">
                        {order.timestamp.toLocaleDateString()} • {order.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    {getStatusBadge(order)}
                </div>
                <div className="flex gap-4 pt-4">
                     <div 
                        className={`bg-center bg-no-repeat bg-cover rounded-2xl size-[64px] shrink-0 border border-gray-100 dark:border-gray-700 transition-all ${isCancelled ? 'grayscale' : ''}`} 
                        style={{backgroundImage: `url('${order.items[0]?.imageUrl}')`}}
                    ></div>
                     <div className="flex flex-col flex-1">
                        <h4 className="text-slate-900 dark:text-white text-[15px] font-bold">Dreamlícias</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-[13px] line-clamp-2 mt-1">
                            {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </p>
                    </div>
                </div>
                <div className="flex justify-end items-center gap-3 mt-4 pt-3 border-t border-gray-50 dark:border-gray-800/30">
                    <span className="mr-auto font-bold text-slate-900 dark:text-white">R$ {order.total.toFixed(2)}</span>
                    
                    <button 
                        onClick={() => { setFocusedOrder(order); setActiveModal('DETAILS'); }} 
                        className="text-primary font-bold text-sm px-3 py-1.5 bg-primary/5 rounded-lg active:scale-95 transition-transform"
                    >
                        Detalhes
                    </button>
                    
                    {!isCancelled && !isScheduled && (
                        order.status !== OrderStatus.DELIVERED ? (
                            <button 
                                onClick={() => onTrackOrder(order)} 
                                className="text-primary font-bold text-sm px-3 py-1.5 bg-primary/5 rounded-lg active:scale-95 transition-transform"
                            >
                                Acompanhar
                            </button>
                        ) : (
                            <button 
                                onClick={() => onRepeatOrder(order)} 
                                className="text-primary font-bold text-sm px-3 py-1.5 bg-primary/5 rounded-lg active:scale-95 transition-transform"
                            >
                                Repetir
                            </button>
                        )
                    )}
                </div>
            </div>
        );
    };

    const regularOrders = myOrders.filter(o => o.status !== OrderStatus.SCHEDULED);
    const scheduledOrders = myOrders.filter(o => o.status === OrderStatus.SCHEDULED);

    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-200">
         <div className="sticky top-0 z-20 bg-white dark:bg-background-dark border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
            <div className="flex items-center px-4 py-3 justify-between">
                <button onClick={onBack} className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-800 dark:text-white transition-colors">
                    <Icon name="arrow_back_ios_new" className="text-[24px]" />
                </button>
                <h2 className="text-slate-900 dark:text-white text-lg font-bold flex-1 text-center">Histórico</h2>
                <button onClick={handleHelp} className="flex w-12 items-center justify-end text-primary text-sm font-bold hover:opacity-80 transition-opacity">Ajuda</button>
            </div>
            <div className="px-4 pb-0 flex gap-6 overflow-x-auto no-scrollbar border-b border-gray-200 dark:border-gray-800">
                <button 
                    onClick={() => setHistoryTab('PEDIDOS')} 
                    className={`relative pb-3 font-bold text-sm transition-colors ${historyTab === 'PEDIDOS' ? 'text-primary' : 'text-gray-500'}`}
                >
                    Pedidos
                    {historyTab === 'PEDIDOS' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>}
                </button>
                <button 
                    onClick={() => setHistoryTab('AGENDADOS')} 
                    className={`relative pb-3 font-bold text-sm transition-colors ${historyTab === 'AGENDADOS' ? 'text-primary' : 'text-gray-500'}`}
                >
                    Agendados
                    {historyTab === 'AGENDADOS' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>}
                </button>
            </div>
         </div>

         <div className="flex-1 p-4 flex flex-col gap-4 pb-24">
            {historyTab === 'PEDIDOS' ? (
                regularOrders.length > 0 ? (
                    regularOrders.map(order => renderOrderCard(order))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 animate-pulse">
                        <Icon name="shopping_basket" className="text-6xl opacity-20 mb-4" />
                        <p className="font-bold">Não há pedidos realizados ainda.</p>
                    </div>
                )
            ) : (
                scheduledOrders.length > 0 ? (
                    scheduledOrders.map(order => renderOrderCard(order))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
                        <Icon name="calendar_month" className="text-6xl opacity-20 mb-4" />
                        <p className="font-bold">Não há pedidos agendados.</p>
                    </div>
                )
            )}
         </div>

         {/* Modal de Detalhes do Pedido */}
         {activeModal === 'DETAILS' && focusedOrder && (
             <div className="fixed inset-0 z-[110] bg-white dark:bg-surface-dark flex flex-col animate-[slideUp_0.3s_ease-out]">
                 <header className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-surface-dark z-10 transition-colors">
                     <h3 className="font-bold text-lg">Detalhes do Pedido</h3>
                     <button onClick={() => setActiveModal('NONE')} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full transition-colors">
                         <Icon name="close" />
                     </button>
                 </header>
                 <div className="flex-1 overflow-y-auto p-4 space-y-6">
                     <div className="flex justify-between items-center">
                         {getStatusBadge(focusedOrder)} 
                         <span className="text-xs text-gray-400 font-mono">#{focusedOrder.id}</span>
                     </div>
                     <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors">
                         <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Endereço de Entrega</h4>
                         <p className="text-sm font-bold">{focusedOrder.address}</p>
                     </div>
                     <div>
                         <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3 ml-1">Itens</h4>
                         <div className="space-y-4">
                            {focusedOrder.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center">
                                    <span className="text-sm font-medium">{item.quantity}x {item.name}</span>
                                    <span className="text-sm font-bold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                         </div>
                     </div>
                     <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2 transition-colors">
                         <div className="flex justify-between text-sm text-gray-500">
                             <span>Subtotal</span>
                             <span>R$ {focusedOrder.total.toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-200 dark:border-gray-800 mt-2 transition-colors">
                             <span className="font-bold">Total</span>
                             <span className="font-extrabold text-xl text-primary font-display">R$ {focusedOrder.total.toFixed(2)}</span>
                         </div>
                     </div>
                 </div>
                 <div className="p-4 bg-gray-50 dark:bg-surface-dark/50 border-t border-gray-100 dark:border-gray-800 transition-colors">
                    {focusedOrder.status !== OrderStatus.CANCELLED && (
                        <button 
                            onClick={() => { onRepeatOrder(focusedOrder); setActiveModal('NONE'); }} 
                            className="w-full bg-white dark:bg-surface-dark border border-primary text-primary font-bold py-3.5 rounded-xl shadow-sm active:scale-95 transition-all"
                        >
                            Pedir Novamente
                        </button>
                    )}
                 </div>
             </div>
         )}
      </div>
    );
};
