
import React, { useMemo } from 'react';
import { Clock, User, Bike, CheckCircle, XCircle, ShoppingBag, Phone, CreditCard, ChevronRight, ChevronLeft, Printer, Cake, AlertTriangle, Info } from 'lucide-react';
import { Order, OrderStatus } from '../../../types';
import { BaseModal } from '../../ui/BaseModal';
import { formatCurrency, isTodayBirthday } from '../../../shared/utils/mathEngine';
import { useCustomerLoyalty } from '../../../hooks/useCustomerLoyalty';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onUpdateStatus: (order: Order, status: OrderStatus) => void;
  onDispatch: (order: Order) => void;
  onRequestCancel: (order: Order, type: 'REJECT' | 'CANCEL') => void;
  getElapsedTime: (date: Date) => number;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ 
  order, 
  onClose, 
  onNavigate, 
  onUpdateStatus, 
  onDispatch,
  onRequestCancel,
  getElapsedTime 
}) => {

  const { customers } = useCustomerLoyalty();

  // Encontra dados do cliente para exibir alertas
  const customerInfo = useMemo(() => {
      if (!order.customerWhatsapp) return null;
      return customers.find(c => c.whatsapp === order.customerWhatsapp);
  }, [customers, order.customerWhatsapp]);

  const isBirthday = customerInfo ? isTodayBirthday(customerInfo.birthDate) : false;
  const hasObservations = customerInfo?.observations && customerInfo.observations.trim().length > 0;

  const translateStatus = (status: OrderStatus) => {
      switch (status) {
          case OrderStatus.PENDING: return 'PENDENTE';
          case OrderStatus.CONFIRMED: return 'CONFIRMADO';
          case OrderStatus.PREPARING: return 'EM PREPARO';
          case OrderStatus.DISPATCHED: return 'EM ROTA';
          case OrderStatus.READY: return 'PRONTO';
          case OrderStatus.DELIVERED: return 'ENTREGUE';
          case OrderStatus.CANCELLED: return 'CANCELADO';
          case OrderStatus.SCHEDULED: return 'AGENDADO';
          default: return status;
      }
  };

  // Handler para detectar clique fora do card (no gap entre setas e card)
  const handleContainerClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
          onClose();
      }
  };

  return (
    <BaseModal onClose={onClose} className="!bg-transparent shadow-none" hideCloseButton={true}>
      
      {/* Container Flex Centralizado para Setas + Card. onClick no container fecha o modal. */}
      <div 
        className="flex items-center justify-center w-full max-w-7xl mx-auto gap-4 px-4 h-full"
        onClick={handleContainerClick}
      >
        
        {/* Botão Anterior (Relativo ao container) */}
        <button 
          onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }}
          className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all hover:scale-110 active:scale-95 shadow-lg border border-white/10 shrink-0 z-50"
        >
          <ChevronLeft className="w-8 h-8 stroke-[3]" />
        </button>

        {/* Card de Conteúdo Horizontal */}
        <div className="relative w-full max-w-5xl bg-white dark:bg-surface-dark rounded-[40px] shadow-2xl flex overflow-hidden h-[650px] animate-[slideUp_0.3s]" onClick={(e) => e.stopPropagation()}>
          
          {/* Close Interno */}
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:text-red-500 z-50 transition-colors"><XCircle className="w-6 h-6" /></button>

          {/* Coluna Esquerda: Informações e Cliente */}
          <div className="w-1/3 bg-gray-50 dark:bg-gray-800/50 p-10 flex flex-col border-r border-gray-100 dark:border-gray-800 overflow-y-auto no-scrollbar">
            <div className="flex flex-col gap-1 mb-6">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pedido</span>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white">#{order.id.slice(-6)}</h2>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 w-fit">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-600 dark:text-gray-300">
                  Feito às {order.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              
              {/* ÁREA DE ALERTAS DO CLIENTE */}
              {(isBirthday || hasObservations) && (
                  <div className="space-y-3 p-4 bg-white dark:bg-surface-dark rounded-[24px] shadow-sm border border-red-100 dark:border-red-900/30">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alertas de Atendimento</h4>
                      
                      {isBirthday && (
                          <div className="flex items-center gap-3 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-xl border border-pink-100 dark:border-pink-900/30">
                              <div className="p-2 bg-white dark:bg-surface-dark rounded-full shadow-sm text-pink-500">
                                  <Cake className="w-5 h-5" />
                              </div>
                              <div>
                                  <p className="font-black text-pink-600 text-xs uppercase">Aniversariante do Dia!</p>
                                  <p className="text-[10px] text-pink-500 font-bold">Enviar mimo/mensagem 🎂</p>
                              </div>
                          </div>
                      )}

                      {hasObservations && (
                          <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30">
                              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                              <div>
                                  <p className="font-black text-red-600 text-xs uppercase">Observação do Cliente</p>
                                  <p className="text-[11px] text-red-500 font-bold leading-tight mt-1">{customerInfo?.observations}</p>
                              </div>
                          </div>
                      )}
                  </div>
              )}

              {/* Card Cliente */}
              <div className="bg-white dark:bg-surface-dark p-5 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Cliente</span>
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"><User className="w-5 h-5" /></div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white leading-tight">{order.customerName}</p>
                    <p className="text-xs text-slate-400 font-bold">Cliente Recorrente</p>
                  </div>
                </div>
                <button className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95">
                  <Phone className="w-4 h-4" /> WhatsApp
                </button>
              </div>

              <div className="bg-white dark:bg-surface-dark p-5 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Status Atual</span>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
                  order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-700' :
                  order.status === OrderStatus.PREPARING ? 'bg-blue-100 text-blue-700' :
                  order.status === OrderStatus.DISPATCHED ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                }`}>
                  {translateStatus(order.status)}
                </div>
              </div>

              <div className="bg-white dark:bg-surface-dark p-5 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Tempo Decorrido</span>
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-[#EA2831]" />
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{getElapsedTime(order.timestamp)} <span className="text-sm text-slate-400">min</span></span>
                </div>
              </div>

              <div className="bg-white dark:bg-surface-dark p-5 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Pagamento</span>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-green-500" />
                    <span className="font-black text-slate-900 dark:text-white text-sm">{order.paymentMethod || 'Não informado'}</span>
                  </div>
                  {(order as any).changeFor && (
                    <div className="mt-1 text-xs font-bold text-slate-500 bg-gray-50 px-2 py-1 rounded w-fit">
                      Troco para: R$ {(order as any).changeFor}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Itens & Ações */}
          <div className="flex-1 p-10 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto no-scrollbar pr-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Itens do Pedido</h3>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div className="flex gap-4">
                      {/* Quantidade: Fundo Vermelho Sólido */}
                      <div className="size-8 bg-[#EA2831] text-white rounded-lg flex items-center justify-center font-black text-sm shadow-md shadow-red-500/20">{item.quantity}x</div>
                      <div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{item.name}</p>
                        {item.selectedExtras && item.selectedExtras.length > 0 && (
                          <div className="flex flex-col gap-0.5 mt-1">
                            {item.selectedExtras.map((extra, eIdx) => (
                              <span key={eIdx} className="text-xs text-slate-500 font-medium">+ {extra.name}</span>
                            ))}
                          </div>
                        )}
                        {item.notes && <p className="text-xs font-bold text-red-500 mt-1 italic bg-red-50 px-2 py-0.5 rounded w-fit">Obs: {item.notes}</p>}
                      </div>
                    </div>
                    <span className="font-black text-slate-700 dark:text-gray-300 font-display">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100 dark:border-gray-800 mt-4">
              <div className="flex justify-between items-end mb-6">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Geral</span>
                <span className="text-4xl font-black text-[#EA2831] font-display">{formatCurrency(order.total)}</span>
              </div>
              
              <div className="flex gap-4">
                <button className="p-4 bg-white border-2 border-[#EA2831] text-[#EA2831] rounded-[20px] hover:bg-red-50 transition-all active:scale-95 shadow-sm" title="Imprimir Comanda">
                  <Printer className="w-6 h-6" />
                </button>
                
                {/* 
                   LOGICA DE BOTÕES PADRONIZADA:
                   PENDING: Rejeitar | Aceitar
                   PREPARING: Cancelar | Despachar (texto apenas)
                   DISPATCHED: Cancelar | Concluir (verde sólido)
                   DELIVERED: Cancelar (para correções)
                */}

                {order.status === OrderStatus.PENDING && (
                  <>
                    <button 
                      onClick={() => { onRequestCancel(order, 'REJECT'); onClose(); }}
                      className="flex-1 py-4 border-2 border-red-200 text-red-500 hover:bg-red-50 font-black rounded-[20px] uppercase tracking-widest text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" /> Rejeitar
                    </button>
                    <button 
                      onClick={() => { onUpdateStatus(order, OrderStatus.PREPARING); onClose(); }}
                      className="flex-[2] py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-[20px] uppercase tracking-widest text-xs shadow-xl shadow-green-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" /> Aceitar
                    </button>
                  </>
                )}
                
                {order.status === OrderStatus.PREPARING && (
                  <>
                    <button 
                        onClick={() => { onRequestCancel(order, 'CANCEL'); onClose(); }}
                        className="flex-1 py-4 border-2 border-red-100 text-red-500 hover:bg-red-50 font-black rounded-[20px] uppercase tracking-widest text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        Cancelar Pedido
                    </button>
                    <button 
                        onClick={() => onDispatch(order)} 
                        className="flex-[2] py-4 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-[20px] uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        Despachar
                    </button>
                  </>
                )}

                {order.status === OrderStatus.DISPATCHED && (
                  <>
                    <button 
                        onClick={() => { onRequestCancel(order, 'CANCEL'); onClose(); }}
                        className="flex-1 py-4 border-2 border-red-100 text-red-500 hover:bg-red-50 font-black rounded-[20px] uppercase tracking-widest text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        Cancelar Pedido
                    </button>
                    <button 
                        onClick={() => onUpdateStatus(order, OrderStatus.DELIVERED)} 
                        className="flex-[2] py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-[20px] uppercase tracking-widest text-xs shadow-xl shadow-green-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        Concluir Entrega
                    </button>
                  </>
                )}

                {order.status === OrderStatus.DELIVERED && (
                    <button 
                        onClick={() => { onRequestCancel(order, 'CANCEL'); onClose(); }}
                        className="flex-1 py-4 border-2 border-red-100 text-red-500 hover:bg-red-50 font-black rounded-[20px] uppercase tracking-widest text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        Cancelar Pedido
                    </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botão Próximo (Relativo ao container) */}
        <button 
          onClick={(e) => { e.stopPropagation(); onNavigate('next'); }}
          className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all hover:scale-110 active:scale-95 shadow-lg border border-white/10 shrink-0 z-50"
        >
          <ChevronRight className="w-8 h-8 stroke-[3]" />
        </button>
      </div>
    </BaseModal>
  );
};