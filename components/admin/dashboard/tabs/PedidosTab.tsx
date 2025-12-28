
import React from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie, Legend
} from 'recharts';
import { 
    Clock, MapPin, AlertCircle, Calendar,
    CheckCircle, Truck, ChefHat, ThumbsUp, ThumbsDown, Timer, ArrowRight, Zap, TrendingUp
} from 'lucide-react';
import { useAdminAnalytics } from '../../../../hooks/core/useAdminAnalytics';
import { DashboardGeoMap } from '../../tabs/DashboardGeoMap';
import { formatCurrency } from '../../../../shared/utils/mathEngine';

interface PedidosTabProps {
    dateFilter: string;
    customRange?: { start: string, end: string };
}

const HEATMAP_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HEATMAP_HOURS = Array.from({ length: 24 }, (_, i) => i);

export const PedidosTab: React.FC<PedidosTabProps> = ({ dateFilter, customRange }) => {
    const { 
        avgAcceptance, 
        avgPrep, 
        avgDelivery, 
        heatMapPoints,
        cancellationStats,
        volumeHeatmap,
        categoryEfficiency,
        channelComparison,
        qualityMetrics
    } = useAdminAnalytics(dateFilter, customRange);

    const timelineData = [
        { name: 'Aceite', value: avgAcceptance, fill: '#3b82f6' }, // Blue
        { name: 'Preparo', value: avgPrep, fill: '#f97316' }, // Orange
        { name: 'Entrega', value: avgDelivery, fill: '#22c55e' } // Green
    ];

    const COLORS_CANCEL = ['#ef4444', '#f87171', '#fca5a5', '#fee2e2'];

    // Find max value in heatmap for opacity normalization
    const maxHeat = Math.max(...volumeHeatmap.flat(), 1);

    return (
        <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
            
            {/* LINHA 1: TIMELINE E CANCELAMENTOS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. TIMELINE DE STATUS */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col h-[350px]">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-6">
                        <Clock className="w-5 h-5 text-[#EA2831]" /> Tempos Médios (Etapas)
                    </h3>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={timelineData} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={80} 
                                    tick={{fontSize: 11, fontWeight: 700, fill: '#64748B'}} 
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                                    formatter={(value) => [`${value} min`, 'Tempo Médio']}
                                />
                                <Bar dataKey="value" barSize={32} radius={[0, 8, 8, 0]}>
                                    {timelineData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Legenda Customizada */}
                    <div className="flex justify-center gap-6 mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <div className="flex items-center gap-2"><div className="size-2 rounded-full bg-blue-500"></div> Aceite</div>
                        <div className="flex items-center gap-2"><div className="size-2 rounded-full bg-orange-500"></div> Preparo</div>
                        <div className="flex items-center gap-2"><div className="size-2 rounded-full bg-green-500"></div> Entrega</div>
                    </div>
                </div>

                {/* 2. CANCELAMENTOS */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col h-[350px]">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-6">
                        <AlertCircle className="w-5 h-5 text-[#EA2831]" /> Motivos de Cancelamento
                    </h3>
                    {cancellationStats.length > 0 ? (
                        <div className="flex-1 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={cancellationStats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {cancellationStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS_CANCEL[index % COLORS_CANCEL.length]} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend 
                                        verticalAlign="bottom" 
                                        height={36} 
                                        iconType="circle"
                                        wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', color: '#64748B' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                                <p className="text-2xl font-black text-slate-900">
                                    {cancellationStats.reduce((acc, curr) => acc + curr.value, 0)}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest text-xs">
                            Nenhum cancelamento registrado
                        </div>
                    )}
                </div>
            </div>

            {/* LINHA 2: MÉTRICAS DE EFICIÊNCIA (NOVO) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Ranking de Produtividade */}
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Zap className="w-4 h-4 text-yellow-500" /> Cozinha: + Rápido
                    </h3>
                    <div className="flex-1 space-y-3">
                        {categoryEfficiency.length > 0 ? categoryEfficiency.map((cat, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <span className={`size-6 rounded flex items-center justify-center text-[10px] font-black ${idx === 0 ? 'bg-green-100 text-green-700' : 'bg-white text-slate-400'}`}>
                                        {idx + 1}
                                    </span>
                                    <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                                </div>
                                <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                                    <Timer className="w-3 h-3 text-slate-400" /> {cat.avgTime} min
                                </span>
                            </div>
                        )) : (
                            <p className="text-center text-slate-400 text-xs py-4">Sem dados suficientes.</p>
                        )}
                    </div>
                </div>

                {/* Comparativo de Canal (Ticket Médio) */}
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <TrendingUp className="w-4 h-4 text-blue-500" /> Ticket Médio por Canal
                    </h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={channelComparison} barSize={40}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} tickFormatter={(val) => `R$${val}`} />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}}
                                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                                    formatter={(value: number) => [formatCurrency(value), 'Ticket Médio']}
                                />
                                <Bar dataKey="ticket" radius={[8, 8, 0, 0]}>
                                    {channelComparison.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Score de Qualidade */}
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-between">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-500" /> Índice de Qualidade
                    </h3>
                    
                    <div className="flex items-center justify-center py-4">
                        <div className="relative size-32">
                            <svg className="size-full" viewBox="0 0 36 36">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={qualityMetrics.score >= 90 ? '#22c55e' : qualityMetrics.score >= 70 ? '#eab308' : '#ef4444'} strokeWidth="3" strokeDasharray={`${qualityMetrics.score}, 100`} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-slate-900">{qualityMetrics.score}</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase">SCORE</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs border-b border-dashed border-slate-100 pb-1">
                            <span className="font-bold text-slate-500">Taxa de Pontualidade</span>
                            <span className="font-black text-slate-900">{qualityMetrics.onTimeRate}%</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-500">Taxa de Reclamação</span>
                            <span className={`font-black ${qualityMetrics.complaintRate > 5 ? 'text-red-500' : 'text-green-500'}`}>{qualityMetrics.complaintRate}%</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* MAPA DE PEDIDOS */}
            <div className="bg-white p-1 rounded-[32px] shadow-sm border border-slate-100 flex flex-col h-[400px]">
                <div className="px-8 py-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-[#EA2831]" /> Mapa de Entregas
                        </h3>
                        <p className="text-xs font-bold text-slate-400 mt-1">Concentração geográfica das entregas realizadas</p>
                    </div>
                </div>
                <div className="flex-1 rounded-[28px] overflow-hidden m-1 mt-0 relative border border-slate-100">
                    <DashboardGeoMap points={heatMapPoints} />
                </div>
            </div>

            {/* HEATMAP DE VOLUME */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 overflow-x-auto">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-6">
                    <Calendar className="w-5 h-5 text-[#EA2831]" /> Volume por Horário
                </h3>
                
                <div className="min-w-[800px]">
                    {/* Header Horas */}
                    <div className="flex mb-2">
                        <div className="w-16 shrink-0"></div>
                        {HEATMAP_HOURS.map(h => (
                            <div key={h} className="flex-1 text-center text-[10px] font-bold text-slate-400">
                                {h}h
                            </div>
                        ))}
                    </div>

                    {/* Linhas Dias */}
                    <div className="space-y-2">
                        {HEATMAP_DAYS.map((day, dIdx) => (
                            <div key={day} className="flex items-center">
                                <div className="w-16 shrink-0 text-xs font-black text-slate-600 uppercase">{day}</div>
                                {HEATMAP_HOURS.map((h, hIdx) => {
                                    const value = volumeHeatmap[dIdx][h];
                                    const opacity = value / maxHeat;
                                    // Base color is RED #EA2831 (234, 40, 49)
                                    // We'll use rgba to control opacity
                                    const bgColor = value > 0 ? `rgba(234, 40, 49, ${Math.max(0.1, opacity)})` : '#f8fafc'; // slate-50 if 0
                                    
                                    return (
                                        <div 
                                            key={`${dIdx}-${hIdx}`} 
                                            className="flex-1 h-8 mx-0.5 rounded-md flex items-center justify-center text-[9px] font-bold text-white transition-all hover:scale-110 cursor-default"
                                            style={{ backgroundColor: bgColor }}
                                            title={`${day} às ${h}h: ${value} pedidos`}
                                        >
                                            {value > 0 && opacity > 0.4 ? value : ''}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
