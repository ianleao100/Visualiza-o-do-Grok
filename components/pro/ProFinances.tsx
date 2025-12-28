
import React, { useState, useCallback } from 'react';
import { CashierSession, TransactionType, PaymentMethodType, CashTransaction } from '../../types';
import CashStatusCard from '../admin/cash/CashStatusCard';
import CashGrid from '../admin/cash/CashGrid';
import CashHistory from '../admin/cash/CashHistory';
import CashActions from '../admin/cash/CashActions';
import CashierOpening from '../admin/cash/CashierOpening';
import CashierClosureModal from '../admin/cash/CashierClosureModal';

interface ProFinancesProps {
  cashier: CashierSession;
  totals: any;
  transactions: CashTransaction[];
  openCashier: (responsible: string, initial: number) => void;
  closeCashier: (auditData?: any) => void;
  registerTransaction: (
    type: TransactionType, 
    methods: { method: PaymentMethodType, amount: number }[],
    description: string,
    meta?: { receivedAmount: number, changeAmount: number }
  ) => void;
  onOpenPOS: () => void;
}

export default function ProFinances({ 
  cashier, 
  totals,
  transactions,
  openCashier, 
  closeCashier, 
  registerTransaction, 
  onOpenPOS 
}: ProFinancesProps) {
  
  // Action Modals State
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleConfirmClosure = useCallback((withdrawalVal: number, difference: number, hasShortage: boolean, hasSurplus: boolean) => {
      // 1. Registra Sangria Final
      if (withdrawalVal > 0) {
          registerTransaction('WITHDRAWAL', [{ method: 'CASH', amount: withdrawalVal }], 'Sangria Final de Fechamento');
      }
      
      // 2. Registra Ajustes (Quebra ou Sobra) para bater o caixa visualmente (Opcional, mas comum em auditoria)
      // Nota: Nesta implementação, optamos por passar a diferença bruta para o histórico sem alterar as transações de venda,
      // para manter a integridade do que foi "vendido" vs "o que tem em caixa".
      
      // 3. Monta dados de Auditoria
      // Se houver sangria final, o valor do sistema diminui.
      // O difference já considera o (Sistema - Sangria).
      const currentSystemBalance = totals.NET_TOTAL - withdrawalVal;
      const finalRealValue = currentSystemBalance + difference;

      const auditData = {
          finalRealValue,
          difference,
          status: hasShortage ? 'SHORTAGE' : (hasSurplus ? 'SURPLUS' : 'OK')
      };

      // 4. Fecha o Caixa com Snapshot
      closeCashier(auditData);
      setIsClosing(false);
  }, [closeCashier, registerTransaction, totals.NET_TOTAL]);

  return (
    <div className="h-full flex flex-col relative">
      
      {/* Title Header - Always Visible Top Left, High Z-Index */}
      <div className="absolute top-8 left-8 z-50">
          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Caixa</h3>
          <p className="text-slate-500 font-medium">Gestão de turnos e abertura.</p>
      </div>

      {!cashier.isOpen ? (
        <CashierOpening onOpen={openCashier} />
      ) : (
        <div className="space-y-8 animate-[fadeIn_0.3s] p-4 md:p-8 pt-24">
          {/* Header Buttons Group - Aligned Right */}
          <div className="flex justify-end gap-4 pb-2">
                <button 
                    onClick={onOpenPOS} 
                    className="h-14 px-8 bg-[#EA2831] text-white rounded-2xl font-black text-lg uppercase tracking-wider transition-all shadow-xl shadow-red-500/20 hover:bg-red-700 active:scale-[0.98]"
                >
                    PDV
                </button>
                
                <button 
                    onClick={() => setShowDeposit(true)} 
                    className="h-14 px-6 bg-transparent border-2 border-[#EA2831] text-[#EA2831] rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:bg-red-50 active:scale-[0.98]"
                >
                    Suprimento
                </button>
                
                <button 
                    onClick={() => setShowWithdraw(true)} 
                    className="h-14 px-6 bg-transparent border-2 border-[#EA2831] text-[#EA2831] rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:bg-red-50 active:scale-[0.98]"
                >
                    Sangria
                </button>
                
                <button 
                    onClick={() => setIsClosing(true)} 
                    className="h-14 px-6 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:bg-red-600 active:scale-[0.98]"
                >
                    FECHAR CAIXA
                </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CashStatusCard isOpen={cashier.isOpen} amount={totals.NET_TOTAL} openedAt={cashier.openedAt} />
            <CashGrid totals={totals} />
          </div>
          <div className="flex flex-col gap-6">
             <CashHistory transactions={transactions} />
          </div>
          
          <CashActions 
             showWithdraw={showWithdraw}
             setShowWithdraw={setShowWithdraw}
             showDeposit={showDeposit}
             setShowDeposit={setShowDeposit}
             onWithdraw={(amt, reason) => registerTransaction('WITHDRAWAL', [{ method: 'CASH', amount: amt }], `Saída de Sangria - ${reason}`)}
             onDeposit={(amt, reason) => registerTransaction('DEPOSIT', [{ method: 'CASH', amount: amt }], `Entrada de Suprimento - ${reason}`)}
             onCloseCashier={() => setIsClosing(true)}
          />

          {isClosing && (
              <CashierClosureModal 
                onClose={() => setIsClosing(false)}
                onConfirm={handleConfirmClosure}
                currentSystemBalance={totals.NET_TOTAL}
              />
          )}
        </div>
      )}
    </div>
  );
}
