import React from 'react';
import { QrCode, DollarSign, CreditCard, CheckCircle, Calculator, Minus, Plus, Percent, Truck, Gift, Star } from 'lucide-react';
import { formatCurrency, calculatePointsDiscount } from '../../../../../shared/utils/mathEngine';
import { PaymentMethodType } from '../../../../../types';

interface DeliveryStepPaymentProps {
    subtotal: number;
    totalValue: number;
    deliveryFee: number;
    setDeliveryFee: (val: number) => void;
    discount: number;
    setDiscount: (val: number) => void;
    discountType: 'BRL' | 'PERCENT';
    setDiscountType: (type: 'BRL' | 'PERCENT') => void;
    usePoints: boolean; // Mantido para compatibilidade, mas a lógica agora usa pointsToUse
    setUsePoints: (val: boolean) => void; 
    pointsToUse: number; // Novo campo
    setPointsToUse: (val: number) => void; // Novo setter
    paymentMethod: PaymentMethodType;
    setPaymentMethod: (method: PaymentMethodType) => void;
    cashPaidAmount: string;
    setCashPaidAmount: (val: string) => void;
    changeValue: number;
    calculatedDiscount: number;
    pointsDiscountValue: number;
    showMoreOptions: boolean;
    setShowMoreOptions: (val: boolean) => void;
    customerPoints: number;
}

const DeliveryStepPayment = React.memo((props: DeliveryStepPaymentProps) => {
    
    const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = parseInt(e.target.value) || 0;
        if (val < 0) val = 0;
        if (val > props.customerPoints) val = props.customerPoints;
        props.setPointsToUse(val);
    };

    const pointsValue = calculatePointsDiscount(props.pointsToUse);

    return (
        <div className="flex flex-col md:flex-row h-full gap-6 animate-[fadeIn_0.3s]">
            <div className="w-full md:w-5/12 flex flex-col gap-4">
                <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border-2 border-[#EA2831]/10 flex flex-col gap-4 text-center relative overflow-hidden shadow-sm h-full justify-center">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-[#EA2831]"></div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Valor Total a Receber</span>
                    <span className="text-5xl lg:text-6xl font-black text-[#EA2831] font-display tracking-tight break-all leading-none py-2">{formatCurrency(props.totalValue)}</span>
                    
                    <div className="flex flex-col gap-2 text-xs font-bold text-slate-500 border-t border-dashed border-gray-200 dark:border-gray-700 pt-4 mt-2">
                        <div className="flex justify-between w-full">
                            <span className="uppercase tracking-widest opacity-70">Produtos</span>
                            <span>{formatCurrency(props.subtotal)}</span>
                        </div>
                        <div className="flex justify-between w-full">
                            <span className="uppercase tracking-widest opacity-70">Entrega</span>
                            <span>+ {formatCurrency(props.deliveryFee)}</span>
                        </div>
                        {(props.calculatedDiscount > 0 || props.pointsToUse > 0) && (
                            <div className="flex justify-between w-full text-green-600">
                                <span className="uppercase tracking-widest opacity-70">Descontos</span>
                                <span>- {formatCurrency(props.calculatedDiscount + pointsValue)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full md:w-7/12 flex flex-col gap-4 overflow-y-auto no-scrollbar pb-4">
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: 'PIX', label: 'PIX', icon: QrCode },
                        { id: 'CASH', label: 'Dinheiro', icon: DollarSign },
                        { id: 'CREDIT', label: 'Crédito', icon: CreditCard },
                        { id: 'DEBIT', label: 'Débito', icon: CreditCard }
                    ].map(m => (
                        <button 
                            key={m.id}
                            onClick={() => props.setPaymentMethod(m.id as PaymentMethodType)}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${props.paymentMethod === m.id ? 'border-[#EA2831] bg-red-50 text-[#EA2831]' : 'border-gray-100 hover:border-gray-300 bg-white dark:bg-surface-dark text-slate-600'}`}
                        >
                            <m.icon className="w-5 h-5 shrink-0" />
                            <span className="font-bold uppercase text-[10px] sm:text-xs">{m.label}</span>
                            {props.paymentMethod === m.id && <CheckCircle className="w-4 h-4 ml-auto shrink-0" />}
                        </button>
                    ))}
                </div>

                {props.paymentMethod === 'CASH' && (
                    <div className="bg-yellow-50/50 p-4 rounded-2xl border border-yellow-200">
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-[10px] font-black text-yellow-700 uppercase tracking-widest flex items-center gap-2">
                                <Calculator className="w-3 h-3" /> Troco para quanto?
                            </label>
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-yellow-600">R$</span>
                            <input 
                                type="number" 
                                value={props.cashPaidAmount} 
                                onChange={(e) => props.setCashPaidAmount(e.target.value)} 
                                placeholder={props.totalValue.toFixed(2)}
                                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-500 font-bold text-yellow-900"
                            />
                        </div>
                        {props.changeValue > 0 && (
                            <div className="mt-3 p-3 bg-yellow-100 rounded-xl flex items-center justify-between">
                                <span className="text-xs font-bold text-yellow-700">Troco a levar:</span>
                                <span className="text-lg font-black text-yellow-800">{formatCurrency(props.changeValue)}</span>
                            </div>
                        )}
                    </div>
                )}

                <div>
                    <button 
                        onClick={() => props.setShowMoreOptions(!props.showMoreOptions)}
                        className="flex items-center gap-2 text-xs font-black text-[#EA2831] uppercase tracking-widest hover:bg-red-50 px-3 py-2 rounded-lg transition-all"
                    >
                        {props.showMoreOptions ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        Mais Opções
                    </button>

                    {props.showMoreOptions && (
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4 animate-[slideDown_0.2s]">
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Campo Desconto Inteligente */}
                                <div className="flex-1 space-y-1 w-full">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><Percent className="w-3 h-3" /> Desconto (Extra)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400">{props.discountType === 'BRL' ? 'R$' : '%'}</span>
                                        <input 
                                            type="number" 
                                            value={props.discount || ''} 
                                            onChange={e => props.setDiscount(parseFloat(e.target.value) || 0)}
                                            className="w-full pl-9 pr-14 py-2.5 bg-white dark:bg-surface-dark border-none rounded-xl text-sm font-bold text-green-600 focus:ring-1 focus:ring-green-500"
                                            placeholder="0.00"
                                        />
                                        <button 
                                            onClick={() => props.setDiscountType(props.discountType === 'BRL' ? 'PERCENT' : 'BRL')}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-[10px] font-bold text-slate-600 transition-colors"
                                        >
                                            {props.discountType === 'BRL' ? '%' : 'R$'}
                                        </button>
                                    </div>
                                </div>

                                {/* Campo Taxa de Entrega Editável */}
                                <div className="flex-1 space-y-1 w-full">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><Truck className="w-3 h-3" /> Valor da Entrega</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400">R$</span>
                                        <input 
                                            type="number" 
                                            value={props.deliveryFee} 
                                            onChange={e => props.setDeliveryFee(parseFloat(e.target.value) || 0)}
                                            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-surface-dark border-none rounded-xl text-sm font-bold text-slate-900 focus:ring-1 focus:ring-[#EA2831]"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Seção de Fidelidade Melhorada */}
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-yellow-600 fill-current" />
                                        <span className="text-xs font-black text-yellow-700 dark:text-yellow-500 uppercase tracking-widest">Resgatar Pontos</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-yellow-600 bg-white px-2 py-0.5 rounded-lg border border-yellow-100">Disponível: {props.customerPoints} pts</span>
                                </div>
                                
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input 
                                            type="number" 
                                            value={props.pointsToUse || ''}
                                            onChange={handlePointsChange}
                                            placeholder="0"
                                            className="w-full pl-3 pr-16 py-2 bg-white dark:bg-surface-dark border border-yellow-200 dark:border-yellow-800 rounded-xl text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-400"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">pts</span>
                                    </div>
                                    <div className="flex items-center justify-center bg-white dark:bg-surface-dark px-4 rounded-xl border border-yellow-200 dark:border-yellow-800 min-w-[100px]">
                                        <span className="text-sm font-black text-green-600">= {formatCurrency(pointsValue)}</span>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => props.setPointsToUse(props.customerPoints)}
                                    disabled={props.customerPoints === 0}
                                    className="text-[10px] font-bold text-yellow-600 hover:underline disabled:opacity-50 disabled:no-underline"
                                >
                                    Usar Saldo Total
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default DeliveryStepPayment;