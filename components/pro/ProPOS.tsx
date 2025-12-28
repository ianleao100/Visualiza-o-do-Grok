
import React, { useState } from 'react';
import { Search, ChevronLeft, ShoppingCart, User, Hash, Plus, Minus, Trash2, CheckCircle, LayoutGrid, List, X, Info, Layers, MoreHorizontal, Percent, Users, Receipt } from 'lucide-react';
import { INITIAL_PRODUCTS, CATEGORIES } from '../../constants';
import { Product, CartItem } from '../../types';

interface ProPOSProps {
  onBack: () => void;
}

type LayoutType = 'GRID' | 'LIST';

const POS_EXTRAS = [
    { id: 'bacon', name: 'Bacon Crocante', price: 4.00 },
    { id: 'cheese', name: 'Queijo Cheddar Extra', price: 3.50 },
    { id: 'sauce', name: 'Molho Especial', price: 2.00 },
];

export default function ProPOS({ onBack }: ProPOSProps) {
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [layout, setLayout] = useState<LayoutType>('LIST');
  
  // Estados para Taxas e Descontos
  const [showExtraOptions, setShowExtraOptions] = useState(false);
  const [serviceFee, setServiceFee] = useState(0); // Taxa de serviço fixa ou %
  const [coverCharge, setCoverCharge] = useState(0); // Couvert
  const [discount, setDiscount] = useState(0); // Desconto fixo
  const [splitCount, setSplitCount] = useState(1); // Divisão de conta

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [orderNotes, setOrderNotes] = useState('');

  const filteredProducts = products.filter(p => 
    (activeCategory === 'ALL' || p.category === activeCategory) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenProductModal = (product: Product) => {
    setSelectedProduct(product);
    setModalQuantity(1);
    setSelectedExtras([]);
    setOrderNotes('');
  };

  const toggleExtra = (extraId: string) => {
    setSelectedExtras(prev => 
      prev.includes(extraId) ? prev.filter(id => id !== extraId) : [...prev, extraId]
    );
  };

  const handleAddToCartFromModal = () => {
    if (!selectedProduct) return;

    const extrasDetails = POS_EXTRAS.filter(e => selectedExtras.includes(e.id));
    const extrasTotal = extrasDetails.reduce((sum, e) => sum + e.price, 0);
    const finalUnitPrice = selectedProduct.price + extrasTotal;

    const itemToAdd: CartItem = {
      ...selectedProduct,
      price: finalUnitPrice,
      quantity: modalQuantity,
      selectedExtras: extrasDetails,
      notes: orderNotes
    };

    setCart(prev => {
      const existingIdx = prev.findIndex(item => 
        item.id === itemToAdd.id && 
        JSON.stringify(item.selectedExtras) === JSON.stringify(itemToAdd.selectedExtras) &&
        item.notes === itemToAdd.notes
      );

      if (existingIdx > -1) {
        const newCart = [...prev];
        newCart[existingIdx].quantity += itemToAdd.quantity;
        return newCart;
      }
      return [...prev, itemToAdd];
    });

    setSelectedProduct(null);
  };

  const updateQty = (idx: number, delta: number) => {
    setCart(prev => {
      const newCart = prev.map((item, i) => {
        if (i === idx) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
      return newCart;
    });
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalTotal = subtotal + serviceFee + coverCharge - discount;
  const totalPerPerson = finalTotal / (splitCount || 1);

  return (
    <div className="fixed inset-0 z-[100] bg-[#f8f6f6] dark:bg-background-dark flex animate-[fadeIn_0.2s_ease-out] font-display">
      
      {/* Lado Esquerdo - Seleção de Produtos */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200 dark:border-gray-800">
        
        {/* Header PDV */}
        <header className="h-24 bg-white dark:bg-surface-dark px-10 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-primary hover:text-white transition-all">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Venda Rápida</h1>
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">PDV Administrativo</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative w-72 group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                placeholder="Pesquisar produto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-slate-900 dark:text-white transition-all shadow-sm"
              />
            </div>

            <div className="flex bg-gray-50 dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700">
                <button 
                    onClick={() => setLayout('GRID')}
                    className={`p-2.5 rounded-xl transition-all ${layout === 'GRID' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Layout em Grade"
                >
                    <LayoutGrid className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => setLayout('LIST')}
                    className={`p-2.5 rounded-xl transition-all ${layout === 'LIST' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Layout em Lista"
                >
                    <List className="w-5 h-5" />
                </button>
            </div>
          </div>
        </header>

        {/* Categorias - Botões Menores Sem Sombra */}
        <div className="px-10 py-4 flex items-center gap-3 overflow-x-auto no-scrollbar shrink-0 border-b border-gray-50 dark:border-gray-800/50">
           <button 
              onClick={() => setActiveCategory('ALL')}
              className={`px-5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                activeCategory === 'ALL' 
                ? 'bg-primary text-white scale-105' 
                : 'bg-white dark:bg-surface-dark text-slate-400 border border-gray-100 dark:border-gray-800'
              }`}
           >
             TODOS
           </button>
           {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                  activeCategory === cat 
                  ? 'bg-primary text-white scale-105' 
                  : 'bg-white dark:bg-surface-dark text-slate-400 border border-gray-100 dark:border-gray-800'
                }`}
              >
                {cat.toUpperCase()}
              </button>
           ))}
        </div>

        {/* Lista de Produtos com Títulos de Categoria */}
        <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
          {layout === 'GRID' ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div 
                  key={product.id}
                  onClick={() => handleOpenProductModal(product)}
                  className="bg-white dark:bg-surface-dark p-4 rounded-[32px] shadow-sm hover:shadow-2xl hover:scale-[1.03] transition-all border border-gray-50 dark:border-gray-800 cursor-pointer flex flex-col group"
                >
                  <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden mb-4">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-surface-dark/90 px-3 py-1.5 rounded-xl text-xs font-black text-primary shadow-sm">
                      R$ {product.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 px-1">
                    <h3 className="font-black text-slate-900 dark:text-white leading-tight mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-[11px] text-slate-400 font-medium line-clamp-2 leading-relaxed">{product.description}</p>
                    <div className="mt-auto pt-4 flex justify-end">
                       <div className="size-10 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                          <Plus className="w-5 h-5" />
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-10 max-w-4xl mx-auto">
              {CATEGORIES.map(cat => {
                if (activeCategory !== 'ALL' && activeCategory !== cat) return null;
                const catProducts = filteredProducts.filter(p => p.category === cat);
                if (catProducts.length === 0) return null;

                return (
                  <div key={cat} className="space-y-6">
                    <div className="flex items-center gap-3 px-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                       <Layers className="w-5 h-5 text-primary" />
                       <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">{cat}</h2>
                    </div>
                    <div className="flex flex-col gap-4">
                      {catProducts.map(product => (
                        <div 
                          key={product.id} 
                          onClick={() => handleOpenProductModal(product)} 
                          className="flex items-stretch justify-between gap-6 rounded-[24px] bg-white dark:bg-surface-dark p-4 shadow-sm hover:shadow-xl hover:scale-[1.01] border border-transparent dark:border-gray-800 cursor-pointer active:scale-[0.99] transition-all group"
                        >
                            <div className="flex flex-col justify-between flex-1 py-1">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-slate-900 dark:text-white text-lg font-black leading-tight tracking-tight group-hover:text-primary transition-colors">{product.name}</h3>
                                    </div>
                                    <p className="text-slate-500 dark:text-gray-400 text-sm font-medium leading-relaxed line-clamp-2">{product.description}</p>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-slate-900 dark:text-white text-xl font-black tracking-tight font-display">R$ {product.price.toFixed(2)}</p>
                                    <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Plus className="w-4 h-4" />
                                        Customizar
                                    </div>
                                </div>
                            </div>
                            <div className="relative w-32 h-32 shrink-0">
                                <div className="w-full h-full bg-center bg-cover rounded-2xl shadow-md group-hover:scale-105 transition-transform duration-500" style={{backgroundImage: `url('${product.imageUrl}')`}}></div>
                                <div className="absolute -bottom-2 -right-2 bg-primary text-white p-1.5 rounded-xl shadow-lg shadow-primary/30 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                                    <Plus className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Lado Direito - Carrinho & Checkout */}
      <div className="w-[480px] bg-white dark:bg-surface-dark flex flex-col shrink-0 shadow-[-20px_0_40px_rgba(0,0,0,0.02)] z-10 border-l border-gray-100 dark:border-gray-800">
        
        {/* Info Cliente / Mesa */}
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 space-y-4">
           <div className="flex items-center gap-4 group">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-slate-400 group-focus-within:bg-primary/10 group-focus-within:text-primary transition-all"><User className="w-5 h-5" /></div>
              <input 
                type="text" 
                placeholder="Nome do Cliente"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="flex-1 bg-transparent border-none font-bold text-lg text-slate-900 dark:text-white focus:ring-0 placeholder:text-slate-300"
              />
           </div>
           <div className="flex items-center gap-4 group">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-slate-400 group-focus-within:bg-primary/10 group-focus-within:text-primary transition-all"><Hash className="w-5 h-5" /></div>
              <input 
                type="text" 
                placeholder="Número da Mesa"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="flex-1 bg-transparent border-none font-bold text-lg text-slate-900 dark:text-white focus:ring-0 placeholder:text-slate-300"
              />
           </div>
        </div>

        {/* Itens do Carrinho */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-6 text-slate-300 animate-[fadeIn_0.5s]">
               <div className="size-24 bg-gray-50 dark:bg-gray-800/50 rounded-[40px] flex items-center justify-center border border-gray-100 dark:border-gray-800">
                  <ShoppingCart className="w-10 h-10 opacity-10" />
               </div>
               <p className="font-black text-sm uppercase tracking-[0.2em] opacity-30">Seu carrinho está vazio</p>
            </div>
          ) : (
            <div className="space-y-8">
               {cart.map((item, idx) => (
                 <div key={`${item.id}-${idx}`} className="flex flex-col gap-4 group animate-[slideIn_0.2s_ease-out] border-b border-gray-50 dark:border-gray-800/50 pb-6 last:border-0 last:pb-0">
                    <div className="flex gap-4">
                      <img src={item.imageUrl} className="size-20 rounded-[24px] object-cover shrink-0 shadow-sm border border-gray-50 dark:border-gray-800" />
                      <div className="flex-1 flex flex-col min-w-0">
                         <div className="flex justify-between items-start">
                            <h4 className="font-black text-slate-900 dark:text-white text-[15px] leading-tight mb-1.5">{item.name}</h4>
                            <button onClick={() => updateQty(idx, -999)} className="p-1 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                         </div>
                         
                         {/* Lista Vertical de Adicionais com Valor Individual */}
                         {item.selectedExtras && item.selectedExtras.length > 0 && (
                            <div className="flex flex-col gap-1 mb-2">
                               {item.selectedExtras.map(extra => (
                                 <div key={extra.id} className="flex justify-between items-center text-[11px] font-bold text-slate-400 dark:text-gray-500">
                                    <span>+ {extra.name}</span>
                                    <span className="text-primary/70">R$ {extra.price.toFixed(2)}</span>
                                 </div>
                               ))}
                            </div>
                         )}

                         {/* Observações */}
                         {item.notes && (
                            <div className="flex items-center gap-2 text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/20 w-fit px-2.5 py-1 rounded-xl mb-3 border border-orange-100 dark:border-orange-900/30">
                               <Info className="w-3 h-3 shrink-0" />
                               <span className="line-clamp-1 italic">{item.notes}</span>
                            </div>
                         )}
                      </div>
                    </div>

                    {/* Controles de Quantidade Horizontais e Preço do Item */}
                    <div className="flex items-center justify-between pl-24">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total do Item</span>
                          <span className="text-sm font-black text-primary font-display">R$ {(item.price * item.quantity).toFixed(2)}</span>
                       </div>
                       
                       <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-1.5 flex items-center gap-4 border border-gray-100 dark:border-gray-700">
                          <button 
                            onClick={() => updateQty(idx, -1)} 
                            className="size-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center text-slate-400 shadow-sm hover:text-red-500 transition-all"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-base font-black w-6 text-center text-slate-900 dark:text-white">{item.quantity}</span>
                          <button 
                            onClick={() => updateQty(idx, 1)} 
                            className="size-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center text-primary shadow-sm hover:scale-110 transition-all"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>

        {/* Rodapé Checkout - Refatorado com Opções Extras */}
        <div className="p-8 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 space-y-6">
           {/* ... (Previous Checkout options code remains mostly the same, ensuring compatibility) ... */}
           {/* Botão Discreto de Opções Extras */}
           <div className="relative">
             <button 
               onClick={() => setShowExtraOptions(!showExtraOptions)}
               className="flex items-center gap-2 text-[11px] font-black text-slate-400 hover:text-primary uppercase tracking-widest transition-colors mb-2 group"
             >
                <div className="p-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg group-hover:bg-primary/10 transition-colors">
                  <Plus className="w-3 h-3" />
                </div>
                {showExtraOptions ? 'OCULTAR OPÇÕES' : 'MAIS OPÇÕES DE CHECKOUT'}
             </button>

             {/* Painel de Opções Extras (Modal Flutuante Discreto) */}
             {showExtraOptions && (
               <div className="absolute bottom-full left-0 w-full mb-4 p-6 bg-white dark:bg-surface-dark rounded-[32px] shadow-2xl border border-gray-100 dark:border-gray-800 animate-[slideUp_0.2s_ease-out] z-20 space-y-6">
                 <div className="flex justify-between items-center mb-2">
                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Configurações da Venda</h5>
                    <button onClick={() => setShowExtraOptions(false)} className="text-slate-300 hover:text-red-500"><X className="w-5 h-5" /></button>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    {/* Taxa de Serviço */}
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2"><Receipt className="w-3 h-3" /> Taxa Serviço</label>
                       <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400">R$</span>
                          <input 
                            type="number" 
                            step="0.01" 
                            value={serviceFee || ''} 
                            onChange={(e) => setServiceFee(parseFloat(e.target.value) || 0)}
                            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-1 focus:ring-primary text-sm font-black"
                            placeholder="0,00"
                          />
                       </div>
                    </div>

                    {/* Couvert */}
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2"><Layers className="w-3 h-3" /> Couvert</label>
                       <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400">R$</span>
                          <input 
                            type="number" 
                            step="0.01" 
                            value={coverCharge || ''} 
                            onChange={(e) => setCoverCharge(parseFloat(e.target.value) || 0)}
                            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-1 focus:ring-primary text-sm font-black"
                            placeholder="0,00"
                          />
                       </div>
                    </div>

                    {/* Desconto */}
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2"><Percent className="w-3 h-3" /> Desconto</label>
                       <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400">R$</span>
                          <input 
                            type="number" 
                            step="0.01" 
                            value={discount || ''} 
                            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-1 focus:ring-primary text-sm font-black text-green-500"
                            placeholder="0,00"
                          />
                       </div>
                    </div>

                    {/* Dividir Conta */}
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2"><Users className="w-3 h-3" /> Dividir por</label>
                       <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl p-1 px-3 h-[42px]">
                          <button onClick={() => setSplitCount(Math.max(1, splitCount - 1))} className="text-slate-400 hover:text-primary"><Minus className="w-4 h-4" /></button>
                          <span className="flex-1 text-center font-black text-sm">{splitCount}</span>
                          <button onClick={() => setSplitCount(splitCount + 1)} className="text-slate-400 hover:text-primary"><Plus className="w-4 h-4" /></button>
                       </div>
                    </div>
                 </div>

                 {splitCount > 1 && (
                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 text-center">
                       <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Total por Pessoa</p>
                       <p className="text-2xl font-black text-primary tracking-tight">R$ {totalPerPerson.toFixed(2)}</p>
                    </div>
                 )}
               </div>
             )}
           </div>

           <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                 <span>SUBTOTAL</span>
                 <span className="text-slate-600 dark:text-gray-300">R$ {subtotal.toFixed(2)}</span>
              </div>
              
              {(serviceFee > 0 || coverCharge > 0 || discount > 0) && (
                <div className="space-y-1 pb-2 border-b border-gray-50 dark:border-gray-800">
                   {serviceFee > 0 && (
                     <div className="flex justify-between items-center text-[11px] font-bold text-slate-400">
                        <span>Taxa de Serviço</span>
                        <span>+ R$ {serviceFee.toFixed(2)}</span>
                     </div>
                   )}
                   {coverCharge > 0 && (
                     <div className="flex justify-between items-center text-[11px] font-bold text-slate-400">
                        <span>Couvert</span>
                        <span>+ R$ {coverCharge.toFixed(2)}</span>
                     </div>
                   )}
                   {discount > 0 && (
                     <div className="flex justify-between items-center text-[11px] font-bold text-green-500">
                        <span>Desconto</span>
                        <span>- R$ {discount.toFixed(2)}</span>
                     </div>
                   )}
                </div>
              )}

              <div className="flex justify-between items-end pt-2">
                 <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Total Geral</span>
                 <div className="text-right">
                    {splitCount > 1 && (
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{splitCount}x de R$ {totalPerPerson.toFixed(2)}</p>
                    )}
                    <span className="text-4xl font-black text-primary font-display tracking-tight leading-none">R$ {finalTotal.toFixed(2)}</span>
                 </div>
              </div>
           </div>
           
           <button 
              disabled={cart.length === 0}
              className="w-full bg-primary hover:bg-red-600 text-white font-black py-6 rounded-[24px] shadow-2xl shadow-primary/30 flex items-center justify-between px-8 disabled:grayscale disabled:opacity-50 transition-all active:scale-[0.98] group"
           >
              <div className="flex items-center gap-3">
                 <div className="p-1 bg-white/20 rounded-lg">
                    <CheckCircle className="w-6 h-6" />
                 </div>
                 <span className="tracking-tight text-lg uppercase">FINALIZAR VENDA</span>
              </div>
              <ShoppingCart className="w-6 h-6 opacity-40 group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </div>

      {/* Modal de Detalhes do Produto - REDESIGNED */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-[fadeIn_0.3s]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}></div>
          
          <div className="relative w-full max-w-5xl bg-white dark:bg-surface-dark rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-[slideUp_0.3s_ease-out]">
             {/* Lado Esquerdo - Imagem e Info */}
             <div className="w-full md:w-5/12 relative bg-gray-100 dark:bg-gray-800">
                <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-6 left-6 p-3 bg-white/90 dark:bg-surface-dark/90 rounded-2xl shadow-lg hover:bg-primary hover:text-white transition-all text-slate-900 dark:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
             </div>

             {/* Lado Direito - Customização (REDESIGNED) */}
             <div className="w-full md:w-7/12 flex flex-col p-10 max-h-[85vh] overflow-y-auto no-scrollbar">
                <div className="mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
                   <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4">{selectedProduct.name}</h2>
                   <p className="text-slate-600 dark:text-gray-300 font-medium leading-relaxed text-base">{selectedProduct.description}</p>
                </div>

                <div className="space-y-8 flex-1">
                   {/* Adicionais */}
                   <div>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Adicionais Disponíveis
                      </h3>
                      <div className="space-y-3">
                        {POS_EXTRAS.map(extra => (
                          <div 
                            key={extra.id}
                            onClick={() => toggleExtra(extra.id)}
                            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                              selectedExtras.includes(extra.id) 
                              ? 'border-primary bg-primary/5' 
                              : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`size-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                selectedExtras.includes(extra.id) ? 'bg-primary border-primary text-white' : 'border-gray-300'
                              }`}>
                                {selectedExtras.includes(extra.id) && <CheckCircle className="w-4 h-4" />}
                              </div>
                              <span className="font-bold text-base text-slate-800 dark:text-gray-200">{extra.name}</span>
                            </div>
                            <span className="font-black text-primary text-sm">+ R$ {extra.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                   </div>

                   {/* Observações */}
                   <div>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Info className="w-4 h-4" /> Observações do Pedido
                      </h3>
                      <textarea 
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="Ex: Sem cebola, bem passado, etc..."
                        className="w-full p-5 bg-gray-50 dark:bg-gray-800 border-none rounded-[24px] focus:ring-2 focus:ring-primary font-medium text-slate-900 dark:text-white min-h-[100px] resize-none text-base"
                      />
                   </div>
                </div>

                {/* Footer fixo no modal para ação principal */}
                <div className="flex items-center gap-6 pt-8 mt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-[24px] flex items-center gap-4">
                        <button 
                        onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                        className="size-12 bg-white dark:bg-surface-dark rounded-2xl shadow-sm flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
                        >
                        <Minus className="w-5 h-5" />
                        </button>
                        <span className="text-2xl font-black w-8 text-center">{modalQuantity}</span>
                        <button 
                        onClick={() => setModalQuantity(modalQuantity + 1)}
                        className="size-12 bg-white dark:bg-surface-dark rounded-2xl shadow-sm flex items-center justify-center hover:bg-green-50 hover:text-green-500 transition-all"
                        >
                        <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <button 
                    onClick={handleAddToCartFromModal}
                    className="flex-1 bg-primary hover:bg-red-600 text-white font-black h-16 rounded-[24px] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-all active:scale-95 text-lg"
                    >
                        ADICIONAR - R$ {((selectedProduct.price + POS_EXTRAS.filter(e => selectedExtras.includes(e.id)).reduce((s, e) => s + e.price, 0)) * modalQuantity).toFixed(2)}
                    </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
