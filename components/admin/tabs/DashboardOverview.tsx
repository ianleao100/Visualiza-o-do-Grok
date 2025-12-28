
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
    DollarSign, ShoppingBag, TrendingUp, Split, Bike, ChefHat, Activity, BarChart2, PieChart as PieIcon,
    MapPin, Users, ArrowUpRight, Calendar as CalendarIcon, ChevronDown, X, Zap, AlertTriangle
} from 'lucide-react';
import { useAdminAnalytics } from '../../../hooks/core/useAdminAnalytics';
import { formatCurrency } from '../../../shared/utils/mathEngine';
import { DashboardGeoMap } from './DashboardGeoMap';
import { DashboardTabs, DashboardTab } from '../dashboard/DashboardTabs';
import { FinanceiroTab } from '../dashboard/tabs/FinanceiroTab';
import { ClientesTab } from '../dashboard/tabs/ClientesTab';
import { OperacionalTab } from '../dashboard/tabs/OperacionalTab';
import { PedidosTab } from '../dashboard/tabs/PedidosTab';
import { MarketingTab } from '../dashboard/tabs/MarketingTab';

export const DashboardOverview: React.FC = () => {
  const [activeDashboardTab, setActiveDashboardTab] = useState<DashboardTab>('RESUMO');
  
  // Estado de Filtro de Data
  const [dateFilter, setDateFilter] = useState('Hoje');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  const handleApplyCustomDate = () => {
      if (customRange.start && customRange.end) {
          setDateFilter('Customizado');
          setShowDatePicker(false);
      } else {
          alert('Selecione as datas de início e fim.');
      }
  };

  // Hook consome as props locais
  const { 
      totalRevenue, totalCount, avgTicket, trendData, topNeighborhoods, heatMapPoints, insights
  } = useAdminAnalytics(dateFilter, dateFilter === 'Customizado' ? customRange : undefined);

  // Renderizador de Conteúdo das Abas
  const renderTabContent = () => {
      switch (activeDashboardTab) {
          case 'RESUMO':
              return (
                <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
                  
                  {/* INSIGHTS OPERACIONAIS */}
                  {insights.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {insights.map((insight, idx) => (
                              <div 
                                key={idx} 
                                className={`p-4 rounded-[20px] border flex items-start gap-3 shadow-sm ${
                                    insight.type === 'TREND' 
                                    ? 'bg-orange-50 border-orange-100 text-orange-800' 
                                    : 'bg-red-50 border-red-100 text-red-700'
                                }`}
                              >
                                  <div className={`p-2 rounded-full shrink-0 ${insight.type === 'TREND' ? 'bg-orange-100' : 'bg-red-100'}`}>
                                      {insight.type === 'TREND' ? <Zap className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                  </div>
                                  <div>
                                      <h4 className="text-xs font-black uppercase tracking-widest mb-1">Insight em Tempo Real</h4>
                                      <p className="text-sm font-bold leading-tight">{insight.message}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}

                  {/* KPI CARDS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-transparent hover:shadow-xl transition-all group flex items-center justify-between relative overflow-hidden">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Faturamento Bruto</p>
                            <p className="text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(totalRevenue)}</p>
                        </div>
                        <div className="size-14 rounded-2xl flex items-center justify-center text-[#EA2831] bg-white shadow-sm border border-slate-50 group-hover:scale-110 transition-transform">
                            <DollarSign className="w-7 h-7" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-transparent hover:shadow-xl transition-all group flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Volume de Vendas</p>
                            <p className="text-3xl font-black text-slate-900 tracking-tight">{totalCount} <span className="text-sm text-slate-400 font-bold">pedidos</span></p>
                        </div>
                        <div className="size-14 rounded-2xl flex items-center justify-center text-[#EA2831] bg-white shadow-sm border border-slate-50 group-hover:scale-110 transition-transform">
                            <ShoppingBag className="w-7 h-7" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-transparent hover:shadow-xl transition-all group flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ticket Médio</p>
                            <p className="text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(avgTicket)}</p>
                        </div>
                        <div className="size-14 rounded-2xl flex items-center justify-center text-[#EA2831] bg-white shadow-sm border border-slate-50 group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-7 h-7" />
                        </div>
                    </div>
                  </div>

                  {/* REVENUE TREND & FORECAST CHART */}
                  <div className="w-full bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><Activity className="w-5 h-5 text-[#EA2831]" /> Tendência & Previsão</h3>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2"><span className="size-3 rounded-full bg-[#EA2831]"></span><span className="text-xs font-bold text-slate-500">Realizado</span></div>
                            <div className="flex items-center gap-2"><div className="w-4 h-0.5 bg-slate-300 border-t-2 border-dashed border-slate-400"></div><span className="text-xs font-bold text-slate-500">Previsão (3 dias)</span></div>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} tickFormatter={(value) => `R$${value}`} />
                          <Tooltip 
                            contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                            formatter={(value: number, name: string) => [
                                formatCurrency(value), 
                                name === 'sales' ? 'Faturamento Real' : (name === 'forecast' ? 'Previsão' : 'Anterior')
                            ]}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="sales" 
                            stroke="#EA2831" 
                            strokeWidth={4} 
                            dot={{r: 4, fill: '#EA2831', strokeWidth: 0}} 
                            activeDot={{r: 8}} 
                            connectNulls={false} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="forecast" 
                            stroke="#94a3b8" 
                            strokeWidth={3} 
                            strokeDasharray="5 5" 
                            dot={{r: 3, fill: '#94a3b8', strokeWidth: 0}}
                            activeDot={{r: 6}}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* GEO INTELLIGENCE */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 bg-white rounded-[32px] shadow-sm border border-slate-100 p-1 flex flex-col h-96">
                          <div className="px-6 py-4 flex items-center justify-between">
                              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><MapPin className="w-5 h-5 text-[#EA2831]" /> Pontos de Calor</h3>
                          </div>
                          <div className="flex-1 rounded-[28px] overflow-hidden m-1 mt-0 relative">
                              <DashboardGeoMap points={heatMapPoints} />
                          </div>
                      </div>

                      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col">
                          <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><Bike className="w-5 h-5 text-slate-700" /> Top Bairros</h3>
                          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                              {topNeighborhoods.map((bairro, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                      <div className="flex items-center gap-3">
                                          <span className="flex size-6 items-center justify-center bg-white rounded-lg text-xs font-black text-slate-400 shadow-sm">{idx + 1}</span>
                                          <span className="text-sm font-bold text-slate-700">{bairro.name}</span>
                                      </div>
                                      <span className="text-xs font-black text-slate-900">{formatCurrency(bairro.value)}</span>
                                  </div>
                              ))}
                              {topNeighborhoods.length === 0 && <p className="text-center text-slate-400 text-sm py-4">Sem dados de entrega.</p>}
                          </div>
                      </div>
                  </div>
                </div>
              );
          case 'VENDAS':
              return <FinanceiroTab dateFilter={dateFilter} customRange={customRange} />;
          case 'OPERACAO':
              return <OperacionalTab dateFilter={dateFilter} customRange={customRange} />;
          case 'CLIENTES':
              return <ClientesTab />;
          case 'PEDIDOS':
              return <PedidosTab dateFilter={dateFilter} customRange={customRange} />;
          case 'MARKETING':
              return <MarketingTab dateFilter={dateFilter} customRange={customRange} />;
          default:
              return null;
      }
  };

  return (
    <div className="space-y-6 pb-10">
        
        {/* HEADER CONTEXTUAL - NOVO LAYOUT */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-2 px-2">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
                <p className="text-sm text-slate-500 font-medium">Acompanhe o desempenho da sua empresa.</p>
            </div>

            {/* Seletor de Data Premium - Direita */}
            <div className="relative z-20">
                <div className="relative group bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center px-4 py-2.5 hover:shadow-md transition-all cursor-pointer">
                    <CalendarIcon className="w-4 h-4 text-[#EA2831] shrink-0" />
                    <select 
                        value={dateFilter === 'Customizado' ? 'Customizado' : dateFilter}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'Customizado') setShowDatePicker(true);
                            else setDateFilter(val);
                        }}
                        className="appearance-none bg-transparent border-none text-sm font-bold text-slate-600 dark:text-slate-300 focus:ring-0 focus:outline-none cursor-pointer pl-3 pr-8 w-32"
                    >
                        <option>Hoje</option>
                        <option>7 dias</option>
                        <option>15 dias</option>
                        <option>30 dias</option>
                        <option>3 meses</option>
                        <option>6 meses</option>
                        <option>1 ano</option>
                        <option value="Customizado">Customizado...</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                {showDatePicker && (
                    <div className="absolute top-full right-0 mt-3 p-5 bg-white dark:bg-surface-dark rounded-[24px] shadow-2xl border border-gray-100 dark:border-gray-800 z-[100] w-72 animate-[slideUp_0.2s_ease-out]">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Filtrar Período</span>
                            <button onClick={() => setShowDatePicker(false)} className="text-slate-400 hover:text-[#EA2831]"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Início</label>
                                <input 
                                    type="date" 
                                    value={customRange.start}
                                    onChange={(e) => setCustomRange({...customRange, start: e.target.value})}
                                    className="w-full p-2 bg-slate-50 dark:bg-gray-800 border-none rounded-lg text-sm font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-[#EA2831] outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Fim</label>
                                <input 
                                    type="date" 
                                    value={customRange.end}
                                    onChange={(e) => setCustomRange({...customRange, end: e.target.value})}
                                    className="w-full p-2 bg-slate-50 dark:bg-gray-800 border-none rounded-lg text-sm font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-[#EA2831] outline-none"
                                />
                            </div>
                            <button 
                                onClick={handleApplyCustomDate}
                                className="w-full py-3 bg-[#EA2831] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-red-700 transition-colors mt-2 shadow-lg shadow-red-500/20"
                            >
                                Aplicar Filtro
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* ABAS CENTRALIZADAS - AGORA STICKY NO COMPONENTE DASHBOARDTABS */}
        <div className="mb-8">
            <DashboardTabs activeTab={activeDashboardTab} onChange={setActiveDashboardTab} />
        </div>
        
        {renderTabContent()}
    </div>
  );
};
