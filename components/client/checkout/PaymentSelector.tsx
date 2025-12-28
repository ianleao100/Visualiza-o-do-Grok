
import React from 'react';
import { PaymentMethodType } from '../../../types';

interface PaymentSelection {
    id: number;
    method: PaymentMethodType;
    value: number;
    changeFor?: string;
}

interface PaymentSelectorProps {
    paymentSelections: PaymentSelection[];
    activePaymentIdToUpdate: number | null;
    total: number;
    onSetActivePaymentId: (id: number | null) => void;
    onAddPaymentMethod: () => void;
    onRemovePaymentMethod: (id: number) => void;
    onUpdateMethod: (id: number, method: PaymentMethodType) => void;
    onUpdateValue: (id: number, val: number) => void;
    onUpdateField: (id: number, field: string, value: any) => void;
}

const Icon: React.FC<{ name: string, className?: string }> = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({
    paymentSelections,
    activePaymentIdToUpdate,
    total,
    onSetActivePaymentId,
    onAddPaymentMethod,
    onRemovePaymentMethod,
    onUpdateMethod,
    onUpdateValue,
    onUpdateField
}) => {
    const isSplit = paymentSelections.length > 1;

    const getMethodIcon = (method: PaymentMethodType) => {
        switch(method) {
            case 'PIX': return 'qr_code_2';
            case 'CREDIT': return 'credit_card';
            case 'DEBIT': return 'credit_card';
            case 'CASH': return 'payments';
            default: return 'attach_money';
        }
    };

    const getMethodLabel = (method: PaymentMethodType) => {
        switch(method) {
            case 'PIX': return 'PIX';
            case 'CREDIT': return 'Cartão de Crédito';
            case 'DEBIT': return 'Cartão de Débito';
            case 'CASH': return 'Dinheiro';
            default: return 'Pagamento';
        }
    };

    const getMethodValueQuestion = (method: PaymentMethodType) => {
        switch(method) {
            case 'PIX': return 'Quanto será pago no PIX?';
            case 'CASH': return 'Quanto será pago no Dinheiro?';
            case 'CREDIT': return 'Quanto será pago no Crédito?';
            case 'DEBIT': return 'Quanto será pago no Débito?';
            default: return 'Qual o valor desta parte?';
        }
    };

    const renderModal = () => {
        if (activePaymentIdToUpdate === null) return null;
        const activeSelection = paymentSelections.find(p => p.id === activePaymentIdToUpdate);
        if (!activeSelection) return null;
        
        const otherSelection = paymentSelections.find(p => p.id !== activePaymentIdToUpdate);

        return (
            <div className="fixed inset-0 z-[100] bg-[#f8f6f6] dark:bg-background-dark animate-[slideUp_0.3s_ease-out] flex flex-col">
                <div className="px-4 py-4 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0 sticky top-0 z-10">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Escolha a forma de pagamento</h3>
                        <div className="flex items-center gap-2 mt-1 bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 w-fit">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Total do pedido:</span>
                            <span className="text-base font-extrabold text-primary font-display">R$ {total.toFixed(2)}</span>
                        </div>
                    </div>
                    <button onClick={() => onSetActivePaymentId(null)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 transition-colors"><Icon name="close" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-24">
                    {[
                        { title: 'Opções', items: [
                            { method: 'PIX', label: 'PIX', sub: 'Recomendado', icon: 'qr_code_2' },
                            { method: 'CASH', label: 'Dinheiro', sub: '', icon: 'payments' },
                            { method: 'CREDIT', label: 'Cartão de Crédito', sub: '', icon: 'credit_card' },
                            { method: 'DEBIT', label: 'Cartão de Débito', sub: '', icon: 'credit_card' }
                        ] }
                    ].map((section, idx) => (
                        <div key={idx}>
                            <div className="space-y-2">
                                {section.items.map((opt: any) => {
                                    const selectionForThisMethod = paymentSelections.find(p => p.method === opt.method);
                                    const isAlreadyChosen = otherSelection?.method === opt.method;
                                    const isSelected = activeSelection.method === opt.method;
                                    const isEitherSelected = isSelected || isAlreadyChosen;

                                    return (
                                        <div 
                                            key={opt.method} 
                                            onClick={() => !isAlreadyChosen && onUpdateMethod(activeSelection.id, opt.method)} 
                                            className={`w-full flex flex-col bg-white dark:bg-surface-dark p-4 rounded-xl border transition-all shadow-sm ${isEitherSelected ? 'border-[#ea2a33] ring-1 ring-[#ea2a33] bg-red-50/10' : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 cursor-pointer'} ${isAlreadyChosen ? 'cursor-default' : ''}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2.5 rounded-full ${isEitherSelected ? 'bg-[#ea2a33] text-white' : 'bg-gray-100 dark:bg-gray-700 text-slate-900 dark:text-white'}`}><Icon name={opt.icon} /></div>
                                                <div className="text-left flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className={`font-bold text-base ${isEitherSelected ? 'text-[#ea2a33]' : 'text-slate-900 dark:text-white'}`}>{opt.label}</p>
                                                        {opt.method === 'PIX' && (
                                                            <span className="text-green-600 dark:text-green-400 text-[11px] font-bold uppercase tracking-wide">
                                                                Recomendado
                                                            </span>
                                                        )}
                                                        {isAlreadyChosen && <span className="text-[10px] text-gray-400 font-bold ml-1">(Já selecionado)</span>}
                                                    </div>
                                                </div>
                                                {isEitherSelected && <Icon name="check_circle" className="text-[#ea2a33]" />}
                                            </div>

                                            {isEitherSelected && isSplit && (
                                                <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50 animate-[fadeIn_0.2s] space-y-4 cursor-default" onClick={e => e.stopPropagation()}>
                                                    <div className="pl-14">
                                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                                                            {getMethodValueQuestion(opt.method)}
                                                        </label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
                                                            <input 
                                                                type="number" 
                                                                placeholder="0,00"
                                                                value={selectionForThisMethod?.value || ''} 
                                                                onChange={(e) => {
                                                                    const val = parseFloat(e.target.value) || 0;
                                                                    if (selectionForThisMethod) onUpdateValue(selectionForThisMethod.id, val);
                                                                }} 
                                                                className="w-full pl-10 p-3 bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-600 rounded-xl font-bold text-lg text-slate-900 dark:text-white focus:border-[#ea2a33] focus:ring-1 focus:ring-[#ea2a33] transition-all" 
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    {opt.method === 'CASH' && (
                                                        <div className="animate-[fadeIn_0.2s] pl-14">
                                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Precisa de Troco?</label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
                                                                <input 
                                                                    type="text" 
                                                                    placeholder="Deixe zero se não precisa" 
                                                                    value={selectionForThisMethod?.changeFor || ''} 
                                                                    onChange={(e) => {
                                                                        if (selectionForThisMethod) onUpdateField(selectionForThisMethod.id, 'changeFor', e.target.value);
                                                                    }} 
                                                                    className="w-full pl-10 p-3 bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-600 rounded-xl font-bold text-lg text-slate-900 dark:text-white focus:border-[#ea2a33] focus:ring-1 focus:ring-[#ea2a33] transition-all" 
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 z-20">
                    <button 
                        disabled={isSplit ? (paymentSelections.some(p => p.value <= 0)) : false}
                        onClick={() => onSetActivePaymentId(null)} 
                        className="w-full bg-[#ea2a33] hover:bg-[#d6252d] text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                    >
                        Confirmar Pagamento
                    </button>
                </div>
            </div>
        );
    };

    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-base font-semibold px-1 text-slate-900 dark:text-white">Forma de Pagamento</h2>
            
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm p-4 flex flex-col gap-4 border border-black/5 dark:border-white/5">
                {paymentSelections.map((selection, index) => (
                    <div key={selection.id} className="animate-[fadeIn_0.3s] relative">
                        {index > 0 && (
                            <div className="flex justify-end mb-2">
                                <button 
                                    onClick={() => onRemovePaymentMethod(selection.id)} 
                                    className="text-[#ea2a33] text-[13px] font-bold hover:underline px-2 py-1"
                                >
                                    Remover
                                </button>
                            </div>
                        )}
                        <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col gap-4 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-red-50 dark:bg-red-900/20 p-2.5 rounded-full flex items-center justify-center text-[#ea2a33]"><Icon name={getMethodIcon(selection.method)} className="text-[22px]" /></div>
                                    <div>
                                        <p className="text-[16px] font-bold text-slate-900 dark:text-white leading-tight">{getMethodLabel(selection.method)}</p>
                                        {selection.method === 'PIX' && (
                                            <p className="text-green-600 dark:text-green-400 text-[12px] font-bold mt-0.5">Recomendado</p>
                                        )}
                                    </div>
                                </div>
                                <button onClick={() => onSetActivePaymentId(selection.id)} className="text-[#ea2a33] font-bold text-[13px] hover:underline">Alterar</button>
                            </div>
                            
                            <div className="pt-3 border-t border-gray-50 dark:border-gray-800/20 flex flex-col gap-2">
                                <div className="flex justify-between items-center" style={{ paddingLeft: '52px' }}>
                                    <span className="text-sm font-bold text-gray-400 uppercase">Valor</span>
                                    <span className="text-base font-extrabold text-slate-900 dark:text-white">R$ {(selection.value || total).toFixed(2)}</span>
                                </div>
                                {selection.method === 'CASH' && selection.changeFor && (
                                    <div className="mt-1" style={{ marginLeft: '52px' }}>
                                        <div className="bg-yellow-50 dark:bg-yellow-900/10 p-2 rounded-lg border border-yellow-100 dark:border-yellow-900/30 flex items-center gap-2">
                                            <Icon name="currency_exchange" className="text-yellow-600 text-[16px]" />
                                            <span className="text-[13px] font-bold text-slate-900 dark:text-white">
                                                Troco para R$ {selection.changeFor}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                
                {!isSplit && (
                    <button onClick={onAddPaymentMethod} className="w-full bg-transparent border-2 border-dashed border-[#ea2a33]/40 rounded-xl p-3.5 flex items-center justify-center gap-2 text-[#ea2a33] hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group">
                        <div className="bg-red-100 dark:bg-red-900/30 text-[#ea2a33] rounded-full p-0.5"><Icon name="add" className="text-sm font-bold" /></div>
                        <span className="font-bold text-[14px]">Adicionar segunda forma de pagamento</span>
                    </button>
                )}
            </div>
            {renderModal()}
        </section>
    );
};
