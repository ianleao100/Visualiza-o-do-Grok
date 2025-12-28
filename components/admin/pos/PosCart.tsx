
import React from 'react';
import { ShoppingCart, Layers, Receipt, Percent, Users, CheckCircle, Save, Printer, Minus, Plus, Check, Zap, Bike, Utensils } from 'lucide-react';
import { CartItem } from '../../../types';
import { formatCurrency, calculateFee, calculateFinalTotal, calculateProportional, roundFinance } from '../../../shared/utils/mathEngine';

interface PosCartProps {
  cart: CartItem[];
  customerName: string;
  setCustomerName: (name: string) => void;
  customerWhatsapp: string;
  setCustomerWhatsapp: (whatsapp: string) => void;
  tableNumber: string;
  setTableNumber: (num: string) => void;
  updateQty: (idx: number, delta: number) => void;
  showExtraOptions: boolean;
  setShowExtraOptions: (show: boolean) => void;
  serviceFee: number;
  setServiceFee: (fee: number) => void;
  serviceFeeType: 'BRL' | 'PERCENT';
  setServiceFeeType: (type: 'BRL' | 'PERCENT') => void;
  coverCharge: number;
  setCoverCharge: (fee: number) => void;
  coverChargeType: 'BRL' | 'PERCENT';
  setCoverChargeType: (type: 'BRL' | 'PERCENT') => void;
  discount: number;
  setDiscount: (val: number) => void;
  discountType: 'BRL' | 'PERCENT';
  setDiscountType: (type: 'BRL' | 'PERCENT') => void;
  splitCount: number;
  setSplitCount: (val: number) => void;
  onSaveToTable?: () => void;
  onOpenPayment: (data: { subtotal: number, serviceFee: number, coverCharge: number, indices?: number[] }) => void;
  onPrint?: () => void;
  isTableView?: boolean;
  posMode?: 'QUICK' | 'TABLES' | 'DELIVERY'; // New Prop
  selectedIndices: number[];
  setSelectedIndices: (indices: number[]) => void;
}

export default function PosCart({
  cart,
  tableNumber,
  updateQty,
  showExtraOptions,
  setShowExtraOptions,
  serviceFee,
  setServiceFee,
  serviceFeeType,
  setServiceFeeType,
  coverCharge,
  setCoverCharge,
  coverChargeType,
  setCoverChargeType,
  discount,
  setDiscount,
  discountType,
  setDiscountType,
  splitCount,
  setSplitCount,
  onSaveToTable,
  onOpenPayment,
  onPrint,
  isTableView,
  posMode = 'QUICK',
  selectedIndices,
  setSelectedIndices
}: PosCartProps) {
  
  const subtotal = roundFinance(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0));
  const selectedSubtotal = roundFinance(cart.filter((_, idx) => selectedIndices.includes(idx)).reduce((sum, item) => sum + (item.price * item.quantity), 0));
  
  const calculatedServiceFee = calculateFee(subtotal, serviceFee, serviceFeeType);
  const calculatedCoverCharge = calculateFee(subtotal, coverCharge, coverChargeType);
  const calculatedDiscount = calculateFee(subtotal, discount, discountType);

  const finalTotal = calculateFinalTotal(subtotal, calculatedServiceFee, calculatedCoverCharge, calculatedDiscount);
  const totalPerPerson = roundFinance(finalTotal / (splitCount || 1));

  const toggleSelection = (idx: number) => {
    setSelectedIndices(
      selectedIndices.includes(idx) ? selectedIndices.filter(i => i !== idx) : [...selectedIndices, idx]
    );
  };

  const handleOpenPaymentInternal = (isIndividual: boolean) => {
    if (isIndividual) {
        onOpenPayment({
            subtotal: selectedSubtotal,
            serviceFee: calculateProportional(calculatedServiceFee, subtotal, selectedSubtotal),
            coverCharge: calculateProportional(calculatedCoverCharge, subtotal, selectedSubtotal),
            indices: selectedIndices
        });
    } else {
        onOpenPayment({
            subtotal: roundFinance(subtotal - calculatedDiscount),
            serviceFee: calculatedServiceFee,
            coverCharge: calculatedCoverCharge
        });
    }
  };

  const handlePrintIndividual = () => {
      const propService = calculateProportional(calculatedServiceFee, subtotal, selectedSubtotal);
      const propCover = calculateProportional(calculatedCoverCharge, subtotal, selectedSubtotal);
      const totalIndividual = selectedSubtotal + propService + propCover;
      
      alert(`Imprimindo Cupom Individual:\n\nSubtotal Itens: ${formatCurrency(selectedSubtotal)}\nTaxa Serviço: ${formatCurrency(propService)}\nCouvert: ${formatCurrency(propCover)}\nTotal a Pagar: ${formatCurrency(totalIndividual)}`);
  };

  const inputConfigClasses = "w-full pl-9 pr-14 py-3 bg-white dark:bg-gray-800 border border-slate-900 dark:border-gray-600 rounded-xl focus:ring-1 focus:ring-primary text-sm font-black text-slate-900 dark:text-white transition-all h-[46px]";

  const renderToggle = (type: 'BRL' | 'PERCENT', onToggle: () => void) => (
    <button 
        onClick={onToggle} 
        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-primary text-white shadow-sm hover:bg-red-600 transition-all font-black text-xs min-w-[36px]"
    >
        {type === 'BRL' ? '%' : 'R$'}
    </button>
  );

  const summaryLabelClass = "text-[10px] font-black text-slate-400 uppercase tracking-widest";
  const summaryValueClass = "text-[10px] font-black text-slate-600 dark:text-gray-300";

  // Dynamic Header Logic
  const getHeaderConfig = () => {
      if (posMode === 'DELIVERY') return { title: 'Delivery', icon: Bike };
      if (posMode === 'TABLES') return { title: 'Mesas', icon: Utensils };
      return { title: 'Venda Rápida', icon: Zap };
  };

  const headerConfig = getHeaderConfig();
  const HeaderIcon = headerConfig.icon;

  return (
    <div className="w-[480px] bg-white dark:bg-surface-dark flex flex-col shrink-0 shadow-[-20px_0_40px_rgba(0,0,0,0.02)] z-10 border-l border-gray-100 dark:border-gray-800 transition-colors">
      
      <div className={`px-8 pt-6 pb-2 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-3`}>
         {isTableView ? (
           <div className="flex items-center justify-between py-2 bg-primary/5 rounded-2xl border border-primary/10 mb-2 px-6 animate-[slideDown_0.2s]">
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Atendimento Ativo</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">Mesa {tableNumber}</span>
             </div>
             <div className="p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
                <Layers className="w-5 h-5" />
             </div>
           </div>
         ) : (
           <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Venda</span>
                 <span className="text-sm font-black text-slate-900 dark:text-white">{headerConfig.title}</span>
              </div>
              <HeaderIcon className="w-5 h-5 text-primary" />
           </div>
         )}
      </div>

      <div className="flex-1 overflow-y-auto p-8 pt-4 no-scrollbar">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-6 text-slate-300">
             <div className="size-20 bg-gray-50 dark:bg-gray-800/50 rounded-[32px] flex items-center justify-center border border-gray-100 dark:border-gray-800">
                <ShoppingCart className="w-8 h-8 opacity-10" />
             </div>
             <p className="font-black text-[10px] uppercase tracking-[0.3em] opacity-30">Aguardando itens...</p>
          </div>
        ) : (
          <div className="space-y-4">
             {cart.map((item, idx) => (
               <div key={`${item.id}-${idx}`} className="flex items-center gap-4 group animate-[slideIn_0.2s_ease-out] border-b border-gray-50 dark:border-gray-800/50 pb-3 last:border-0 last:pb-0">
                  <button 
                    onClick={() => toggleSelection(idx)}
                    className={`shrink-0 size-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedIndices.includes(idx) ? 'bg-primary border-primary text-white shadow-lg' : 'border-gray-200 hover:border-primary'}`}
                  >
                    {selectedIndices.includes(idx) && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex flex-1 gap-4 items-center">
                    <img src={item.imageUrl} className="size-16 rounded-[20px] object-cover shrink-0 shadow-sm border border-gray-50 dark:border-gray-800" />
                    <div className="flex-1 flex flex-col min-w-0">
                       <div className="flex justify-between items-center mb-1">
                          <h4 className="font-black text-slate-900 dark:text-white text-base leading-tight line-clamp-1">{item.name}</h4>
                          <div className="flex items-center gap-2 shrink-0 ml-4">
                            <button onClick={() => updateQty(idx, -1)} className="text-primary hover:scale-125 transition-all"><Minus className="w-4 h-4 stroke-[3]" /></button>
                            <span className="text-sm font-black w-5 text-center text-slate-900 dark:text-white">{item.quantity}</span>
                            <button onClick={() => updateQty(idx, 1)} className="text-primary hover:scale-125 transition-all"><Plus className="w-4 h-4 stroke-[3]" /></button>
                          </div>
                       </div>
                       
                       {item.selectedExtras && item.selectedExtras.length > 0 && (
                          <div className="flex flex-col gap-0.5 mb-1.5">
                             {item.selectedExtras.map(extra => (
                               <div key={extra.id} className="flex justify-between items-center text-xs font-bold text-slate-400 dark:text-gray-500">
                                  <span>+ {extra.name}</span>
                                  <span>{formatCurrency(extra.price)}</span>
                               </div>
                             ))}
                          </div>
                       )}

                       {item.notes && (
                          <div className="flex items-start gap-1.5 text-[10px] font-bold text-red-600 bg-transparent w-full px-2 py-1.5 rounded-lg mb-1.5 border border-red-200 dark:border-red-900/30">
                             <span className="whitespace-pre-wrap break-words leading-relaxed">{item.notes}</span>
                          </div>
                       )}

                       <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-dashed border-gray-100 dark:border-gray-800">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Valor Total:</span>
                          <span className={`text-lg font-black font-display ${selectedIndices.includes(idx) ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                       </div>
                    </div>
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 flex flex-col">
         
         {showExtraOptions && (
            <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800 animate-[slideUp_0.2s_ease-out] bg-gray-50/30 dark:bg-surface-dark transition-all">
                <div className="flex justify-between items-center mb-6">
                    <h5 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Configurações da Venda</h5>
                </div>
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-900 dark:text-gray-300 uppercase flex items-center gap-2"><Receipt className="w-3 h-3 text-slate-400" /> Taxa Serviço</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400">{serviceFeeType === 'BRL' ? 'R$' : '%'}</span>
                            <input type="number" step="0.01" value={serviceFee || ''} onChange={(e) => setServiceFee(parseFloat(e.target.value) || 0)} className={inputConfigClasses} placeholder="0,00" />
                            {renderToggle(serviceFeeType, () => setServiceFeeType(serviceFeeType === 'BRL' ? 'PERCENT' : 'BRL'))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-900 dark:text-gray-300 uppercase flex items-center gap-2"><Layers className="w-3 h-3 text-slate-400" /> Couvert</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400">{coverChargeType === 'BRL' ? 'R$' : '%'}</span>
                            <input type="number" step="0.01" value={coverCharge || ''} onChange={(e) => setCoverCharge(parseFloat(e.target.value) || 0)} className={inputConfigClasses} placeholder="0,00" />
                            {renderToggle(coverChargeType, () => setCoverChargeType(coverChargeType === 'BRL' ? 'PERCENT' : 'BRL'))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-900 dark:text-gray-300 uppercase flex items-center gap-2"><Percent className="w-3 h-3 text-slate-400" /> Desconto</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400">{discountType === 'BRL' ? 'R$' : '%'}</span>
                            <input type="number" step="0.01" value={discount || ''} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} className={inputConfigClasses} placeholder="0,00" />
                            {renderToggle(discountType, () => setDiscountType(discountType === 'BRL' ? 'PERCENT' : 'BRL'))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-900 dark:text-gray-300 uppercase flex items-center gap-2"><Users className="w-3 h-3 text-slate-400" /> Dividir</label>
                        <div className="relative">
                            {/* Minus Button - Left */}
                            <button 
                                onClick={() => setSplitCount(Math.max(1, splitCount - 1))} 
                                className="absolute left-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-primary text-white shadow-sm hover:bg-red-700 transition-all font-black text-xs min-w-[36px] flex items-center justify-center z-10"
                            >
                                <Minus className="w-3 h-3 stroke-[3]" />
                            </button>

                            {/* Input - Centered */}
                            <input 
                                type="text" 
                                readOnly 
                                value={splitCount} 
                                className={`${inputConfigClasses} text-center !px-12`} 
                            />

                            {/* Plus Button - Right */}
                            <button 
                                onClick={() => setSplitCount(splitCount + 1)} 
                                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-primary text-white shadow-sm hover:bg-red-700 transition-all font-black text-xs min-w-[36px] flex items-center justify-center z-10"
                            >
                                <Plus className="w-3 h-3 stroke-[3]" />
                            </button>
                        </div>
                    </div>
                </div>
                
                <button 
                  onClick={() => setShowExtraOptions(false)}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-red-600 transition-all active:scale-95"
                >
                    Salvar Configurações
                </button>
            </div>
         )}

         <div className="p-8 space-y-4">
            <button 
                onClick={() => setShowExtraOptions(!showExtraOptions)}
                className="flex items-center gap-2 text-[10px] font-black text-primary hover:text-red-700 uppercase tracking-widest transition-colors mb-1 group"
            >
                <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    {showExtraOptions ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </div>
                {showExtraOptions ? 'OCULTAR OPÇÕES' : 'MAIS OPÇÕES DE CHECKOUT'}
            </button>

            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <span className={summaryLabelClass}>SUBTOTAL</span>
                    <span className={summaryValueClass}>{formatCurrency(subtotal)}</span>
                </div>
                
                {(calculatedServiceFee > 0 || calculatedCoverCharge > 0 || calculatedDiscount > 0 || splitCount > 1) && (
                <div className="space-y-1 pb-1 border-b border-gray-50 dark:border-gray-800 transition-all mb-1">
                    {calculatedServiceFee > 0 && <div className="flex justify-between items-center">
                        <span className={summaryLabelClass}>Taxa de Serviço</span>
                        <span className={summaryValueClass}>+ {formatCurrency(calculatedServiceFee)}</span>
                    </div>}
                    {calculatedCoverCharge > 0 && <div className="flex justify-between items-center">
                        <span className={summaryLabelClass}>Couvert</span>
                        <span className={summaryValueClass}>+ {formatCurrency(calculatedCoverCharge)}</span>
                    </div>}
                    {calculatedDiscount > 0 && <div className="flex justify-between items-center">
                        <span className={`${summaryLabelClass} text-green-500`}>Desconto</span>
                        <span className={`${summaryValueClass} text-green-600`}>- {formatCurrency(calculatedDiscount)}</span>
                    </div>}
                    {splitCount > 1 && <div className="flex justify-between items-center">
                        <span className={summaryLabelClass}>Dividir ({splitCount}x)</span>
                        <span className={summaryValueClass}>{formatCurrency(totalPerPerson)} /pessoa</span>
                    </div>}
                </div>
                )}

                <div className="flex justify-between items-end pt-1">
                    <div className="flex flex-col">
                        <span className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Total Geral</span>
                        {selectedIndices.length > 0 && (
                            <span className="text-[10px] font-bold text-primary mt-1 uppercase tracking-wider">Itens Selecionados: {formatCurrency(selectedSubtotal)}</span>
                        )}
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-black text-primary font-display tracking-tight leading-none">{formatCurrency(finalTotal)}</span>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col gap-3">
                {selectedIndices.length > 0 ? (
                    <div className="flex gap-4 items-center">
                        <button 
                            onClick={() => handleOpenPaymentInternal(true)}
                            className="flex-1 bg-primary text-white font-black py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] hover:bg-red-700 animate-[fadeIn_0.2s]"
                        >
                            <Receipt className="w-6 h-6" />
                            <span className="tracking-tight text-lg uppercase">PAGAR INDIVIDUAL ({formatCurrency(selectedSubtotal)})</span>
                        </button>
                        
                        <button 
                            onClick={handlePrintIndividual}
                            className="p-5 bg-white dark:bg-surface-dark text-primary rounded-2xl hover:bg-primary/5 transition-all active:scale-90 shadow-sm border border-primary"
                            title="Imprimir Cupom Individual"
                        >
                            <Printer className="w-6 h-6" />
                        </button>
                    </div>
                ) : (
                    isTableView && onSaveToTable ? (
                        <div className="space-y-3">
                            <div className="flex gap-4 items-center">
                                <button 
                                    onClick={onSaveToTable}
                                    disabled={cart.length === 0}
                                    className="flex-1 bg-white border-2 border-primary text-primary font-black py-5 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 transition-all active:scale-[0.98] group shadow-sm hover:bg-primary/5"
                                >
                                    <Save className="w-5 h-5" />
                                    <span className="tracking-tight text-base uppercase">LANÇAR NA MESA</span>
                                </button>
                                
                                <button 
                                    onClick={onPrint}
                                    className="p-5 bg-white dark:bg-surface-dark text-primary rounded-2xl hover:bg-primary/5 transition-all active:scale-90 shadow-sm border border-primary"
                                    title="Imprimir Pré-Conta"
                                >
                                    <Printer className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <button 
                                onClick={() => handleOpenPaymentInternal(false)}
                                disabled={cart.length === 0}
                                className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center gap-3 disabled:grayscale disabled:opacity-50 transition-all active:scale-[0.98] hover:bg-red-600"
                            >
                                <CheckCircle className="w-6 h-6" />
                                <span className="tracking-tight text-lg uppercase">ENCERRAR CONTA</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <button 
                                onClick={() => handleOpenPaymentInternal(false)}
                                disabled={cart.length === 0}
                                className="flex-1 bg-primary text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center gap-3 disabled:grayscale disabled:opacity-50 transition-all active:scale-[0.98] group"
                            >
                                <CheckCircle className="w-6 h-6" />
                                <span className="tracking-tight text-base uppercase">FINALIZAR VENDA</span>
                            </button>
                            <button 
                                onClick={onPrint}
                                className="p-5 bg-white dark:bg-surface-dark text-primary rounded-2xl hover:bg-primary/5 transition-all active:scale-90 shadow-sm border border-primary"
                            >
                                <Printer className="w-6 h-6" />
                            </button>
                        </div>
                    )
                )}
            </div>
         </div>
      </div>
    </div>
  );
}
