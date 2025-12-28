
import React from 'react';
import { QrCode, CreditCard, Banknote } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/mathEngine';

interface CashGridProps {
  totals: any;
}

export default function CashGrid({ totals }: CashGridProps) {
  const methods = [
    { id: 'pix', label: 'PIX', value: totals.PIX, icon: QrCode, color: 'text-primary', bg: 'bg-red-50' },
    { id: 'cash', label: 'Dinheiro', value: totals.CASH, icon: Banknote, color: 'text-primary', bg: 'bg-red-50' },
    { id: 'credit', label: 'C. Crédito', value: totals.CREDIT, icon: CreditCard, color: 'text-primary', bg: 'bg-red-50' },
    { id: 'debit', label: 'C. Débito', value: totals.DEBIT, icon: CreditCard, color: 'text-primary', bg: 'bg-red-50' },
  ];

  return (
    <div className="bg-white dark:bg-surface-dark p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm grid grid-cols-2 gap-4 h-full">
      {methods.map((m) => (
        <div key={m.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/50 flex flex-col justify-between transition-all hover:bg-white hover:shadow-sm group">
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-xl bg-white dark:bg-gray-700 shadow-sm ${m.color} group-hover:scale-110 transition-transform`}>
                <m.icon className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white font-display tracking-tight leading-none">
            {formatCurrency(m.value)}
          </p>
        </div>
      ))}
    </div>
  );
}
