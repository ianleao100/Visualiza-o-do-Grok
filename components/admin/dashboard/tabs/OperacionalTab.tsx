
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, ShoppingBag, Eye, TrendingDown, TrendingUp, ChefHat, Bike, CheckCircle, BarChart2, Truck, AlertTriangle } from 'lucide-react';
import { useAdminAnalytics } from '../../../../hooks/core/useAdminAnalytics';
import { formatCurrency } from '../../../../shared/utils/mathEngine';

interface OperacionalTabProps {
    dateFilter: string;
    customRange?: { start: string, end: string };
}

export const OperacionalTab: React.FC<OperacionalTabProps> = ({ dateFilter, customRange }) => {
    const { 
        avgAcceptance, 
        avgPrep, 
        avgDelivery, 
        funnelData, 
        trendingProducts, 
        lowConversionProducts,
        abcProducts,
        dispatchPerformance,
        bagAlerts
    } = useAdminAnalytics(dateFilter, customRange);

    const TimeCard = ({ label, time, icon: Icon, color }: any) => (
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex items-center justify-between group">
            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                <span className={`text-3xl font-black ${color}`}>{time} <span className="text-sm text-slate-300">min</span></span>
            </div>
            <div className={`size-14 rounded-2xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('600', '50')} ${color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7" />
            </div>
        </div>
    );

    const getAbcBadge = (classification: string) => {
        switch(classification) {
            case 'A': return 'bg-green-100 text-green-700 border-green-200';
            case 'B': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    // Dados para Gráfico de Performance de Despacho
    const dispatchData = [
        { name: '< 10 min', value: dispatchPerformance.under10 },
        { name: '> 20 min', value: dispatchPerformance.over20 }
    ];

    // Dados para Gráfico de Bag Alert
    const bagData = [
        { name: 'Bag Cheia (6+)', value: bagAlerts.driversAtLimit },
        { name: 'Disponíveis', value: Math.max(0, bagAlerts.activeDrivers - bagAlerts.driversAtLimit) }
    ];

    return (
        <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
            
            {/* 1. RELÓGIOS DE OPERAÇÃO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TimeCard 
                    label="Tempo de Aceite" 
                    time={avgAcceptance} 
                    icon={CheckCircle} 
                    color="text-blue-600" 
                />
                <TimeCard 
                    label="Tempo de Cozinha" 
                    time={avgPrep} 
                    icon={ChefHat} 
                    color="text-orange-500" 
                />
                <TimeCard 
                    label="Tempo de Entrega" 
                    time={avgDelivery} 
                    icon={Bike} 
                    color="text-green-600" 
                />
            </div>

            {/* SEÇÃO EXPEDIÇÃO E LOGÍSTICA (NOVA) */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col">
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-[#EA2831]" /> Expedição & Logística
                        </h3>
                        <p className="text-xs font-bold text-slate-400 mt-1">Eficiência de saída e capacidade de frota</p>
                    </div>
                    {bagAlerts.driversAtLimit > 0 && (
                        <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl flex items-center gap-2 border border-red-100 animate-pulse">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Gargalo Detectado</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Indicador: Tempo Médio de Preparo */}
                    <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-center items-center text-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tempo Médio de Preparo</span>
                        <div className="relative">
                            <span className="text-5xl font-black text-slate-900 tracking-tighter">{avgPrep}</span>
                            <span className="absolute -right-8 bottom-2 text-xs font-bold text-slate-400">min</span>
                        </div>
                        <div className="mt-2 text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded border border-gray-100">
                            Aceito → Pronto
                        </div>
                    </div>

                    {/* Gráfico: Desempenho de Entrega (Despacho) */}
                    <div className="flex flex-col h-40">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Performance de Saída</span>
                        <div className="flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dispatchData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                                    <Bar dataKey="value" barSize={30} radius={[4, 4, 0, 0]}>
                                        <Cell fill="#22c55e" /> {/* < 10 min */}
                                        <Cell fill="#EA2831" /> {/* > 20 min */}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Gráfico: Alerta de Bag */}
                    <div className="flex flex-col h-40">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Capacidade da Frota (Bags)</span>
                        <div className="flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={bagData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                                    <Bar dataKey="value" barSize={30} radius={[4, 4, 0, 0]}>
                                        <Cell fill="#EA2831" /> {/* Cheia */}
                                        <Cell fill="#3b82f6" /> {/* Disponível */}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 2. FUNIL DE VENDAS */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col min-h-[400px]">
                    <div className="mb-6">
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-[#EA2831]" /> Funil de Conversão
                        </h3>
                        <p className="text-xs font-bold text-slate-400 mt-1">Eficiência do cardápio digital</p>
                    </div>
                    
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                    
                    {/* Insights do Funil */}
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Visualizações</span>
                            <p className="text-lg font-black text-slate-700">{funnelData[0].value}</p>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Conversão Sacola</span>
                            <p className="text-lg font-black text-orange-500">
                                {Math.round((funnelData[1].value / funnelData[0].value) * 100)}%
                            </p>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Conversão Final</span>
                            <p className="text-lg font-black text-[#EA2831]">
                                {Math.round((funnelData[2].value / funnelData[0].value) * 100)}%
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. CURVA ABC E PERFORMANCE */}
                <div className="flex flex-col gap-6">
                    
                    {/* Curva ABC (Novo) */}
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex-1">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <BarChart2 className="w-4 h-4 text-[#EA2831]" /> Curva ABC (Top Lucratividade)
                            </h3>
                            <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-1 rounded">Classe A = 80% Receita</span>
                        </div>
                        <div className="space-y-3 max-h-[220px] overflow-y-auto no-scrollbar">
                            {abcProducts.map((prod, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <span className={`size-6 rounded flex items-center justify-center text-[10px] font-black border ${getAbcBadge(prod.classification)}`}>
                                            {prod.classification}
                                        </span>
                                        <span className="text-sm font-bold text-slate-700 line-clamp-1">{prod.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-bold text-slate-500">{prod.current} un.</span>
                                        <span className="text-xs font-black text-slate-900">{formatCurrency(prod.revenue)}</span>
                                    </div>
                                </div>
                            ))}
                            {abcProducts.length === 0 && <p className="text-center text-slate-400 text-xs py-4">Sem dados suficientes.</p>}
                        </div>
                    </div>

                    {/* Itens "Esquecidos" (Alta Visualização, Baixa Conversão) */}
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex-1">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Eye className="w-4 h-4 text-red-500" /> Baixa Conversão (Alerta)
                        </h3>
                        <div className="space-y-3">
                            {lowConversionProducts.map((prod, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 border border-red-100">
                                    <span className="text-sm font-bold text-slate-700">{prod.name}</span>
                                    <div className="flex flex-col items-end leading-none">
                                        <span className="text-[10px] font-bold text-slate-400">{prod.views} views</span>
                                        <div className="flex items-center gap-1 mt-1 text-red-500">
                                            <span className="text-xs font-black">{prod.sales} vendas</span>
                                            <TrendingDown className="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
