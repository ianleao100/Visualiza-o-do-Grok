
import React, { useMemo, useState } from 'react';
import { X, TrendingUp, Calendar, ShoppingBag, Truck, Tag, Star, Clock, CreditCard, DollarSign, Eye, MousePointer, Activity, Trash2, Smartphone, Banknote, QrCode, AlertCircle, ArrowUpRight, Cake, FileText } from 'lucide-react';
import { BaseModal } from '../../ui/BaseModal';
import { storageService } from '../../../services/storageService';
import { formatCurrency, roundFinance } from '../../../shared/utils/mathEngine';
import { Order, OrderStatus, CustomerProfile } from '../../../types';

interface CustomerDetailsModalProps {
    customer: CustomerProfile;
    onClose: () => void;
}

// Mock Estendido de Comportamento (Pixel Data)
const getPixelData = (customerId: string) => {
    const seed = customerId.charCodeAt(0) || 0;
    return {
        topViewed: ['Smash Burger Duplo', 'Batata Suprema', 'Milkshake Oreo'],
        leastViewed: ['Salada Simples', 'Água com Gás'],
        addedToCart: ['Smash Burger Duplo', 'Coca-Cola Zero', 'Brownie'],
        removedFromCart: ['Salada Simples'],
        mostActiveDay: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'][seed % 7],
        activeHours: '19h às 21h',
        platform: seed % 2 === 0 ? 'iOS App' : 'Android App'
    };
};

export const CustomerDetailModal: React.FC<CustomerDetailsModalProps> = ({ customer, onClose }) => {
    const [activeTab, setActiveTab] = useState<'GERAL' | 'HISTORICO' | 'COMPORTAMENTO'>('GERAL');

    // --- INTELLIGENCE ENGINE ---
    const stats = useMemo(() => {
        const allOrders = storageService.loadOrders();
        const customerOrders = allOrders.filter(o => 
            (customer.whatsapp && o.customerWhatsapp === customer.whatsapp) || 
            (o.customerName === customer.name)
        ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        const deliveredOrders = customerOrders.filter(o => o.status === OrderStatus.DELIVERED);

        // 1. PREFERÊNCIAS
        const itemFreq: Record<string, { count: number, type: 'FOOD' | 'DRINK', name: string }> = {};
        deliveredOrders.forEach(order => {
            order.items.forEach(item => {
                const isDrink = item.category?.toLowerCase().includes('bebida') || 
                                ['suco','refri','água','coca','cerveja','drink'].some(k => item.name.toLowerCase().includes(k));
                if (!itemFreq[item.id]) itemFreq[item.id] = { count: 0, type: isDrink ? 'DRINK' : 'FOOD', name: item.name };
                itemFreq[item.id].count += item.quantity;
            });
        });
        const sortedItems = Object.values(itemFreq).sort((a, b) => b.count - a.count);
        const topFoods = sortedItems.filter(i => i.type === 'FOOD').slice(0, 3);
        const topDrinks = sortedItems.filter(i => i.type === 'DRINK').slice(0, 3);

        // 2. RECORRÊNCIA
        let avgDays = 0, daysSinceLast = 0;
        if (deliveredOrders.length > 0) {
            const lastDate = new Date(deliveredOrders[0].timestamp);
            daysSinceLast = Math.floor(Math.abs(new Date().getTime() - lastDate.getTime()) / (864e5));

            if (deliveredOrders.length > 1) {
                let totalDiff = 0;
                const ascOrders = [...deliveredOrders].reverse();
                for (let i = 1; i < ascOrders.length; i++) {
                    totalDiff += new Date(ascOrders[i].timestamp).getTime() - new Date(ascOrders[i-1].timestamp).getTime();
                }
                avgDays = Math.ceil((totalDiff / (deliveredOrders.length - 1)) / 864e5);
            }
        }

        // 3. FINANCEIRO DETALHADO (Bucket Payments)
        const financials = deliveredOrders.reduce((acc, order) => {
            acc.products += (order.subtotal || order.total);
            acc.fees += (order.deliveryFee || 0);
            acc.discounts += (order.discount || 0);

            const methodUpper = (order.paymentMethod || '').toUpperCase();
            if (methodUpper.includes('PIX')) acc.methods.pix += order.total;
            else if (methodUpper.includes('CRÉDITO') || methodUpper.includes('CREDIT')) acc.methods.credit += order.total;
            else if (methodUpper.includes('DÉBITO') || methodUpper.includes('DEBIT')) acc.methods.debit += order.total;
            else if (methodUpper.includes('DINHEIRO') || methodUpper.includes('CASH')) acc.methods.cash += order.total;
            else acc.methods.other += order.total;

            return acc;
        }, { 
            products: 0, fees: 0, discounts: 0, 
            methods: { pix: 0, credit: 0, debit: 0, cash: 0, other: 0 } 
        });

        const avgTicket = deliveredOrders.length > 0 
            ? (financials.products + financials.fees - financials.discounts) / deliveredOrders.length 
            : 0;

        return {
            count: deliveredOrders.length,
            topFoods, topDrinks, avgDays, daysSinceLast, avgTicket,
            financials, 
            history: customerOrders,
            pixel: getPixelData(customer.id)
        };
    }, [customer]);

    const TabButton = ({ id, label, icon: Icon }: any) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all outline-none focus:outline-none focus:ring-0 ${
                activeTab === id 
                ? 'border-[#EA2831] text-[#EA2831]' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );

    return (
        <BaseModal onClose={onClose} className="max-w-5xl w-full h-[90vh]" hideCloseButton={true}>
            <div className="flex flex-col h-full bg-[#f8f6f6] dark:bg-background-dark rounded-[32px] overflow-hidden">
                
                {/* HEADER */}
                <div className="bg-white dark:bg-surface-dark px-8 pt-6 pb-0 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-5">
                            <div className="size-16 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-slate-400 font-black text-2xl border-4 border-white dark:border-gray-700 shadow-sm">
                                {customer.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{customer.name}</h2>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-sm font-bold text-slate-500">{customer.whatsapp}</span>
                                    {customer.birthDate && (
                                        <>
                                            <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
                                            <span className="text-sm font-bold text-slate-500 flex items-center gap-1">
                                                <Cake className="w-3 h-3 text-slate-400" /> {customer.birthDate}
                                            </span>
                                        </>
                                    )}
                                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
                                    <span className="text-xs font-black text-[#EA2831] bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-md flex items-center gap-1 border border-red-100 dark:border-red-900/30">
                                        <Star className="w-3 h-3 fill-current" /> {customer.points} pts
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors focus:ring-0 focus:outline-none">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <TabButton id="GERAL" label="Visão Geral" icon={Activity} />
                        <TabButton id="HISTORICO" label="Histórico de Pedidos" icon={Calendar} />
                        <TabButton id="COMPORTAMENTO" label="Comportamento (Pixel)" icon={MousePointer} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-8">
                    
                    {/* --- SESSÃO GERAL --- */}
                    {activeTab === 'GERAL' && (
                        <div className="space-y-8 animate-[fadeIn_0.3s]">
                            
                            {/* ALERTA DE OBSERVAÇÕES / ALERGIAS */}
                            {customer.observations && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-[20px] border border-yellow-200 dark:border-yellow-900/30 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs font-black text-yellow-700 dark:text-yellow-500 uppercase tracking-widest mb-1">Observações / Alergias</h4>
                                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400 leading-relaxed">{customer.observations}</p>
                                    </div>
                                </div>
                            )}

                            {/* 1. MÉTRICAS DE COMPRA */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-surface-dark p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                                    <div className="size-12 bg-red-50 dark:bg-red-900/20 text-[#EA2831] rounded-2xl flex items-center justify-center"><TrendingUp className="w-6 h-6" /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recorrência</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">A cada {stats.avgDays || '--'} dias</p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-surface-dark p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                                    <div className="size-12 bg-red-50 dark:bg-red-900/20 text-[#EA2831] rounded-2xl flex items-center justify-center"><DollarSign className="w-6 h-6" /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket Médio</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{formatCurrency(stats.avgTicket)}</p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-surface-dark p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                                    <div className="size-12 bg-red-50 dark:bg-red-900/20 text-[#EA2831] rounded-2xl flex items-center justify-center"><Clock className="w-6 h-6" /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Último Pedido</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{stats.daysSinceLast === 0 ? 'Hoje' : `Há ${stats.daysSinceLast} dias`}</p>
                                    </div>
                                </div>
                            </div>

                            {/* 2. PREFERÊNCIAS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-surface-dark p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800">
                                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-[#EA2831]" /> Pratos Favoritos</h3>
                                    <div className="space-y-3">
                                        {stats.topFoods.length > 0 ? stats.topFoods.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                <span className="font-bold text-slate-700 dark:text-gray-300 flex items-center gap-2">
                                                    <span className="flex size-5 items-center justify-center bg-red-50 dark:bg-red-900/20 rounded text-[10px] font-black text-[#EA2831]">#{idx + 1}</span> 
                                                    {item.name}
                                                </span>
                                                <span className="font-black text-slate-400 bg-slate-50 dark:bg-gray-800 px-2 py-0.5 rounded">{item.count}x</span>
                                            </div>
                                        )) : <p className="text-xs text-slate-400">Sem dados.</p>}
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-surface-dark p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800">
                                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2"><span className="text-[#EA2831]">🥤</span> Bebidas Favoritas</h3>
                                    <div className="space-y-3">
                                        {stats.topDrinks.length > 0 ? stats.topDrinks.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                <span className="font-bold text-slate-700 dark:text-gray-300 flex items-center gap-2">
                                                    <span className="flex size-5 items-center justify-center bg-red-50 dark:bg-red-900/20 rounded text-[10px] font-black text-[#EA2831]">#{idx + 1}</span> 
                                                    {item.name}
                                                </span>
                                                <span className="font-black text-slate-400 bg-slate-50 dark:bg-gray-800 px-2 py-0.5 rounded">{item.count}x</span>
                                            </div>
                                        )) : <p className="text-xs text-slate-400">Sem dados.</p>}
                                    </div>
                                </div>
                            </div>

                            {/* 3. FINANCEIRO DETALHADO */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* CARD PAGAMENTOS */}
                                <div className="bg-white dark:bg-surface-dark p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800">
                                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2"><CreditCard className="w-4 h-4 text-[#EA2831]" /> Formas de Pagamento</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex flex-col gap-1 hover:bg-red-50/50 transition-colors group border border-transparent hover:border-red-100 dark:hover:border-red-900/30">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase group-hover:text-[#EA2831]"><CreditCard className="w-3 h-3" /> Crédito</div>
                                            <span className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(stats.financials.methods.credit)}</span>
                                        </div>
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex flex-col gap-1 hover:bg-red-50/50 transition-colors group border border-transparent hover:border-red-100 dark:hover:border-red-900/30">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase group-hover:text-[#EA2831]"><Smartphone className="w-3 h-3" /> Débito</div>
                                            <span className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(stats.financials.methods.debit)}</span>
                                        </div>
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex flex-col gap-1 hover:bg-red-50/50 transition-colors group border border-transparent hover:border-red-100 dark:hover:border-red-900/30">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase group-hover:text-[#EA2831]"><QrCode className="w-3 h-3" /> PIX</div>
                                            <span className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(stats.financials.methods.pix)}</span>
                                        </div>
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex flex-col gap-1 hover:bg-red-50/50 transition-colors group border border-transparent hover:border-red-100 dark:hover:border-red-900/30">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase group-hover:text-[#EA2831]"><Banknote className="w-3 h-3" /> Dinheiro</div>
                                            <span className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(stats.financials.methods.cash)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* CARD COMPOSIÇÃO */}
                                <div className="bg-slate-900 text-white p-6 rounded-[24px] shadow-lg flex flex-col justify-between">
                                    <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-white/80"><Tag className="w-4 h-4 text-[#EA2831]" /> Composição de Gastos</h3>
                                    <div className="space-y-6 mt-4">
                                        <div className="flex justify-between items-end border-b border-white/10 pb-2">
                                            <span className="text-xs font-bold opacity-60">Em Produtos</span>
                                            <span className="text-xl font-black">{formatCurrency(stats.financials.products)}</span>
                                        </div>
                                        <div className="flex justify-between items-end border-b border-white/10 pb-2">
                                            <span className="text-xs font-bold opacity-60">Taxas de Entrega</span>
                                            <span className="text-xl font-black">{formatCurrency(stats.financials.fees)}</span>
                                        </div>
                                        <div className="flex justify-between items-end text-[#EA2831]">
                                            <span className="text-xs font-bold text-white/90">Descontos Recebidos</span>
                                            <span className="text-xl font-black">- {formatCurrency(stats.financials.discounts)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- SESSÃO HISTÓRICO --- */}
                    {activeTab === 'HISTORICO' && (
                        <div className="space-y-4 animate-[fadeIn_0.3s]">
                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2"><Clock className="w-4 h-4 text-[#EA2831]" /> Pedidos Realizados</h3>
                            <div className="bg-white dark:bg-surface-dark rounded-[24px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                                {stats.history.length > 0 ? (
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resumo</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valor</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {stats.history.map(order => (
                                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-sm text-slate-700 dark:text-gray-300">{new Date(order.timestamp).toLocaleDateString()}</span>
                                                        <p className="text-[10px] text-slate-400 font-bold">{new Date(order.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-xs text-slate-600 dark:text-gray-400 line-clamp-1 max-w-[200px]">{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="font-black text-sm text-slate-900 dark:text-white">{formatCurrency(order.total)}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                                                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-12 text-center text-slate-400">
                                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Nenhum pedido no histórico</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- SESSÃO COMPORTAMENTO --- */}
                    {activeTab === 'COMPORTAMENTO' && (
                        <div className="space-y-8 animate-[fadeIn_0.3s]">
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-surface-dark p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-[#EA2831]"><Eye className="w-4 h-4" /></div>
                                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Mais Visualizados</h4>
                                    </div>
                                    <ul className="space-y-2">
                                        {stats.pixel.topViewed.map((item, i) => (
                                            <li key={i} className="text-xs font-bold text-slate-600 dark:text-gray-400 border-l-2 border-[#EA2831]/20 pl-3 py-1">{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-white dark:bg-surface-dark p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-[#EA2831]"><ShoppingBag className="w-4 h-4" /></div>
                                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Colocou na Sacola</h4>
                                    </div>
                                    <ul className="space-y-2">
                                        {stats.pixel.addedToCart.map((item, i) => (
                                            <li key={i} className="text-xs font-bold text-slate-600 dark:text-gray-400 border-l-2 border-[#EA2831]/20 pl-3 py-1">{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-white dark:bg-surface-dark p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-[#EA2831]"><Trash2 className="w-4 h-4" /></div>
                                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Removeu da Sacola</h4>
                                    </div>
                                    <ul className="space-y-2">
                                        {stats.pixel.removedFromCart.map((item, i) => (
                                            <li key={i} className="text-xs font-bold text-slate-600 dark:text-gray-400 border-l-2 border-[#EA2831]/20 pl-3 py-1">{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-gray-800/30 p-8 rounded-[32px] border border-gray-200 dark:border-gray-800">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Activity className="w-4 h-4 text-[#EA2831]" /> Padrão de Atividade</h3>
                                <div className="flex flex-col md:flex-row gap-8 justify-around items-center">
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Dia Mais Ativo</p>
                                        <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.pixel.mostActiveDay}</p>
                                    </div>
                                    <div className="w-px h-12 bg-gray-200 dark:bg-gray-700 hidden md:block"></div>
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Horário de Pico</p>
                                        <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.pixel.activeHours}</p>
                                    </div>
                                    <div className="w-px h-12 bg-gray-200 dark:bg-gray-700 hidden md:block"></div>
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Plataforma</p>
                                        <p className="text-xl font-black text-slate-900 dark:text-white">{stats.pixel.platform}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </BaseModal>
    );
};
