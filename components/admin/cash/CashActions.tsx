
import React, { useState } from 'react';
import { BaseModal } from '../../ui/BaseModal';

interface CashActionsProps {
  showWithdraw: boolean;
  setShowWithdraw: (show: boolean) => void;
  showDeposit: boolean;
  setShowDeposit: (show: boolean) => void;
  onWithdraw: (amount: number, reason: string) => void;
  onDeposit: (amount: number, reason: string) => void;
  onCloseCashier: () => void;
}

export default function CashActions({ 
    showWithdraw, 
    setShowWithdraw, 
    showDeposit, 
    setShowDeposit, 
    onWithdraw, 
    onDeposit 
}: CashActionsProps) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const modalType = showWithdraw ? 'WITHDRAW' : showDeposit ? 'DEPOSIT' : 'NONE';

  const handleAction = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    if (modalType === 'WITHDRAW') onWithdraw(val, reason || 'Sangria Manual');
    else onDeposit(val, reason || 'Suprimento Manual');
    closeModal();
  };

  const closeModal = () => {
      setAmount('');
      setReason('');
      setShowWithdraw(false);
      setShowDeposit(false);
  };

  if (modalType === 'NONE') return null;

  const title = modalType === 'WITHDRAW' ? 'Registrar Sangria' : 'Registrar Suprimento';

  return (
    <BaseModal onClose={closeModal} className="max-w-md" title={title}>
        <div className="space-y-6">
          {/* Header removido daqui pois o BaseModal agora gerencia */}
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor da Operação</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300">R$</span>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0,00" autoFocus className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary font-black text-slate-900 dark:text-white" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Motivo / Descrição</label>
            <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="Ex: Pagamento fornecedor, troco..." className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-primary font-bold text-sm text-slate-900 dark:text-white" />
          </div>
          
          <button onClick={handleAction} className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 mt-4 uppercase text-xs tracking-[0.2em] hover:bg-red-600 transition-all active:scale-95">
            Confirmar Lançamento
          </button>
        </div>
    </BaseModal>
  );
}
