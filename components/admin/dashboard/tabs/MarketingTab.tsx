
import React from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Ticket, Star, Megaphone, MousePointer, TrendingUp, Users, Target } from 'lucide-react';
import { useAdminAnalytics } from '../../../../hooks/core/useAdminAnalytics';
import { formatCurrency } from '../../../../shared/utils/mathEngine';

interface MarketingTabProps {
    dateFilter: string;
    customRange?: { start: string, end: string };
}

export const MarketingTab: React.FC<MarketingTabProps> = ({ dateFilter, customRange }) => {
    const { 
        marketingFunnel,
        couponRevenue,
        couponRoiValue,
        couponRoiPercent,
        loyaltyData,
        featuredProductStats,
        campaignRetention
    } = useAdminAnalytics(dateFilter, customRange);

    return (
        <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. FUNIL DE CUPONS */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col h-[400px]">
                    <div className="mb-6 flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <Ticket className="w-5 h-5 text-[#EA2831]" /> Performance de Cupons
                            </h3>
                            <p className="text-xs font-bold text-slate-400 mt-1">Eficácia das campanhas ativas</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Receita Gerada</p>
                            <p className="text-2xl font-black text-green-600">{formatCurrency(couponRevenue)}</p>
                        </div>
                    </div>
                    
                    <div className="flex-1 w-full flex gap-6">
                        <div className="flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={marketingFunnel} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                                        {marketingFunnel.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        
                        {/* ROI INDICATOR (NEW) */}
                        <div className="w-1/3 flex flex-col justify-center border-l border-slate-100 pl-6 gap-6">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                    <Target className="w-3 h-3" /> ROI Campanhas
                                </span>
                                <p className="text-3xl font-black text-slate-900 mt-1">{couponRoiPercent}%</p>
                                <p className="text-[10px] font-bold text-green-600">
                                    + {formatCurrency(couponRoiValue)} (Líquido)
                                </p>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Conversão</span>
                                <p className="text-xl font-black text-[#EA2831]">
                                    {marketingFunnel[0].value > 0 
                                        ? Math.round((marketingFunnel[1].value / marketingFunnel[0].value) * 100) 
                                        : 0}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. FIDELIDADE (PONTOS) */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col h-[400px]">
                    <div className="mb-6">
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500" /> Programa de Fidelidade
                        </h3>
                        <p className="text-xs font-bold text-slate-400 mt-1">Pontos gerados vs. resgatados</p>
                    </div>

                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={loyaltyData} barSize={60}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}}
                                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                                />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                    <Cell fill="#EAB308" /> {/* Yellow for Earned */}
                                    <Cell fill="#22C55E" /> {/* Green for Redeemed */}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-4 text-center">
                        <p className="text-xs text-slate-400 font-medium">
                            <span className="font-black text-slate-900">{loyaltyData[1].value}</span> pontos resgatados economizaram aprox. <span className="font-black text-green-600">{formatCurrency(loyaltyData[1].value * 0.05)}</span> para os clientes.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 3. DESTAQUE DO DIA */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-4">
                            <Megaphone className="w-5 h-5 text-purple-500" /> Destaque Ativo
                        </h3>
                        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 mb-6">
                            <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Produto</p>
                            <p className="text-xl font-black text-purple-900 leading-tight">{featuredProductStats.name}</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                                    <MousePointer className="w-4 h-4" /> Cliques (Est.)
                                </div>
                                <span className="font-black text-slate-900">{featuredProductStats.clicks}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                                    <TrendingUp className="w-4 h-4" /> Vendas
                                </div>
                                <span className="font-black text-slate-900">{featuredProductStats.sales}</span>
                            </div>
                            <div className="h-px bg-slate-100 my-2"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-400 uppercase">Conversão</span>
                                <span className="text-xl font-black text-green-500">
                                    {featuredProductStats.clicks > 0 
                                        ? ((featuredProductStats.sales / featuredProductStats.clicks) * 100).toFixed(1) 
                                        : 0}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. RETENÇÃO POR CAMPAINHA */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-6">
                        <Users className="w-5 h-5 text-blue-500" /> Retenção por Campanha (30 dias)
                    </h3>
                    
                    <div className="flex-1 overflow-x-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-tl-xl">Cupom / Campanha</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Usaram</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Retornaram</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right rounded-tr-xl">Taxa de Retenção</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {campaignRetention.map((camp, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-sm text-slate-700">{camp.name}</td>
                                        <td className="px-6 py-4 text-center font-bold text-slate-600">{camp.used}</td>
                                        <td className="px-6 py-4 text-center font-bold text-slate-600">{camp.returned}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`px-3 py-1 rounded-full text-xs font-black ${
                                                camp.rate >= 50 ? 'bg-green-100 text-green-700' :
                                                camp.rate >= 25 ? 'bg-blue-100 text-blue-700' :
                                                'bg-slate-100 text-slate-500'
                                            }`}>
                                                {camp.rate}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};
