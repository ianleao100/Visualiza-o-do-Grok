
import React, { useState } from 'react';
import { CheckCircle, CreditCard, DollarSign, QrCode, AlertTriangle, Receipt, Layers, User, Phone, Sparkles, X, Star } from 'lucide-react';
import { formatCurrency, calculateFinalTotal, roundFinance, maskPhone, isEffectivelyPaid, calculatePointsDiscount } from '../../../shared/utils/mathEngine';
import { CartItem } from '../../../types';
import { BaseModal } from '../../ui/BaseModal';

interface PaymentMethod {
    id: 'PIX' | 'CASH' | 'CREDIT' | 'DEBIT';
    label: string;
    icon: React.ElementType;
    color: string;
}

const METHODS: PaymentMethod[] = [
    { id: 'PIX', label: 'PIX', icon: QrCode, color: 'text-primary bg-red-50' },
    { id: 'CASH', label: 'Dinheiro', icon: DollarSign, color: 'text-primary bg-red-50' },
    { id: 'CREDIT', label: 'Cartão de Crédito', icon: CreditCard, color: 'text-primary bg-red-50' },
    { id: 'DEBIT', label: 'Cartão de Débito', icon: CreditCard, color: 'text-primary bg-red-50' },
];

interface PaymentModuleProps {
    subtotal: number;
    initialServiceFee?: number;
    initialCoverCharge?: number;
    onClose: () => void;
    onConfirm: (payments: Record<string, number>, meta: { receivedAmount: number, changeAmount: number, customerName: string, customerWhatsapp: string, isDelivery: boolean, pointsUsed: number }) => void;
    customerName: string;
    setCustomerName: (name: string) => void;
    customerWhatsapp: string;
    setCustomerWhatsapp: (whatsapp: string) => void;
    customerPoints?: number;
    cart: CartItem[];
}

export default function PaymentModule({ 
    subtotal, 
    initialServiceFee = 0, 
    initialCoverCharge = 0, 
    onClose, 
    onConfirm,
    customerName,
    setCustomerName,
    customerWhatsapp,
    setCustomerWhatsapp,
    customerPoints,
    cart
}: PaymentModuleProps) {
    const [values, setValues] = useState<Record<string, string>>({ PIX: '', CASH: '', CREDIT: '', DEBIT: '' });
    
    // Editable Fees State
    const [serviceFee, setServiceFee] = useState(roundFinance(initialServiceFee));
    const [coverCharge, setCoverCharge] = useState(roundFinance(initialCoverCharge));
    const [pointsToUse, setPointsToUse] = useState(0);

    const pointsDiscount = calculatePointsDiscount(pointsToUse);

    // Dynamic Total Calculation
    const totalToReceive = calculateFinalTotal(subtotal, serviceFee, coverCharge, pointsDiscount);
    const sum = roundFinance((Object.values(values) as string[]).reduce((acc: number, val: string) => acc + (parseFloat(val) || 0), 0));
    
    // Balance Logic
    const balance = roundFinance(sum - totalToReceive);
    const isPaid = isEffectivelyPaid(balance); 
    const isSurplus = balance > 0.01;
    const cashValue = parseFloat(values.CASH) || 0;
    
    // Troco só é permitido se houver dinheiro na jogada e o valor pago exceder o total
    const isValidChange = !isSurplus || (isSurplus && cashValue > 0);
    const canFinalize = isPaid && isValidChange;
    const changeAmount = (cashValue > 0 && isSurplus) ? balance : 0;

    const lowStockItems = cart.filter(item => item.name.includes("Kit") || item.price > 90);

    const handleUpdateValue = (method: string, val: string) => {
        setValues(prev => ({ ...prev, [method]: val }));
    };

    const setTotalOnMethod = (method: string) => {
        const otherSum = (Object.entries(values) as [string, string][])
            .filter(([m]) => m !== method)
            .reduce((acc: number, [_, v]) => acc + (parseFloat(v) || 0), 0);
        
        const autoVal = roundFinance(Math.max(0, totalToReceive - otherSum));
        handleUpdateValue(method, autoVal.toString());
    };

    const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomerWhatsapp(maskPhone(e.target.value));
    };

    const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = parseInt(e.target.value) || 0;
        if (val < 0) val = 0;
        if (customerPoints && val > customerPoints) val = customerPoints;
        setPointsToUse(val);
    };

    return (
        <BaseModal onClose={onClose} className="max-w-5xl">
            <div className="relative w-full bg-white dark:bg-surface-dark rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                
                {/* LEFT COLUMN: SUMMARY */}
                <div className="w-full md:w-2/5 bg-gray-50 dark:bg-gray-800/50 p-10 flex flex-col border-r border-gray-100 dark:border-gray-800">
                    <div className="mb-10">
                        <h2 className="text-2xl font-black tracking-tight leading-tight mb-1">Resumo da Venda</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Itens e Taxas Aplicadas</p>
                    </div>

                    <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar">
                        <div className="space-y-4">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm group">
                                    <span className="text-slate-500 font-bold truncate max-w-[180px] flex items-center gap-2">
                                        <span className="size-5 bg-white rounded-md flex items-center justify-center text-[10px] shadow-sm border border-gray-100">{item.quantity}</span>
                                        {item.name}
                                    </span>
                                    <span className="text-slate-900 dark:text-white font-black">{formatCurrency(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
                            <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                                <span className="flex items-center gap-2 uppercase tracking-widest text-[10px]">Subtotal Itens</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                                <span className="flex items-center gap-2 uppercase tracking-widest text-[10px]"><Receipt className="w-3 h-3" /> Taxa Serviço</span>
                                <div className="relative w-24">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">R$</span>
                                    <input type="number" value={serviceFee} onChange={(e) => setServiceFee(parseFloat(e.target.value) || 0)} className="w-full pl-6 pr-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-right text-xs font-black outline-none" />
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                                <span className="flex items-center gap-2 uppercase tracking-widest text-[10px]"><Layers className="w-3 h-3" /> Couvert</span>
                                <div className="relative w-24">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">R$</span>
                                    <input type="number" value={coverCharge} onChange={(e) => setCoverCharge(parseFloat(e.target.value) || 0)} className="w-full pl-6 pr-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-right text-xs font-black outline-none" />
                                </div>
                            </div>
                            {pointsDiscount > 0 && (
                                <div className="flex justify-between items-center text-sm font-bold text-green-600">
                                    <span className="flex items-center gap-2 uppercase tracking-widest text-[10px]"><Star className="w-3 h-3 fill-current" /> Desconto Pontos</span>
                                    <span>- {formatCurrency(pointsDiscount)}</span>
                                </div>
                            )}
                        </div>

                        <div className="pt-6 mt-auto">
                            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block mb-1 text-center">Total Líquido a Receber</span>
                                <p className="text-5xl font-black text-primary text-center font-display tracking-tight">{formatCurrency(totalToReceive)}</p>
                            </div>
                        </div>
                    </div>

                    {lowStockItems.length > 0 && (
                        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl animate-[fadeIn_0.3s]">
                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest mb-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> Atenção: Estoque Baixo
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {lowStockItems.map((item, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-white/80 dark:bg-black/20 rounded-lg text-[10px] font-bold text-amber-700 dark:text-amber-300">{item.name}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: ACTIONS */}
                <div className="flex-1 p-10 flex flex-col gap-8 bg-white dark:bg-surface-dark overflow-y-auto no-scrollbar relative">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:text-red-500 z-20"><X className="w-5 h-5" /></button>

                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl font-black tracking-tight leading-tight">Pagamento</h2>
                            <div className="flex items-center gap-3">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Identificação do Cliente</p>
                                {customerPoints !== undefined && (
                                    <span className="flex items-center gap-1 text-[10px] font-black text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">
                                        <Sparkles className="w-3 h-3 fill-current" />
                                        {customerPoints} pontos
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><User className="w-3 h-3" /> Nome</label>
                            <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nome do Cliente" className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary rounded-2xl font-bold text-slate-900 dark:text-white transition-all shadow-sm" />
                        </div>
                        <div className="space-y-1.5 relative">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Phone className="w-3 h-3" /> WhatsApp</label>
                            <input type="text" value={customerWhatsapp} onChange={handleWhatsappChange} placeholder="(00) 00000-0000" maxLength={15} className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary rounded-2xl font-bold text-slate-900 dark:text-white transition-all shadow-sm" />
                        </div>
                    </div>

                    {customerPoints !== undefined && customerPoints > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-2xl border border-yellow-200 dark:border-yellow-900/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-xl text-yellow-600"><Star className="w-5 h-5 fill-current" /></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-yellow-700 dark:text-yellow-500 tracking-widest">Usar Pontos</p>
                                    <p className="text-xs text-slate-500 font-bold">Saldo: {customerPoints}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative w-24">
                                    <input 
                                        type="number" 
                                        value={pointsToUse || ''}
                                        onChange={handlePointsChange}
                                        placeholder="0"
                                        className="w-full pl-3 pr-8 py-2 bg-white dark:bg-gray-800 border border-yellow-300 dark:border-yellow-700 rounded-xl text-sm font-black focus:ring-1 focus:ring-yellow-500 text-slate-900 dark:text-white"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">pts</span>
                                </div>
                                <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-xl border border-yellow-200 dark:border-yellow-800 min-w-[80px] text-center">
                                    <span className="text-xs font-black text-green-600">= {formatCurrency(pointsDiscount)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Distribuir Valores</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {METHODS.map(method => (
                                <div key={method.id} className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${parseFloat(values[method.id]) > 0 ? 'border-primary bg-primary/5' : 'border-gray-50 dark:border-gray-800 hover:border-gray-200'}`}>
                                    <div className={`p-2.5 rounded-xl shrink-0 ${method.color}`}><method.icon className="w-4 h-4" /></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{method.label}</p>
                                        <div className="relative">
                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xs">R$</span>
                                            <input type="number" step="0.01" value={values[method.id]} onChange={(e) => handleUpdateValue(method.id, e.target.value)} placeholder="0,00" className="w-full pl-5 py-0.5 bg-transparent border-none focus:ring-0 font-black text-base text-slate-900 dark:text-white" />
                                        </div>
                                    </div>
                                    <button onClick={() => setTotalOnMethod(method.id)} className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-lg text-[8px] font-black text-slate-500 hover:text-primary hover:border-primary active:scale-90 transition-all uppercase">Quitar</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto pt-6 space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-800/30 p-6 rounded-[32px] flex items-center justify-between border border-gray-100 dark:border-gray-800">
                            <div className="flex gap-8">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Pago</span>
                                    <span className={`text-2xl font-black ${isPaid ? 'text-green-500' : 'text-slate-900 dark:text-white'}`}>{formatCurrency(sum)}</span>
                                </div>
                            </div>
                            
                            {isSurplus ? (
                                isValidChange ? (
                                    <div className="px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 border-2 bg-green-50 border-green-200 text-green-600 animate-[pulse_1s_ease-in-out]">
                                        <CheckCircle className="w-4 h-4" /> Sobrou: {formatCurrency(Math.abs(balance))}
                                    </div>
                                ) : (
                                    <div className="px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 border-2 bg-red-50 border-red-200 text-red-600">
                                        <AlertTriangle className="w-4 h-4" /> Sem Troco Digital
                                    </div>
                                )
                            ) : !isPaid ? (
                                <div className="px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 border-2 bg-red-50 border-red-200 text-red-600">
                                    <AlertTriangle className="w-4 h-4" /> Faltam: {formatCurrency(Math.abs(balance))}
                                </div>
                            ) : (
                                <div className="px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 border-2 bg-gray-100 border-gray-200 text-gray-500">
                                    Conta Liquidada
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={() => {
                                const finalValues: Record<string, number> = {};
                                (Object.entries(values) as [string, string][]).forEach(([k, v]) => { if (parseFloat(v) > 0) finalValues[k] = parseFloat(v); });
                                onConfirm(finalValues, { receivedAmount: sum, changeAmount: changeAmount, customerName, customerWhatsapp, isDelivery: false, pointsUsed: pointsToUse });
                            }}
                            disabled={!canFinalize}
                            className="w-full bg-[#EA2831] hover:bg-red-600 text-white font-black py-6 rounded-3xl shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:grayscale disabled:opacity-30 disabled:cursor-not-allowed group"
                        >
                            <CheckCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            <span className="text-lg uppercase tracking-[0.2em]">CONFIRMAR E FINALIZAR</span>
                        </button>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}