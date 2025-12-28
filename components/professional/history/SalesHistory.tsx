
import React, { useState, useEffect } from 'react';
import { Search, FileText, CheckCircle, XCircle, Clock, User, DollarSign, Wallet, Zap, Layers, Bike, CreditCard } from 'lucide-react';
import { Order, OrderStatus, CashierHistoryRecord } from '../../../types';
import { storageService } from '../../../services/storageService';
import { formatCurrency } from '../../../shared/utils/mathEngine';
import CashierDetailModal from '../../admin/history/CashierDetailModal';

type HistoryView = 'SALES' | 'CASHIER';

export const SalesHistory: React.FC = () => {
  const [activeView, setActiveView] = useState<HistoryView>('SALES');
  const [orders, setOrders] = useState<Order[]>([]);
  const [cashierHistory, setCashierHistory] = useState<CashierHistoryRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | OrderStatus.DELIVERED | OrderStatus.CANCELLED>('ALL');
  
  const [selectedAudit, setSelectedAudit] = useState<CashierHistoryRecord | null>(null);

  useEffect(() => {
      const loadedOrders = storageService.loadOrders();
      setOrders(loadedOrders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      
      const loadedCashier = storageService.loadCashierHistory();
      setCashierHistory(loadedCashier);
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(search.toLowerCase()) || 
                          order.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || order.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED: return { bg: 'bg-emerald-50 dark:bg-emerald-900/10', text: 'text-emerald-600', border: 'border-emerald-100', icon: <CheckCircle className="w-3 h-3" /> };
      case OrderStatus.CANCELLED: return { bg: 'bg-red-50 dark:bg-red-900/10', text: 'text-red-600', border: 'border-red-100', icon: <XCircle className="w-3 h-3" /> };
      default: return { bg: 'bg-blue-50 dark:bg-blue-900/10', text: 'text-blue-600', border: 'border-blue-100', icon: <Clock className="w-3 h-3" /> };
    }
  };

  const getChannelInfo = (order: Order) => {
      if (order.isDelivery) {
          return { label: 'DELIVERY', color: 'bg-blue-50 text-blue-600 border-blue-200', icon: Bike };
      }
      if (order.tableNumber) {
          return { label: `MESA ${order.tableNumber}`, color: 'bg-yellow-50 text-yellow-600 border-yellow-200', icon: Layers };
      }
      return { label: 'BALCÃO / PDV', color: 'bg-green-50 text-green-600 border-green-200', icon: Zap };
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 mt-1">
            <button 
            onClick={() => setActiveView('SALES')}
            className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 pb-1 ${activeView === 'SALES' ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
            >
            Todas as Vendas
            </button>
            <button 
            onClick={() => setActiveView('CASHIER')}
            className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 pb-1 ${activeView === 'CASHIER' ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
            >
            Auditoria de Caixa
            </button>
        </div>

        {activeView === 'SALES' && (
            <div className="flex items-center gap-3">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary w-3.5 h-3.5" />
                    <input 
                    type="text" 
                    placeholder="Buscar pedido ou cliente..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary font-bold text-xs shadow-sm w-full md:w-64 transition-all"
                    />
                </div>
                <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary outline-none transition-all">
                    <option value="ALL">Status: Todos</option>
                    <option value={OrderStatus.DELIVERED}>Concluídos</option>
                    <option value={OrderStatus.CANCELLED}>Cancelados</option>
                </select>
            </div>
        )}
      </div>

      {activeView === 'SALES' ? (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-surface-dark p-5 rounded-[24px] border border-gray-100 dark:border-gray-800 flex items-center gap-4 shadow-sm">
                    <div className="size-10 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl flex items-center justify-center"><DollarSign className="w-5 h-5" /></div>
                    <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Vendido</p><p className="text-lg font-black tracking-tight font-display text-slate-900 dark:text-white">{formatCurrency(filteredOrders.reduce((acc, o) => acc + o.total, 0))}</p></div>
                </div>
                <div className="bg-white dark:bg-surface-dark p-5 rounded-[24px] border border-gray-100 dark:border-gray-800 flex items-center gap-4 shadow-sm">
                    <div className="size-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center"><Bike className="w-5 h-5" /></div>
                    <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Delivery</p><p className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{filteredOrders.filter(o => o.isDelivery).length} pedidos</p></div>
                </div>
                <div className="bg-white dark:bg-surface-dark p-5 rounded-[24px] border border-gray-100 dark:border-gray-800 flex items-center gap-4 shadow-sm">
                    <div className="size-10 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 rounded-xl flex items-center justify-center"><Layers className="w-5 h-5" /></div>
                    <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mesas</p><p className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{filteredOrders.filter(o => o.tableNumber).length} atendimentos</p></div>
                </div>
                <div className="bg-white dark:bg-surface-dark p-5 rounded-[24px] border border-gray-100 dark:border-gray-800 flex items-center gap-4 shadow-sm">
                    <div className="size-10 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl flex items-center justify-center"><Zap className="w-5 h-5" /></div>
                    <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Venda Rápida</p><p className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{filteredOrders.filter(o => !o.isDelivery && !o.tableNumber).length} vendas</p></div>
                </div>
            </div>

            <div className="bg-white dark:bg-surface-dark rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID / Horário</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Canal de Venda</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pagamento</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {filteredOrders.map(o => {
                    const statusInfo = getStatusStyle(o.status);
                    const channelInfo = getChannelInfo(o);
                    const ChannelIcon = channelInfo.icon;

                    return (
                        <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group">
                        <td className="px-6 py-5">
                            <div className="flex flex-col">
                                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">#{o.id.slice(-4)}</span>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mt-0.5">
                                    <Clock className="w-3 h-3" />
                                    {new Date(o.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-5">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-wider ${channelInfo.color}`}>
                                <ChannelIcon className="w-3 h-3" />
                                {channelInfo.label}
                            </div>
                        </td>
                        <td className="px-6 py-5">
                            <div className="flex items-center gap-2.5">
                                <div className="size-7 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                                    <User className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-xs font-bold text-slate-700 dark:text-gray-300 truncate max-w-[150px]">{o.customerName}</span>
                            </div>
                        </td>
                        <td className="px-6 py-5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-gray-400">
                                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                                <span className="truncate max-w-[120px]">{o.paymentMethod || 'Não informado'}</span>
                            </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                            <span className="text-sm font-black text-slate-900 dark:text-white font-display">{formatCurrency(o.total)}</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border} text-[9px] font-black uppercase tracking-widest`}>
                                {statusInfo.icon}
                                {o.status === OrderStatus.DELIVERED ? 'Concluído' : (o.status === OrderStatus.CANCELLED ? 'Cancelado' : o.status)}
                            </div>
                        </td>
                        </tr>
                    );
                    })}
                </tbody>
                </table>
            </div>
        </div>
      ) : (
        <div className="space-y-6">
            <div className="bg-white dark:bg-surface-dark rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden animate-[fadeIn_0.3s]">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data / Turno</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Responsável</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Final</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status Fechamento</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {cashierHistory.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center">
                                    <div className="flex flex-col items-center gap-4 text-slate-300">
                                        <Wallet className="w-12 h-12 opacity-20" />
                                        <p className="font-bold text-xs uppercase tracking-widest">Nenhum turno fechado registrado</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            cashierHistory.map(record => (
                                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-slate-900 dark:text-white">{record.openedAt.toLocaleDateString()}</span>
                                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                                                <Clock className="w-3 h-3" />
                                                {record.openedAt.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {record.closedAt.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"><User className="w-3 h-3" /></div>
                                            <span className="text-xs font-bold text-slate-700 dark:text-gray-300">{record.responsibleName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 font-black text-sm text-slate-900 dark:text-white">
                                        {formatCurrency(record.finalRealValue)}
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="text-xs font-bold text-slate-500">{record.status}</span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button 
                                            onClick={() => setSelectedAudit(record)}
                                            className="text-xs font-black text-primary hover:underline uppercase tracking-widest"
                                        >
                                            Ver Mais
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {selectedAudit && (
          <CashierDetailModal 
            record={selectedAudit}
            onClose={() => setSelectedAudit(null)}
          />
      )}
    </div>
  );
};
