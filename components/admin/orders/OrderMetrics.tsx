
import React, { useMemo } from 'react';
import { Timer, Bike, TrendingUp } from 'lucide-react';
import { Order } from '../../../types';

interface OrderMetricsProps {
  orders: Order[];
}

export const OrderMetrics = React.memo(({ orders }: OrderMetricsProps) => {
  const metrics = useMemo(() => {
    let totalPrep = 0, countPrep = 0;
    let totalDeliv = 0, countDeliv = 0;
    let totalCycle = 0, countTotal = 0;

    orders.forEach(o => {
      if (o.dispatchedAt && o.timestamp) {
        totalPrep += (new Date(o.dispatchedAt).getTime() - new Date(o.timestamp).getTime());
        countPrep++;
      }
      if (o.deliveredAt && o.dispatchedAt) {
        totalDeliv += (new Date(o.deliveredAt).getTime() - new Date(o.dispatchedAt).getTime());
        countDeliv++;
      }
      if (o.deliveredAt && o.timestamp) {
        totalCycle += (new Date(o.deliveredAt).getTime() - new Date(o.timestamp).getTime());
        countTotal++;
      }
    });

    const format = (ms: number) => {
      if (!ms) return '--';
      const m = Math.floor(ms / 60000);
      return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
    };

    return {
      prep: countPrep ? format(totalPrep / countPrep) : '15 min',
      deliv: countDeliv ? format(totalDeliv / countDeliv) : '25 min',
      total: countTotal ? format(totalCycle / countTotal) : '40 min'
    };
  }, [orders]);

  return (
    <div className="flex flex-col items-center w-full max-w-3xl">
      <div className="relative w-full flex items-center justify-center mb-2">
        {/* Linha Vermelha estendida para conectar visualmente os cards */}
        <div className="absolute left-4 right-4 top-1/2 h-px bg-red-500/30 z-0"></div>
        
        {/* Texto centralizado com background para "cortar" a linha */}
        <h3 className="relative z-10 bg-[#f8f6f6] dark:bg-background-dark px-6 text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Tempo Médio</h3>
      </div>

      <div className="flex gap-4 justify-center w-full">
        <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-surface-dark rounded-[20px] border border-red-100 dark:border-red-900/30 shadow-sm min-w-[150px]">
          <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl text-[#EA2831]"><Timer className="w-5 h-5" /></div>
          <div className="flex flex-col leading-none">
            <span className="text-[9px] font-bold text-slate-400 uppercase mb-1">Preparo</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{metrics.prep}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-surface-dark rounded-[20px] border border-red-100 dark:border-red-900/30 shadow-sm min-w-[150px]">
          <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl text-[#EA2831]"><Bike className="w-5 h-5" /></div>
          <div className="flex flex-col leading-none">
            <span className="text-[9px] font-bold text-slate-400 uppercase mb-1">Entrega</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{metrics.deliv}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-surface-dark rounded-[20px] border border-red-100 dark:border-red-900/30 shadow-sm min-w-[150px]">
          <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl text-[#EA2831]"><TrendingUp className="w-5 h-5" /></div>
          <div className="flex flex-col leading-none">
            <span className="text-[9px] font-bold text-slate-400 uppercase mb-1">Total</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{metrics.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
});
