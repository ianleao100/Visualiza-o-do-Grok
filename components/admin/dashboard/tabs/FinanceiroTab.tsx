
import React, { useMemo } from 'react';
import { useAdminAnalytics } from '../../../../hooks/core/useAdminAnalytics';
import { useFinancialCalculations } from '../../../../hooks/useFinancialCalculations';
import { formatCurrency } from '../../../../shared/utils/mathEngine';
import { ShoppingBag, CreditCard, TrendingUp, DollarSign, Wallet, Package, Clock, Filter, ArrowDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

interface FinanceiroTabProps {
    dateFilter: string;
    customRange?: { start: string, end: string };
}

const COLORS_RED = ['#EA2831', '#7F1D1D', '#FCA5A5', '#B91C1C', '#F87171'];
const COLORS_MONOCHROME = ['#171717', '#525252', '#A3A3A3', '#D4D4D4'];

export const FinanceiroTab: React.FC<FinanceiroTabProps> = ({ dateFilter, customRange }) => {
    // 1. Get Analytics Data based on Date Filter
    const { 
        totalRevenue, 
        totalCount,
        avgTicket,
        avgItemsPerOrder,
        peakHoursData,
        trendData, // Now includes count!
        channelBreakdown,
        funnelData // Dados do Funil (Visitas -> Carrinho -> Pedidos)
    } = useAdminAnalytics(dateFilter, customRange);

    const { paymentBreakdown } = useFinancialCalculations();

    // 4. Chart Data Preparation
    const channelData = [
        { name: 'Mesa', value: channelBreakdown.tables },
        { name: 'Delivery', value: channelBreakdown.delivery },
        { name: 'Venda Rápida', value: channelBreakdown.pos },
    ].filter(d => d.value > 0);

    const methodData = [
        { name: 'Pix', value: paymentBreakdown.PIX },
        { name: 'Cartão', value: paymentBreakdown.CARD },
        { name: 'Dinheiro', value: paymentBreakdown.CASH },
    ].filter(d => d.value > 0);

    const last7DaysData = trendData.slice(-7);

    // Cálculos do Funil
    const totalVisits = funnelData.find(d => d.name === 'Visualizações')?.value || 0;
    const totalOrders = funnelData.find(d => d.name === 'Pedidos')?.value || 0;
    const conversionRate = totalVisits > 0 ? ((totalOrders / totalVisits) * 100).toFixed(1) : '0.0';

    return (
        <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
            
            {/* CARDS PRINCIPAIS: Faturamento e Pedidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* CARD 1: Faturamento */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-between h-[280px]">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-[#EA2831]" /> Faturamento Total
                            </p>
                            <div className="flex items-baseline gap-3">
                                <p className="text-4xl font-black text-[#EA2831] tracking-tight leading-none">{formatCurrency(totalRevenue)}</p>
                                <span className="bg-green-50 text-green-600 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> +12%
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Gráfico de Barras: Vendas (Dinheiro) */}
                    <div className="h-32 w-full mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={last7DaysData}>
                                <Bar dataKey="sales" radius={[4, 4, 4, 4]}>
                                    {last7DaysData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={index === last7DaysData.length - 1 ? '#EA1D2C' : '#E8E8E8'} 
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* CARD 2: Total de Pedidos */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-between h-[280px]">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4 text-slate-900" /> Total de Pedidos
                            </p>
                            <div className="flex items-baseline gap-3">
                                <p className="text-4xl font-black text-slate-900 tracking-tight leading-none">{totalCount}</p>
                                <span className="bg-green-50 text-green-600 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> +5%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Gráfico de Barras: Volume (Quantidade) */}
                    <div className="h-32 w-full mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={last7DaysData}>
                                <Bar dataKey="count" radius={[4, 4, 4, 4]}>
                                    {last7DaysData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={index === last7DaysData.length - 1 ? '#EA1D2C' : '#E8E8E8'} 
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* MINI CARDS: Ticket, Itens e Pico */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Ticket Médio */}
                <div className="bg-white p-6 rounded-[12px] shadow-sm border border-slate-100 flex flex-col justify-between h-36">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Ticket Médio</span>
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900 tracking-tight">{formatCurrency(avgTicket)}</p>
                </div>

                {/* 2. Média de Itens */}
                <div className="bg-white p-6 rounded-[12px] shadow-sm border border-slate-100 flex flex-col justify-between h-36">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Itens por Pedido</span>
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Package className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900 tracking-tight">{avgItemsPerOrder} <span className="text-xs text-slate-400 font-bold uppercase">produtos</span></p>
                </div>

                {/* 3. Vendas por Hora (Gráfico) */}
                <div className="bg-white p-4 rounded-[12px] shadow-sm border border-slate-100 flex flex-col justify-between h-36 relative">
                     <div className="flex justify-between items-center mb-2 px-2">
                        <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Vendas por Hora</span>
                        <Clock className="w-4 h-4 text-slate-400" />
                     </div>
                     <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={peakHoursData} margin={{top: 5, right: 5, left: 5, bottom: 0}}>
                                <Tooltip 
                                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold'}}
                                    itemStyle={{color: '#EA1D2C'}}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="orders" 
                                    stroke="#EA1D2C" 
                                    strokeWidth={2} 
                                    dot={false} 
                                    activeDot={{r: 4}} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                     </div>
                </div>
            </div>

            {/* SEÇÃO: FUNIL DE VENDAS */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                    <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
                        <Filter className="w-5 h-5 text-[#EA2831]" /> Funil de Conversão
                    </h3>
                    <p className="text-xs text-slate-500 font-bold mb-6">Eficiência do cardápio digital (Visitas → Vendas)</p>
                    
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={100} 
                                    tick={{fontSize: 11, fontWeight: 700, fill: '#64748B'}} 
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                                />
                                <Bar dataKey="value" barSize={32} radius={[0, 8, 8, 0]}>
                                    {funnelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Métricas do Funil */}
                <div className="md:w-1/3 flex flex-col justify-center gap-6 border-l border-slate-100 pl-8">
                    <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                        <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-1">Taxa de Conversão</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-green-600 tracking-tight">{conversionRate}%</span>
                            <span className="text-xs font-bold text-green-600">Global</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">Visitas Totais</span>
                            <span className="font-black text-slate-900">{totalVisits}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                <ArrowDown className="w-3 h-3 text-slate-300" /> Adic. Carrinho
                            </span>
                            <span className="font-black text-slate-900">{funnelData.find(d => d.name === 'Adic. Sacola')?.value || 0}</span>
                        </div>
                        <div className="h-px bg-slate-100"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-[#EA2831] uppercase">Pedidos Finalizados</span>
                            <span className="font-black text-[#EA2831] text-lg">{totalOrders}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* GRÁFICOS SECUNDÁRIOS (Canais e Pagamento) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* CANAIS DE VENDA (DONUT) */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col">
                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-[#EA2831]" /> Canais de Venda
                    </h3>
                    <div className="flex-1 min-h-[300px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={channelData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {channelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS_RED[index % COLORS_RED.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36} 
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#64748B' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Pedidos</span>
                            <p className="text-2xl font-black text-slate-900">
                                {channelData.reduce((acc, curr) => acc + curr.value, 0)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* MÉTODOS DE PAGAMENTO (PIE) */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col">
                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[#EA2831]" /> Métodos de Pagamento
                    </h3>
                    <div className="flex-1 min-h-[300px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={methodData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {methodData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS_MONOCHROME[index % COLORS_MONOCHROME.length]} strokeWidth={2} stroke="#fff" />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value: number) => formatCurrency(value)}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
