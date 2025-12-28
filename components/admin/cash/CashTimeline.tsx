
import React from 'react';
import { ShoppingCart, Clock, User, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { CashTransaction } from '../../../types';

interface CashTimelineProps {
  transactions: CashTransaction[];
}

export default function CashTimeline({ transactions }: CashTimelineProps) {
  return (
    <div className="bg-white dark:bg-surface-dark rounded-[32px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm h-full flex flex-col">
      <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Fluxo Cronológico</h4>
        <span className="text-[10px] font-bold text-slate-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest">Sessão Atual</span>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <table className="w-full text-left">
          <thead className="bg-gray-50/30 dark:bg-gray-800/30 sticky top-0 backdrop-blur-sm">
            <tr>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Horário</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Atividade</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Montante</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-20">
                    <Clock className="w-12 h-12" />
                    <p className="font-black text-xs uppercase tracking-widest italic">Nenhuma atividade registrada</p>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map(t => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className={`size-8 rounded-full flex items-center justify-center ${t.type === 'WITHDRAWAL' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                            {t.type === 'WITHDRAWAL' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <span className="text-xs font-black text-slate-400 font-display">{t.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-black text-slate-900 dark:text-white leading-tight">{t.description}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1 border border-gray-100 px-1.5 py-0.5 rounded-md">
                            <User className="w-2.5 h-2.5" /> {t.responsible.split(' ')[0]}
                        </span>
                        <div className="flex gap-1">
                          {t.methods.map((m, i) => (
                            <span key={i} className="text-[8px] font-black text-primary uppercase bg-primary/5 px-1.5 py-0.5 rounded">{m.method}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={`text-sm font-black font-display ${t.type === 'WITHDRAWAL' ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                      {t.type === 'WITHDRAWAL' ? '-' : '+'} R$ {t.total.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
