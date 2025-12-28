
import React, { memo } from 'react';
import { Power, Wallet, ShieldCheck, Clock } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/mathEngine';

interface CashStatusCardProps {
  isOpen: boolean;
  amount: number;
  openedAt?: Date;
}

const CashStatusCard = ({ isOpen, amount, openedAt }: CashStatusCardProps) => {
  return (
    <div className="bg-white dark:bg-surface-dark p-8 rounded-[24px] shadow-sm relative overflow-hidden border border-gray-100 dark:border-gray-800 border-l-[6px] border-l-primary flex flex-col justify-center h-full transition-all">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className={`size-16 rounded-2xl flex items-center justify-center shadow-sm ${isOpen ? 'bg-red-50 text-primary' : 'bg-red-500/10 text-red-500'}`}>
            {isOpen ? <Wallet className="w-8 h-8" /> : <Power className="w-8 h-8" />}
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Saldo Atual em Caixa</p>
            <p className="text-5xl font-black tracking-tight font-display text-slate-900 dark:text-white">{formatCurrency(amount)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 items-end">
          <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border ${isOpen ? 'bg-green-50 border-green-200 text-green-600' : 'bg-red-50 border-red-200 text-red-500'}`}>
            <div className={`size-2 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest">{isOpen ? 'Operacional' : 'Caixa Fechado'}</span>
          </div>
          
          {isOpen && openedAt && (
            <div className="flex items-center gap-2 px-1 text-slate-400">
                <Clock className="w-3 h-3" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Início: {openedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(CashStatusCard);
