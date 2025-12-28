
import React from 'react';
import { ShoppingCart, ArrowUpCircle, ArrowDownCircle, Power } from 'lucide-react';

interface CashHeaderProps {
  isOpen: boolean;
  onOpenPOS: () => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onCloseCashier: () => void;
}

export default function CashHeader({ 
  isOpen, 
  onOpenPOS, 
  onOpenDeposit, 
  onOpenWithdraw, 
  onCloseCashier 
}: CashHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
      <div className="flex flex-col gap-1">
        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Caixa</h3>
        <p className="text-slate-500 font-medium">Controle operacional de frente de caixa.</p>
      </div>

      {isOpen && (
        <div className="flex items-center gap-3">
           <button 
              onClick={onOpenPOS}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs transition-all shadow-lg shadow-primary/20 hover:bg-red-600 active:scale-95"
           >
              <ShoppingCart className="w-4 h-4" /> PDV
           </button>
           <button 
              onClick={onOpenDeposit}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-slate-700 dark:bg-surface-dark dark:border-gray-800 dark:text-gray-300 rounded-2xl font-black text-xs transition-all hover:bg-gray-50 active:scale-95"
           >
              <ArrowUpCircle className="w-4 h-4 text-primary" /> SUPRIMENTO
           </button>
           <button 
              onClick={onOpenWithdraw}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-slate-700 dark:bg-surface-dark dark:border-gray-800 dark:text-gray-300 rounded-2xl font-black text-xs transition-all hover:bg-gray-50 active:scale-95"
           >
              <ArrowDownCircle className="w-4 h-4 text-primary" /> SANGRIA
           </button>
           <button 
              onClick={onCloseCashier}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs transition-all hover:bg-black active:scale-95"
           >
              <Power className="w-4 h-4" /> FECHAR
           </button>
        </div>
      )}
    </div>
  );
}
