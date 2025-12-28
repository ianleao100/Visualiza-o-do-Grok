
import React from 'react';
import { QrCode, CreditCard, DollarSign, Wallet, TrendingUp } from 'lucide-react';

interface CashSummaryProps {
  totals: any;
}

export default function CashSummary({ totals }: CashSummaryProps) {
  const cards = [
    { label: 'Em Dinheiro', value: totals.CASH, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Recebido via PIX', value: totals.PIX, icon: QrCode, color: 'text-sky-500', bg: 'bg-sky-50' },
    { label: 'Cartões Crédito', value: totals.CREDIT, icon: CreditCard, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Cartões Débito', value: totals.DEBIT, icon: CreditCard, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-white dark:bg-surface-dark p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-4 transition-all hover:shadow-md group">
          <div className="flex items-center justify-between">
            <div className={`size-10 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                <card.icon className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" /> +0.0%
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{card.label}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-display">R$ {card.value.toFixed(2)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
