import React, { useMemo } from 'react';
import { X, TrendingUp, Calendar, ShoppingBag, Truck, Tag, MessageSquare, Star, Clock, AlertCircle, Heart } from 'lucide-react';
import { BaseModal } from '../ui/BaseModal';
import { storageService } from '../../services/storageService';
import { formatCurrency } from '../../shared/utils/mathEngine';
import { Order, OrderStatus } from '../../types';

interface CustomerDetailsModalProps {
    customer: any;
    onClose: () => void;
}

// Mock Feedbacks Dinâmicos
const getMockFeedbacks = (name: string) => {
    const n = name.toLowerCase();
    
    if (n.includes('joão')) {
        return [
            { id: 1, rating: 5, date: '15/12/2023', comment: 'O X-Tudo é imbatível! Melhor da cidade.' },
            { id: 2, rating: 5, date: '10/12/2023', comment: 'Entrega muito rápida, chegou quente.' },
            { id: 3, rating: 5, date: '01/12/2023', comment: 'Sempre peço, qualidade constante.' },
            { id: 4, rating: 5, date: '20/11/2023', comment: 'Atendimento nota 10.' }
        ];
    }
    if (n.includes('maria')) {
        return [
            { id: 1, rating: 4, date: '05/12/2023', comment: 'A batata estava ótima, mas o suco vazou um pouco.' },
            { id: 2, rating: 5, date: '25/11/2023', comment: 'Adoro o suco natural daqui!' },
            { id: 3, rating: 4, date: '15/11/2023', comment: 'Chegou no prazo.' }
        ];
    }
    if (n.includes('pedro')) {
        return [
            { id: 1, rating: 3, date: '20/10/2023', comment: 'O misto estava frio quando chegou.' },
            { id: 2, rating: 3, date: '10/09/2023', comment: 'Demorou mais que o previsto.' }
        ];
    }
    if (n.includes('ana')) {
        return [
            { id: 1, rating: 5, date: '12/12/2023', comment: 'Ótimo custo benefício com os cupons!' },
            { id: 2, rating: 5, date: '05/12/2023', comment: 'Hambúrguer gourmet delicioso.' },
            { id: 3, rating: 4, date: '28/11/2023', comment: 'Muito bom.' }
        ];
    }
    // Default / Lucas
    return [
        { id: 1, rating: 5, date: 'Hoje', comment: 'Primeira vez pedindo e adorei! Pizza top.' }
    ];
};

export const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({ customer, onClose }) => {
    
    // --- INTELLIGENCE ENGINE ---
    const stats = useMemo(() => {
        const allOrders = storageService.loadOrders();
        // Filtrar pedidos deste cliente (por WhatsApp ou Nome)
        const customerOrders = allOrders.filter(o => 
            (customer.whatsapp && o.customerWhatsapp === customer.whatsapp) || 
            (o.customerName === customer.name)
        ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Mais recentes primeiro

        const deliveredOrders = customerOrders.filter(o => o.status === OrderStatus.DELIVERED);

        // 1. CONSUMO & PREFERÊNCIAS
        const itemFrequency: Record<string, { count: number, type: 'FOOD' | 'DRINK', name: string }> = {};
        
        deliveredOrders.forEach(order => {
            order.items.forEach(item => {
                const isDrink = item.category?.toLowerCase().includes('bebida') || 
                                item.name.toLowerCase().includes('suco') || 
                                item.name.toLowerCase().includes('refri') ||
                                item.name.toLowerCase().includes('água') ||
                                item.name.toLowerCase().includes('coca') ||
                                item.name.toLowerCase().includes('cerveja') ||
                                item.name.toLowerCase().includes('café');
                
                if (!itemFrequency[item.id]) {
                    itemFrequency[item.id] = { count: 0, type: isDrink ? 'DRINK' : 'FOOD', name: item.name };
                }
                itemFrequency[item.id].count += item.quantity;
            });
        });

        const sortedItems = Object.values(itemFrequency).sort((a, b) => b.count - a.count);
        const topFoods = sortedItems.filter(i => i.type === 'FOOD').slice(0, 3);
        const topDrinks = sortedItems.filter(i => i.type === 'DRINK').slice(0, 3);

        // 2. RECORRÊNCIA
        let avgDaysBetween = 0;
        let daysSinceLast = 0;

        if (deliveredOrders.length > 0) {
            const lastOrderDate = new Date(deliveredOrders[0].timestamp);
            const today = new Date();
            const diffTime = Math.abs(today.getTime() - lastOrderDate.getTime());
            daysSinceLast = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (deliveredOrders.length > 1) {
                // Calcular média de intervalos
                let totalDaysDiff = 0;
                // Como está ordenado decrescente (Recente -> Antigo), iteramos invertido ou ajustamos a lógica
                const chronoOrders = [...deliveredOrders].reverse();
                
                for (let i = 1; i < chronoOrders.length; i++) {
                    const d1 = new Date(chronoOrders[i-1].timestamp).getTime();
                    const d2 = new Date(chronoOrders[i].timestamp).getTime();
                    totalDaysDiff += (d2 - d1);
                }
                
                const avgMs = totalDaysDiff / (chronoOrders.length - 1);
                avgDaysBetween = Math.ceil(avgMs / (1000 * 60 * 60 * 24));
            }
        }

        // 3. FINANCEIRO OPERACIONAL
        const financials = deliveredOrders.reduce((acc, order) => ({
            products: acc.products + (order.subtotal || order.total), // Fallback se subtotal não existir
            fees: acc.fees + (order.deliveryFee || 0),
            discounts: acc.discounts + (order.discount || 0)
        }), { products: 0, fees: 0, discounts: 0 });

        // 4. FEEDBACK & SATISFAÇÃO (Dinâmico)
        const feedbacks = getMockFeedbacks(customer.name);

        let averageRating: string | null = null;
        if (feedbacks.length > 0) {
            const totalStars = feedbacks.reduce((acc, curr) => acc + curr.rating, 0);
            averageRating = (totalStars / feedbacks.length).toFixed(1); // Ex: "4.7"
        }

        return {
            totalOrders: customerOrders.length,
            deliveredCount: deliveredOrders.length,
            topFoods,
            topDrinks,
            avgDaysBetween,
            daysSinceLast,
            financials,
            feedbacks,
            averageRating,
            history: customerOrders
        };
    }, [customer]);

    return (
        <BaseModal onClose={onClose} className="max-w-4xl w-full h-[85vh]" hideCloseButton={true}>
            <div className="flex flex-col h-full bg-[#f8f6f6] dark:bg-background-dark rounded-[32px] overflow-hidden relative">
                
                {/* HEADER */}
                <div className="bg-white dark:bg-surface-dark px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="size-14 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-slate-400 font-black text-xl">
                            {customer.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{customer.name}</h2>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-sm font-bold text-slate-500">{customer.whatsapp}</span>
                                <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
                                <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-current" /> {customer.points} pontos
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl hover:text-red-500 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* CONTENT SCROLLABLE */}
                <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                    
                    {/* SEÇÃO 1: COMPORTAMENTO DE CONSUMO */}
                    <div className="mb-10 border-b border-dashed border-gray-200 dark:border-gray-700/50 pb-10">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" /> Padrão de Consumo
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Card Preferidos */}
                            <div className="bg-white dark:bg-surface-dark p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 md:col-span-2">
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><ShoppingBag className="w-3 h-3" /> Pratos Favoritos</p>
                                        {stats.topFoods.length > 0 ? (
                                            <ul className="space-y-3">
                                                {stats.topFoods.map((item, idx) => (
                                                    <li key={idx} className="flex items-center gap-3">
                                                        <span className="flex size-6 items-center justify-center bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg text-[10px] font-black">{idx + 1}</span>
                                                        <span className="text-sm font-bold text-slate-700 dark:text-gray-200 line-clamp-1">{item.name}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 ml-auto">{item.count}x</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : <p className="text-xs text-slate-400 italic">Sem dados suficientes</p>}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><span className="text-blue-400">🥤</span> Bebidas Favoritas</p>
                                        {stats.topDrinks.length > 0 ? (
                                            <ul className="space-y-3">
                                                {stats.topDrinks.map((item, idx) => (
                                                    <li key={idx} className="flex items-center gap-3">
                                                        <span className="flex size-6 items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg text-[10px] font-black">{idx + 1}</span>
                                                        <span className="text-sm font-bold text-slate-700 dark:text-gray-200 line-clamp-1">{item.name}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 ml-auto">{item.count}x</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : <p className="text-xs text-slate-400 italic">Sem dados suficientes</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Card Recorrência */}
                            <div className="bg-white dark:bg-surface-dark p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-center gap-6">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Média de Recompra</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.avgDaysBetween || '--'}</span>
                                        <span className="text-sm font-bold text-slate-500">dias</span>
                                    </div>
                                    <p className="text-[10px] text-green-600 font-bold mt-1">Ciclo estimado</p>
                                </div>
                                <div className="h-px bg-gray-100 dark:bg-gray-800"></div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Último Pedido</p>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-[#EA2831]" />
                                        <span className="text-lg font-black text-slate-900 dark:text-white">{stats.daysSinceLast === 0 ? 'Hoje' : `Há ${stats.daysSinceLast} dias`}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEÇÃO 2: FINANCEIRO OPERACIONAL */}
                    <div className="mb-10 border-b border-dashed border-gray-200 dark:border-gray-700/50 pb-10">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-primary" /> Raio-X de Gastos
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Breakdown de Valores */}
                            <div className="bg-white dark:bg-surface-dark p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white dark:bg-gray-700 rounded-lg text-slate-600 dark:text-gray-300"><ShoppingBag className="w-4 h-4" /></div>
                                            <span className="text-xs font-bold text-slate-600 dark:text-gray-300 uppercase">Em Produtos</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(stats.financials.products)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white dark:bg-gray-700 rounded-lg text-slate-600 dark:text-gray-300"><Truck className="w-4 h-4" /></div>
                                            <span className="text-xs font-bold text-slate-600 dark:text-gray-300 uppercase">Taxas de Entrega</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(stats.financials.fees)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white dark:bg-green-900/30 rounded-lg text-green-600"><Tag className="w-4 h-4" /></div>
                                            <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase">Descontos Obtidos</span>
                                        </div>
                                        <span className="text-sm font-black text-green-700 dark:text-green-400">{formatCurrency(stats.financials.discounts)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Simplificada */}
                            <div className="bg-white dark:bg-surface-dark p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><Calendar className="w-3 h-3" /> Histórico Recente</p>
                                <div className="flex-1 overflow-y-auto max-h-[140px] no-scrollbar space-y-2 pr-2">
                                    {stats.history.length > 0 ? stats.history.map((order, i) => (
                                        <div key={order.id} className="flex justify-between items-center text-xs border-b border-gray-50 dark:border-gray-800 pb-2 last:border-0">
                                            <span className="font-bold text-slate-700 dark:text-gray-300">{new Date(order.timestamp).toLocaleDateString()}</span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-slate-500">{order.status}</span>
                                            <span className="font-mono text-slate-400">#{order.id.slice(-4)}</span>
                                        </div>
                                    )) : (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-300">
                                            <AlertCircle className="w-6 h-6 mb-1 opacity-50" />
                                            <span className="text-[10px] font-bold uppercase">Sem histórico</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEÇÃO 3: FEEDBACK & SATISFAÇÃO */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-primary" /> Feedbacks do Cliente
                            </h3>
                            
                            {/* MÉDIA DE AVALIAÇÃO - DESTAQUE */}
                            {stats.averageRating ? (
                                <div className="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-900/10 px-4 py-2 rounded-2xl border border-yellow-100 dark:border-yellow-900/30">
                                    <div className="flex flex-col items-end">
                                        <span className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight">{stats.averageRating}</span>
                                        <span className="text-[9px] font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-widest">Média Geral</span>
                                    </div>
                                    <div className="h-8 w-px bg-yellow-200 dark:bg-yellow-800/30 mx-1"></div>
                                    <div className="flex text-yellow-400 drop-shadow-sm">
                                        <Star className="fill-current w-6 h-6" />
                                    </div>
                                </div>
                            ) : (
                                <span className="text-xs font-bold text-slate-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg">Sem avaliações</span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {stats.feedbacks.length > 0 ? stats.feedbacks.map(fb => (
                                <div key={fb.id} className="bg-white dark:bg-surface-dark p-5 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex gap-0.5 text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3.5 h-3.5 ${i < fb.rating ? 'fill-current' : 'text-gray-200 dark:text-gray-700'}`} />
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-md">{fb.date}</span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-600 dark:text-gray-300 italic leading-relaxed">"{fb.comment}"</p>
                                </div>
                            )) : (
                                <div className="col-span-full py-8 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[24px]">
                                    <p className="text-sm font-bold text-slate-300">Nenhum feedback registrado.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
};