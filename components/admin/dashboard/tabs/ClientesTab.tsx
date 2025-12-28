
import React, { useMemo } from 'react';
import { Users, UserMinus, Repeat, MapPin, Trophy, ArrowUpRight, UserPlus } from 'lucide-react';
import { useCustomerLoyalty } from '../../../../hooks/useCustomerLoyalty';
import { useAdminAnalytics } from '../../../../hooks/core/useAdminAnalytics';
import { DashboardGeoMap } from '../../tabs/DashboardGeoMap';
import { formatCurrency } from '../../../../shared/utils/mathEngine';

export const ClientesTab: React.FC = () => {
    // 1. Dados de Clientes (CRM) para Métricas de Vida Útil
    const { customers } = useCustomerLoyalty();
    
    // 2. Dados de Pedidos (Analytics) para CAC e Mapa
    const { heatMapPoints, cacValue } = useAdminAnalytics('3 meses');

    // --- Cálculos de Inteligência ---
    const metrics = useMemo(() => {
        const totalCustomers = customers.length;
        if (totalCustomers === 0) return { retention: 0, churn: 0, active: 0, vip: [] };

        // Retenção: Clientes com mais de 1 pedido
        const recurring = customers.filter(c => c.orderCount > 1).length;
        const retentionRate = (recurring / totalCustomers) * 100;

        // Churn (Inativos): Sem pedidos há mais de 30 dias
        const now = new Date();
        const inactive = customers.filter(c => {
            const lastOrder = new Date(c.lastOrderAt);
            const diffTime = Math.abs(now.getTime() - lastOrder.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 30;
        }).length;

        // VIPs: Top 5 por LTV (Total Gasto)
        const vip = [...customers]
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 5);

        return {
            retention: retentionRate,
            churn: inactive,
            active: totalCustomers - inactive,
            vip
        };
    }, [customers]);

    return (
        <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
            
            {/* CARDS DE INTELIGÊNCIA */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Total & Ativos */}
                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex items-center gap-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users className="w-24 h-24 text-[#EA2831]" />
                    </div>
                    <div className="size-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Base de Clientes</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">{customers.length}</p>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg mt-1 inline-block">
                            {metrics.active} ativos (30d)
                        </span>
                    </div>
                </div>

                {/* Taxa de Retenção */}
                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex items-center gap-6">
                    <div className="size-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                        <Repeat className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Taxa de Retenção</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">{metrics.retention.toFixed(1)}%</p>
                        <span className="text-xs font-bold text-slate-400">Compram {'>'} 1x</span>
                    </div>
                </div>

                {/* CAC (NOVO) */}
                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex items-center gap-6">
                    <div className="size-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <UserPlus className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">C.A.C (Aquisição)</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(cacValue)}</p>
                        <span className="text-xs font-bold text-slate-400">Descontos 1ª Compra</span>
                    </div>
                </div>

                {/* Churn / Risco */}
                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex items-center gap-6">
                    <div className="size-16 rounded-2xl bg-red-50 text-[#EA2831] flex items-center justify-center shrink-0">
                        <UserMinus className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Clientes Inativos</p>
                        <p className="text-3xl font-black text-[#EA2831] tracking-tight">{metrics.churn}</p>
                        <span className="text-xs font-bold text-red-400">Risco de Churn</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* MAPA DE CALOR (Inteligência Geográfica) */}
                <div className="lg:col-span-2 bg-white p-1 rounded-[32px] shadow-sm border border-slate-100 flex flex-col h-[500px]">
                    <div className="px-8 py-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-[#EA2831]" /> Densidade de Pedidos
                            </h3>
                            <p className="text-xs font-bold text-slate-400 mt-1">Concentração geográfica de entregas (Últimos 90 dias)</p>
                        </div>
                    </div>
                    <div className="flex-1 rounded-[28px] overflow-hidden m-1 mt-0 relative border border-slate-100">
                        <DashboardGeoMap points={heatMapPoints} />
                        
                        {/* Legenda Mapa */}
                        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-slate-100 z-[400] flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                <span className="size-3 rounded-full bg-[#EA2831] opacity-60"></span> Zona Quente (Alta Demanda)
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                <span className="size-3 rounded-full bg-[#F59E0B] opacity-60"></span> Zona Média (Oportunidade)
                            </div>
                        </div>
                    </div>
                </div>

                {/* RANKING VIP (LTV) */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col h-[500px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" /> Top 5 Clientes VIP
                        </h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                        {metrics.vip.map((customer, index) => (
                            <div key={customer.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-yellow-50 transition-colors border border-gray-100 group">
                                <div className="flex items-center gap-4">
                                    <div className={`size-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${index === 0 ? 'bg-yellow-400 text-white' : 'bg-white text-slate-400'}`}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm line-clamp-1">{customer.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400">{customer.orderCount} pedidos</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-900 font-display text-sm">{formatCurrency(customer.totalSpent)}</p>
                                    <div className="flex items-center justify-end gap-1 text-[9px] font-bold text-green-600">
                                        LTV <ArrowUpRight className="w-2.5 h-2.5" />
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {metrics.vip.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-60">
                                <Users className="w-12 h-12 mb-2" />
                                <p className="text-xs font-bold uppercase tracking-widest">Sem dados VIP</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-dashed border-gray-200">
                        <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                            Ver Lista Completa
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
