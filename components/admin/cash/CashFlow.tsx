
import React, { useState } from 'react';
import { ArrowRight, Power, AlertTriangle, CheckCircle, Save } from 'lucide-react';
import { BaseModal } from '../../ui/BaseModal';
import { formatCurrency } from '../../../shared/utils/mathEngine';
import { MOCK_PROFESSIONALS } from '../../../constants';
import CashStatusCard from './CashStatusCard';
import CashHeader from './CashHeader';
import CashGrid from './CashGrid';
import CashHistory from './CashHistory';
import CashActions from './CashActions';

interface CashFlowProps {
  cashierRegistry: any;
  onOpenPOS: () => void;
}

export default function CashFlow({ cashierRegistry, onOpenPOS }: CashFlowProps) {
  const { session, transactions, totals, openCashier, closeCashier, registerTransaction } = cashierRegistry;
  
  const [openingValue, setOpeningValue] = useState('');
  const [selectedPro, setSelectedPro] = useState('');
  
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);

  const [isClosing, setIsClosing] = useState(false);
  const [finalWithdrawal, setFinalWithdrawal] = useState(''); 
  const [closingCashAmount, setClosingCashAmount] = useState(''); 

  const handleOpen = () => {
    if (!selectedPro) { alert('Selecione o responsável!'); return; }
    openCashier(selectedPro, parseFloat(openingValue) || 0);
  };

  const systemCash = totals.CASH;
  const withdrawalVal = parseFloat(finalWithdrawal) || 0;
  const expectedCash = Math.max(0, systemCash - withdrawalVal);
  const realCash = parseFloat(closingCashAmount) || 0;
  const difference = realCash - expectedCash;
  const hasSurplus = difference > 0.01;
  const hasShortage = difference < -0.01;

  const handleConfirmClosure = () => {
      if (withdrawalVal > 0) registerTransaction('WITHDRAWAL', [{ method: 'CASH', amount: withdrawalVal }], 'Sangria Final de Fechamento');
      if (hasShortage) registerTransaction('WITHDRAWAL', [{ method: 'CASH', amount: Math.abs(difference) }], 'Quebra de Caixa (Falta)', { receivedAmount: 0, changeAmount: 0 });
      else if (hasSurplus) registerTransaction('DEPOSIT', [{ method: 'CASH', amount: difference }], 'Sobra de Caixa (Excedente)', { receivedAmount: 0, changeAmount: 0 });

      closeCashier();
      setIsClosing(false);
      setFinalWithdrawal('');
      setClosingCashAmount('');
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      <CashHeader 
        isOpen={session.isOpen}
        onOpenPOS={onOpenPOS}
        onOpenDeposit={() => setShowDeposit(true)}
        onOpenWithdraw={() => setShowWithdraw(true)}
        onCloseCashier={() => setIsClosing(true)}
      />

      {isClosing && (
          <BaseModal onClose={() => setIsClosing(false)} className="max-w-lg" title="Encerrar Expediente">
              <div className="space-y-6">
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-900/30">
                      <label className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-2 block">1. Última Sangria (Opcional)</label>
                      <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-orange-400">R$</span>
                          <input type="number" value={finalWithdrawal} onChange={e => setFinalWithdrawal(e.target.value)} placeholder="0,00" className="w-full pl-11 pr-4 py-3 bg-white dark:bg-surface-dark border-none rounded-xl focus:ring-2 focus:ring-orange-500 font-bold text-slate-900 dark:text-white" />
                      </div>
                  </div>

                  <div className="space-y-4">
                      <div>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Valor Esperado (Sistema)</label>
                         <div className="w-full pl-6 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 font-black text-xl text-slate-500 dark:text-gray-400 cursor-not-allowed select-none">
                            {formatCurrency(expectedCash)}
                         </div>
                      </div>
                      <div>
                          <label className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest ml-1 mb-2 block">2. Valor Real em Caixa</label>
                          <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-900 dark:text-white">R$</span>
                              <input type="number" value={closingCashAmount} onChange={e => setClosingCashAmount(e.target.value)} placeholder="0,00" autoFocus className="w-full pl-11 pr-4 py-4 bg-white dark:bg-surface-dark border-2 border-primary/30 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary font-black text-xl text-slate-900 dark:text-white transition-all" />
                          </div>
                      </div>
                  </div>

                  {closingCashAmount && (
                      <div className={`p-4 rounded-2xl border-2 flex items-center gap-3 animate-[fadeIn_0.3s] ${hasShortage ? 'bg-red-50 border-red-100 text-red-600' : hasSurplus ? 'bg-green-50 border-green-100 text-green-600' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                          {hasShortage ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                          <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-widest">{hasShortage ? 'Quebra (Falta)' : hasSurplus ? 'Sobra de Caixa' : 'Caixa Batido'}</span>
                              <span className="text-xl font-black">{hasShortage ? '-' : hasSurplus ? '+' : ''} {formatCurrency(Math.abs(difference))}</span>
                          </div>
                      </div>
                  )}

                  <button onClick={handleConfirmClosure} disabled={!closingCashAmount} className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 mt-4 disabled:opacity-50">
                      <Save className="w-5 h-5" /> CONFIRMAR E ENCERRAR
                  </button>
              </div>
          </BaseModal>
      )}
      
      {!session.isOpen ? (
        <div className="max-w-xl mx-auto bg-white dark:bg-surface-dark rounded-[48px] p-12 shadow-2xl border border-gray-100 dark:border-gray-800 text-center flex flex-col items-center gap-10">
          <div className="size-24 bg-red-50 dark:bg-red-900/10 rounded-[32px] flex items-center justify-center text-primary shadow-inner">
            <Power className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Abertura de Caixa</h4>
            <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed font-medium">Inicie o turno para desbloquear as funções de venda do PDV.</p>
          </div>
          <div className="w-full space-y-6">
            <div className="text-left space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 block">Operador Responsável</label>
                <select value={selectedPro} onChange={e => setSelectedPro(e.target.value)} className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-[24px] focus:ring-2 focus:ring-primary font-bold text-slate-900 dark:text-white transition-all appearance-none">
                    <option value="">Selecionar Operador...</option>
                    {MOCK_PROFESSIONALS.map(pro => <option key={pro.id} value={pro.name}>{pro.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 block">Fundo de Troco (Inicial)</label>
                <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-lg">R$</span>
                    <input type="number" value={openingValue} onChange={e => setOpeningValue(e.target.value)} placeholder="0,00" className="w-full pl-16 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-[24px] focus:ring-2 focus:ring-primary font-black text-xl text-slate-900 dark:text-white transition-all" />
                </div>
              </div>
            </div>
            <button onClick={handleOpen} className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-[24px] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 mt-4 group">
               INICIAR TURNO DE CAIXA <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-[fadeIn_0.3s]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CashStatusCard isOpen={session.isOpen} amount={totals.NET_TOTAL} openedAt={session.openedAt} />
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
             onWithdraw={(amt, res) => registerTransaction('WITHDRAWAL', [{ method: 'CASH', amount: amt }], res)}
             onDeposit={(amt, res) => registerTransaction('DEPOSIT', [{ method: 'CASH', amount: amt }], res)}
             onCloseCashier={() => setIsClosing(true)}
          />
        </div>
      )}
    </div>
  );
}
