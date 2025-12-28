import React, { useState, useMemo } from 'react';
import { Save, AlertCircle, CheckCircle, Calculator } from 'lucide-react';
import { BaseModal } from '../../ui/BaseModal';
import { formatCurrency, roundFinance } from '../../../shared/utils/mathEngine';

interface CashierClosureModalProps {
    onClose: () => void;
    onConfirm: (finalWithdrawal: number, difference: number, hasShortage: boolean, hasSurplus: boolean) => void;
    currentSystemBalance: number;
}

export default function CashierClosureModal({ onClose, onConfirm, currentSystemBalance }: CashierClosureModalProps) {
    const [finalWithdrawal, setFinalWithdrawal] = useState('');
    const [closingCashAmount, setClosingCashAmount] = useState('');

    // Logic: Closing Calculations
    const calculations = useMemo(() => {
        const withdrawalVal = parseFloat(finalWithdrawal) || 0;
        const expectedCash = Math.max(0, roundFinance(currentSystemBalance - withdrawalVal));
        const realCash = parseFloat(closingCashAmount) || 0;
        const difference = roundFinance(realCash - expectedCash);
        const hasSurplus = difference > 0.01;
        const hasShortage = difference < -0.01;

        return { withdrawalVal, expectedCash, difference, hasSurplus, hasShortage };
    }, [currentSystemBalance, finalWithdrawal, closingCashAmount]);

    const handleConfirm = () => {
        onConfirm(
            calculations.withdrawalVal, 
            calculations.difference, 
            calculations.hasShortage, 
            calculations.hasSurplus
        );
    };

    return (
        <BaseModal onClose={onClose} className="max-w-lg" title="Encerrar Expediente">
            <div className="space-y-6">
                <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-900/30">
                    <label className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-2 block">1. Sangria Final (Opcional)</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-orange-400">R$</span>
                        <input type="number" value={finalWithdrawal} onChange={e => setFinalWithdrawal(e.target.value)} placeholder="0,00" className="w-full pl-11 pr-4 py-3 bg-white dark:bg-surface-dark border-none rounded-xl focus:ring-2 focus:ring-orange-500 font-bold text-slate-900 dark:text-white" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-end mb-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Saldo Esperado</label>
                        <span className="text-[10px] font-bold text-slate-400 uppercase bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <Calculator className="w-3 h-3" /> Calculado pelo Sistema
                        </span>
                        </div>
                        <div className="w-full pl-6 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 font-black text-xl text-slate-500 dark:text-gray-400 cursor-not-allowed select-none">
                        {formatCurrency(calculations.expectedCash)}
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest ml-1 mb-2 block">2. Valor Real em Caixa (Contagem Física)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-900 dark:text-white">R$</span>
                            <input type="number" value={closingCashAmount} onChange={e => setClosingCashAmount(e.target.value)} placeholder="0,00" autoFocus className="w-full pl-11 pr-4 py-4 bg-white dark:bg-surface-dark border-2 border-[#EA2831]/30 rounded-2xl focus:ring-4 focus:ring-[#EA2831]/20 focus:border-[#EA2831] font-black text-xl text-slate-900 dark:text-white transition-all" />
                        </div>
                    </div>
                </div>

                {closingCashAmount && (
                    <div className={`p-4 rounded-2xl border-2 flex items-center gap-3 animate-[fadeIn_0.3s] ${calculations.hasShortage ? 'bg-red-50 border-red-100 text-red-600' : calculations.hasSurplus ? 'bg-green-50 border-green-100 text-green-600' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                        {calculations.hasShortage ? <AlertCircle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest">{calculations.hasShortage ? 'Quebra (Falta)' : calculations.hasSurplus ? 'Sobra de Caixa' : 'Caixa Batido'}</span>
                            <span className="text-xl font-black">{calculations.hasShortage ? '-' : calculations.hasSurplus ? '+' : ''} {formatCurrency(Math.abs(calculations.difference))}</span>
                        </div>
                    </div>
                )}

                <button onClick={handleConfirm} disabled={!closingCashAmount} className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 mt-4 disabled:opacity-50">
                    <Save className="w-5 h-5" /> CONFIRMAR E ENCERRAR
                </button>
            </div>
        </BaseModal>
    );
}