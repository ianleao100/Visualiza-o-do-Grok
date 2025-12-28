
import React, { useState } from 'react';
import { Plus, Minus, CheckCircle, Info, X } from 'lucide-react';
import { Product, CartItem, ProductExtra } from '../../../types';
import { BaseModal } from '../../ui/BaseModal';
import { formatCurrency } from '../../../shared/utils/mathEngine';

interface ProductSelectionModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  extras: ProductExtra[];
}

export default function ProductSelectionModal({ 
  product, 
  onClose, 
  onAddToCart,
  extras
}: ProductSelectionModalProps) {
  const [modalQuantity, setModalQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [orderNotes, setOrderNotes] = useState('');

  const toggleExtra = (extraId: string) => {
    setSelectedExtras(prev => 
      prev.includes(extraId) ? prev.filter(id => id !== extraId) : [...prev, extraId]
    );
  };

  const handleAdd = () => {
    const extrasDetails = extras.filter(e => selectedExtras.includes(e.id));
    const extrasTotal = extrasDetails.reduce((sum, e) => sum + e.price, 0);
    const finalUnitPrice = product.price + extrasTotal;

    onAddToCart({
        ...product,
        price: finalUnitPrice,
        quantity: modalQuantity,
        selectedExtras: extrasDetails,
        notes: orderNotes
    });
  };

  const currentTotal = (product.price + extras.filter(e => selectedExtras.includes(e.id)).reduce((s, e) => s + e.price, 0)) * modalQuantity;

  return (
    <BaseModal onClose={onClose} className="w-full max-w-5xl h-[85vh]">
      <div className="relative w-full h-full bg-white dark:bg-surface-dark rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row">
         
         {/* Botão Fechar Flutuante (Mobile apenas, no desktop fica no header) */}
         <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-red-500 hover:text-white rounded-full transition-colors md:hidden text-white backdrop-blur-md"
         >
            <X className="w-5 h-5" />
         </button>

         {/* Lado Esquerdo - Imagem e Info */}
         <div className="w-full md:w-5/12 relative bg-gray-100 dark:bg-gray-800 h-48 md:h-auto shrink-0">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden"></div>
            <h2 className="absolute bottom-4 left-4 text-2xl font-black text-white md:hidden leading-tight shadow-sm drop-shadow-md pr-4">{product.name}</h2>
         </div>

         {/* Lado Direito - Customização (Layout Flex Column para Scroll e Footer Fixo) */}
         <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-surface-dark">
            
            {/* Área de Conteúdo com Scroll */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 no-scrollbar">
               {/* Header Desktop */}
               <div className="hidden md:block mb-6 border-b border-gray-100 dark:border-gray-800 pb-6">
                    <div className="flex justify-between items-start mb-2">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{product.name}</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors p-1 bg-gray-50 dark:bg-gray-800 rounded-full"><X className="w-6 h-6" /></button>
                    </div>
                    <p className="text-base text-slate-500 dark:text-gray-400 font-medium leading-relaxed">{product.description}</p>
               </div>
               
               <div className="space-y-8 pb-4">
                   {/* Adicionais - Lista Compacta */}
                   <div>
                      <h3 className="text-[11px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-primary" /> Adicionais
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {extras.map(e => (
                            <div 
                                key={e.id} 
                                onClick={() => toggleExtra(e.id)} 
                                className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-all cursor-pointer ${selectedExtras.includes(e.id) ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`size-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedExtras.includes(e.id) ? 'bg-primary border-primary text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {selectedExtras.includes(e.id) && <CheckCircle className="w-3.5 h-3.5" />}
                                    </div>
                                    <span className="font-bold text-sm text-slate-700 dark:text-gray-200">{e.name}</span>
                                </div>
                                <span className="font-black text-primary text-sm">+ {formatCurrency(e.price)}</span>
                            </div>
                        ))}
                      </div>
                   </div>
                   
                   {/* Observações - Textarea Ajustado */}
                   <div className="w-full">
                      <h3 className="text-[11px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary" /> Observações
                      </h3>
                      <textarea 
                        value={orderNotes} 
                        onChange={(e) => setOrderNotes(e.target.value)} 
                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium text-slate-900 dark:text-white min-h-[100px] resize-none text-sm placeholder:text-gray-400 transition-all block" 
                        placeholder="Ex: Tirar a cebola, ponto da carne..."
                      />
                   </div>
               </div>
            </div>

            {/* Footer Fixo */}
            <div className="p-6 md:p-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark shrink-0 z-10">
                <div className="flex items-center gap-4">
                    {/* Seletor de Quantidade - Reduzido */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-1.5 rounded-2xl flex items-center gap-3 border border-gray-100 dark:border-gray-700">
                        <button 
                            onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))} 
                            className="size-10 bg-white dark:bg-surface-dark rounded-xl flex items-center justify-center hover:text-red-500 shadow-sm transition-colors text-slate-400 disabled:opacity-50"
                            disabled={modalQuantity <= 1}
                        >
                            <Minus className="w-4 h-4 stroke-[3]" />
                        </button>
                        <span className="text-xl font-black w-8 text-center text-slate-900 dark:text-white">{modalQuantity}</span>
                        <button 
                            onClick={() => setModalQuantity(modalQuantity + 1)} 
                            className="size-10 bg-white dark:bg-surface-dark rounded-xl flex items-center justify-center hover:text-green-500 shadow-sm transition-colors text-primary"
                        >
                            <Plus className="w-4 h-4 stroke-[3]" />
                        </button>
                    </div>
                    
                    {/* Botão Adicionar - Elegante */}
                    <button 
                        onClick={handleAdd} 
                        className="flex-1 bg-primary hover:bg-red-600 text-white font-bold h-14 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-between px-8 text-sm group"
                    >
                        <span className="uppercase tracking-widest text-xs font-black">Adicionar</span>
                        <span className="font-black bg-white/20 px-3 py-1 rounded-lg text-sm">
                            {formatCurrency(currentTotal)}
                        </span>
                    </button>
                </div>
            </div>
         </div>
      </div>
    </BaseModal>
  );
}