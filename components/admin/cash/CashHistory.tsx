
import React from 'react';
import { Clock, User, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { CashTransaction } from '../../../types';
import { formatCurrency } from '../../../shared/utils/mathEngine';

interface CashHistoryProps {
  transactions: CashTransaction[];
}

export default function CashHistory({ transactions }: CashHistoryProps) {
  return (
    <div className="bg-white dark:bg-surface-dark rounded-[32px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm h-full flex flex-col transition-colors">
      <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Histórico do Caixa</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Detalhamento de entradas e saídas do turno</p>
        </div>
        <span className="text-[10px] font-black text-primary bg-primary/5 px-3 py-1.5 rounded-full uppercase tracking-widest border border-primary/10">
            Auditoria Ativa
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 dark:bg-gray-800/30 sticky top-0 backdrop-blur-md">
            <tr>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Horário</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operação / Responsável</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Método / Recebido</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Troco</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Líquido</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <Clock className="w-12 h-12 text-slate-400" />
                    <p className="font-black text-xs uppercase tracking-[0.3em] italic text-slate-500">Caixa sem movimentações</p>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map(t => (
                <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className={`size-8 rounded-xl flex items-center justify-center ${t.type === 'WITHDRAWAL' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                            {t.type === 'WITHDRAWAL' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-900 dark:text-white font-display">
                                {t.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">{t.timestamp.toLocaleDateString()}</span>
                        </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[13px] font-black text-slate-800 dark:text-gray-100 leading-tight">{t.description}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                            <User className="w-3 h-3" /> {t.responsible}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap gap-1.5">
                        {t.methods.map((m, i) => (
                            <span key={i} className="text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase bg-slate-100 dark:bg-gray-800 px-2 py-0.5 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                {m.method}
                            </span>
                        ))}
                        </div>
                        {t.receivedAmount !== undefined && (
                            <span className="text-[9px] font-bold text-slate-400 uppercase italic">
                                Bruto: {formatCurrency(t.receivedAmount)}
                            </span>
                        )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex flex-col items-end">
                        <span className={`text-xs font-bold font-display ${t.changeAmount && t.changeAmount > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                            {t.changeAmount && t.changeAmount > 0 ? formatCurrency(t.changeAmount) : '-'} 
                        </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={`text-sm font-black font-display ${t.type === 'WITHDRAWAL' ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                      {t.type === 'WITHDRAWAL' ? '-' : '+'} {formatCurrency(t.total)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-6 bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">
        Auditoria centralizada: Bruto - Troco = Valor Líquido Registrado
      </div>
    </div>
  );
}
