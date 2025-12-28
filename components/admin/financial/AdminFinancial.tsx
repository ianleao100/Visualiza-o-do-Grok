
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DollarSign, TrendingUp, CreditCard, Wallet, Percent, ArrowUpRight } from 'lucide-react';
import { useFinancialCalculations } from '../../../hooks/useFinancialCalculations';
import { formatCurrency } from '../../../shared/utils/mathEngine';
import { INITIAL_PRODUCTS } from '../../../constants';

const COLORS = ['#EA2831', '#F97316', '#94A3B8', '#475569'];

export const AdminFinancial: React.FC = () => {
  const { totalRevenue, totalCount, avgTicket, paymentBreakdown } = useFinancialCalculations();

  // Dados para o Gráfico de Pizza
  const paymentData = [
      { name: 'Pix', value: paymentBreakdown.PIX },
      { name: 'Cartão', value: paymentBreakdown.CARD },
      { name: 'Dinheiro', value: paymentBreakdown.CASH },
  ].filter(d => d.value > 0);

  // Simulação de Margem de Contribuição (Mock de Custo = 40% do Preço)
  const productPerformance = INITIAL_PRODUCTS.map(product => {
      const estimatedCost = product.price * 0.40; // 40% COGS placeholder
      const margin = product.price - estimatedCost;
      const marginPercent = (margin / product.price) * 100;
      
      return {
          ...product,
          cost: estimatedCost,
          margin,
          marginPercent
      };
  }).sort((a, b) => b.marginPercent - a.marginPercent);

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
        
        {/* HEADER CONTEXTUAL */}
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inteligência Financeira</h1>
            <p className="text-sm text-slate-500">Analise lucros, custos e métodos de pagamento.</p>
        </div>

        {/* Big Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-surface-dark p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <DollarSign className="w-24 h-24 text-[#EA2831]" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Faturamento Total</p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="flex items-center gap-2 text-green-600 bg-green-50 w-fit px-2 py-1 rounded-lg">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Lucro Bruto Est. 60%</span>
                </div>
            </div>

            <div className="bg-white dark:bg-surface-dark p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between h-40">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ticket Médio</p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{formatCurrency(avgTicket)}</p>
                </div>
                <div className="text-xs text-slate-400 font-bold">Baseado em {totalCount} pedidos</div>
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-xl flex flex-col justify-between h-40">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Margem Média</p>
                    <p className="text-4xl font-black text-[#EA2831] tracking-tight">~60%</p>
                </div>
                <div className="text-xs text-slate-400 font-bold opacity-70">Meta: 65%</div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Gráfico de Pagamentos */}
            <div className="bg-white dark:bg-surface-dark p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-[#EA2831]" /> Meios de Pagamento
                </h3>
                <div className="flex-1 min-h-[250px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={paymentData} 
                                innerRadius={60} 
                                outerRadius={80} 
                                paddingAngle={5} 
                                dataKey="value"
                            >
                                {paymentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value: number) => formatCurrency(value)}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Legend 
                                verticalAlign="bottom" 
                                height={36} 
                                iconType="circle"
                                wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(totalRevenue)}</p>
                    </div>
                </div>
            </div>

            {/* Tabela de Margem de Contribuição */}
            <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col overflow-hidden">
                <div className="p-8 pb-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Percent className="w-5 h-5 text-[#EA2831]" /> Margem de Contribuição
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700">
                        Custo Estimado: 40% (Placeholder)
                    </span>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Preço Venda</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Custo (Est.)</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Margem R$</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Margem %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {productPerformance.map((prod) => (
                                <tr key={prod.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={prod.imageUrl} alt="" className="size-8 rounded-lg object-cover bg-gray-100" />
                                            <span className="font-bold text-sm text-slate-700 dark:text-gray-200 line-clamp-1">{prod.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-right text-sm font-medium text-slate-600 dark:text-gray-400">{formatCurrency(prod.price)}</td>
                                    <td className="px-8 py-4 text-right text-sm font-medium text-red-500">-{formatCurrency(prod.cost)}</td>
                                    <td className="px-8 py-4 text-right font-black text-green-600">{formatCurrency(prod.margin)}</td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <span className="font-bold text-sm text-slate-700 dark:text-white">{prod.marginPercent.toFixed(0)}%</span>
                                            {prod.marginPercent > 50 && <ArrowUpRight className="w-3 h-3 text-green-500" />}
                                        </div>
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
