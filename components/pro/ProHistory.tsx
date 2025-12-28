
import React, { useState } from 'react';
import { Search, Calendar, FileText, CheckCircle, XCircle, ChevronRight, Clock, User, DollarSign } from 'lucide-react';
import { MOCK_ORDERS } from '../../constants';
import { Order, OrderStatus } from '../../types';

export default function ProHistory() {
  const [orders] = useState<Order[]>(MOCK_ORDERS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | OrderStatus.DELIVERED | OrderStatus.CANCELLED>('ALL');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(search.toLowerCase()) || 
                          order.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || order.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return { bg: 'bg-green-50 dark:bg-green-900/10', text: 'text-green-600', icon: <CheckCircle className="w-4 h-4" /> };
      case OrderStatus.CANCELLED:
        return { bg: 'bg-red-50 dark:bg-red-900/10', text: 'text-red-600', icon: <XCircle className="w-4 h-4" /> };
      default:
        return { bg: 'bg-blue-50 dark:bg-blue-900/10', text: 'text-blue-600', icon: <Clock className="w-4 h-4" /> };
    }
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Histórico de Vendas</h3>
          <p className="text-slate-500 font-medium">Consulte e audite pedidos finalizados.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder="Buscar por ID ou Cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 pr-4 py-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-sm text-slate-900 dark:text-white transition-all shadow-sm w-full md:w-64"
            />
          </div>
          
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-primary transition-all outline-none"
          >
            <option value="ALL">Todos os Status</option>
            <option value={OrderStatus.DELIVERED}>Entregues</option>
            <option value={OrderStatus.CANCELLED}>Cancelados</option>
          </select>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white dark:bg-surface-dark p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 flex items-center gap-4">
            <div className="size-12 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-2xl flex items-center justify-center">
               <DollarSign className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Receita Total</p>
               <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">R$ {filteredOrders.reduce((acc, o) => acc + o.total, 0).toFixed(2)}</p>
            </div>
         </div>
         <div className="bg-white dark:bg-surface-dark p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 flex items-center gap-4">
            <div className="size-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center">
               <FileText className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pedidos Realizados</p>
               <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{filteredOrders.length}</p>
            </div>
         </div>
         <div className="bg-white dark:bg-surface-dark p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 flex items-center gap-4">
            <div className="size-12 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-2xl flex items-center justify-center">
               <Calendar className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data do Filtro</p>
               <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Hoje</p>
            </div>
         </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-surface-dark rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">ID Pedido</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Cliente</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Data/Hora</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Total</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const statusInfo = getStatusStyle(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                      <td className="px-8 py-6">
                        <span className="font-mono text-xs font-bold text-slate-500 uppercase">#{order.id.split('-').pop()}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="size-8 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <User className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-black text-slate-900 dark:text-white">{order.customerName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 dark:text-gray-300">{order.timestamp.toLocaleDateString()}</span>
                          <span className="text-[10px] font-bold text-slate-400">{order.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-black text-slate-900 dark:text-white font-display">R$ {order.total.toFixed(2)}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-transparent ${statusInfo.bg} ${statusInfo.text} text-[10px] font-black uppercase tracking-widest`}>
                          {statusInfo.icon}
                          {order.status === OrderStatus.DELIVERED ? 'Entregue' : (order.status === OrderStatus.CANCELLED ? 'Cancelado' : order.status)}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                         <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-slate-400 hover:text-primary transition-all">
                            <ChevronRight className="w-5 h-5" />
                         </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-300">
                      <FileText className="w-12 h-12 opacity-20" />
                      <p className="font-bold">Nenhum pedido encontrado com estes filtros.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
