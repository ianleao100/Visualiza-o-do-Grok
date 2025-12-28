
import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, LayoutGrid, List, Layers, Plus, Trash2, Minus, Info, CheckCircle, ShoppingCart } from 'lucide-react';
import { GLOBAL_EXTRAS } from '../../../constants';
import { Product, CartItem } from '../../../types';
import { storageService } from '../../../services/storageService';
import ProductSelectionModal from './ProductSelectionModal';
import { formatCurrency } from '../../../shared/utils/mathEngine';

interface ProPOSProps {
  onBack: () => void;
}

type LayoutType = 'GRID' | 'LIST';

export default function ProPOS({ onBack }: ProPOSProps) {
  // SOURCE OF TRUTH: Storage + Listeners
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
      const loadData = () => {
          setProducts(storageService.getProducts());
          setCategories(storageService.getCategories());
      };
      
      loadData();

      // Listen for updates (e.g. Menu changes)
      const handleStorageChange = () => loadData();
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Layout State
  const [layout, setLayout] = useState<LayoutType>('LIST');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(p => 
    (activeCategory === 'ALL' || p.category === activeCategory) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
  );

  const renderCategories = [...categories];
  if (!renderCategories.includes('Geral') && products.some(p => p.category === 'Geral')) {
      renderCategories.push('Geral');
  }

  const handleOpenProductModal = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleAddToCartFromModal = (itemToAdd: CartItem) => {
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
    setCart(prev => prev.map((item, i) => i === idx ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(i => i.quantity > 0));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

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
                <button onClick={() => setLayout('GRID')} className={`p-2.5 rounded-xl transition-all ${layout === 'GRID' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid className="w-5 h-5" /></button>
                <button onClick={() => setLayout('LIST')} className={`p-2.5 rounded-xl transition-all ${layout === 'LIST' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><List className="w-5 h-5" /></button>
            </div>
          </div>
        </header>

        {/* Categorias */}
        <div className="px-10 py-4 flex items-center gap-3 overflow-x-auto no-scrollbar shrink-0 border-b border-gray-50 dark:border-gray-800/50">
           <button onClick={() => setActiveCategory('ALL')} className={`px-5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${activeCategory === 'ALL' ? 'bg-primary text-white scale-105' : 'bg-white dark:bg-surface-dark text-slate-400 border border-gray-100 dark:border-gray-800'}`}>TODOS</button>
           {renderCategories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-primary text-white scale-105' : 'bg-white dark:bg-surface-dark text-slate-400 border border-gray-100 dark:border-gray-800'}`}>{cat.toUpperCase()}</button>
           ))}
        </div>

        {/* Lista de Produtos */}
        <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
          {layout === 'GRID' ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} onClick={() => product.available !== false && handleOpenProductModal(product)} className={`bg-white dark:bg-surface-dark p-4 rounded-[32px] shadow-sm transition-all border border-gray-50 dark:border-gray-800 cursor-pointer flex flex-col group ${product.available === false ? 'opacity-60 grayscale' : 'hover:shadow-2xl hover:scale-[1.03]'}`}>
                  <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden mb-4">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    {product.available === false && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center font-black text-white uppercase text-xs tracking-widest">Esgotado</div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-surface-dark/90 px-3 py-1.5 rounded-xl text-xs font-black text-primary shadow-sm">R$ {product.price.toFixed(2)}</div>
                  </div>
                  <div className="flex flex-col flex-1 px-1">
                    <h3 className="font-black text-slate-900 dark:text-white leading-tight mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-[11px] text-slate-400 font-medium line-clamp-2 leading-relaxed">{product.description}</p>
                    <div className="mt-auto pt-4 flex justify-end">
                       <div className="size-10 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all"><Plus className="w-5 h-5" /></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-10 max-w-4xl mx-auto">
              {renderCategories.map(cat => {
                if (activeCategory !== 'ALL' && activeCategory !== cat) return null;
                const catProducts = filteredProducts.filter(p => p.category === cat);
                if (catProducts.length === 0) return null;
                return (
                  <div key={cat} className="space-y-6">
                    <div className="flex items-center gap-3 px-2 border-b border-gray-100 dark:border-gray-800 pb-2"><Layers className="w-5 h-5 text-primary" /><h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">{cat}</h2></div>
                    <div className="flex flex-col gap-4">
                      {catProducts.map(product => (
                        <div key={product.id} onClick={() => product.available !== false && handleOpenProductModal(product)} className={`flex items-stretch justify-between gap-6 rounded-[24px] bg-white dark:bg-surface-dark p-4 shadow-sm transition-all group border border-transparent dark:border-gray-800 cursor-pointer ${product.available === false ? 'opacity-60 grayscale' : 'hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]'}`}>
                            <div className="flex flex-col justify-between flex-1 py-1">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-slate-900 dark:text-white text-lg font-black leading-tight tracking-tight group-hover:text-primary transition-colors">{product.name}</h3>
                                        {product.available === false && <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded font-bold uppercase text-gray-500">Indisponível</span>}
                                    </div>
                                    <p className="text-slate-500 dark:text-gray-400 text-sm font-medium leading-relaxed line-clamp-2">{product.description}</p>
                                </div>
                                <div className="flex items-center justify-between mt-4"><p className="text-slate-900 dark:text-white text-xl font-black tracking-tight font-display">R$ {product.price.toFixed(2)}</p><div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"><Plus className="w-4 h-4" /> Customizar</div></div>
                            </div>
                            <div className="relative w-32 h-32 shrink-0"><div className="w-full h-full bg-center bg-cover rounded-2xl shadow-md group-hover:scale-105 transition-transform duration-500" style={{backgroundImage: `url('${product.imageUrl}')`}}></div><div className="absolute -bottom-2 -right-2 bg-primary text-white p-1.5 rounded-xl shadow-lg shadow-primary/30 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all"><Plus className="w-4 h-4" /></div></div>
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

      {/* Lado Direito - Carrinho & Checkout (Simulação de Placeholder, mas com estrutura para consistência visual) */}
      <div className="w-[480px] bg-white dark:bg-surface-dark flex flex-col shrink-0 shadow-[-20px_0_40px_rgba(0,0,0,0.02)] z-10 border-l border-gray-100 dark:border-gray-800">
         <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-6 text-slate-300">
                    <div className="size-20 bg-gray-50 dark:bg-gray-800/50 rounded-[32px] flex items-center justify-center border border-gray-100 dark:border-gray-800">
                        <ShoppingCart className="w-8 h-8 opacity-10" />
                    </div>
                    <p className="font-black text-[10px] uppercase tracking-[0.3em] opacity-30">Aguardando itens...</p>
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

                                    {item.notes && (
                                        <div className="flex items-start gap-1.5 text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/20 w-full px-2 py-1.5 rounded-lg mb-1.5">
                                            <span className="italic whitespace-pre-wrap break-words leading-relaxed">{item.notes}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pl-24">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total do Item</span>
                                    <span className="text-sm font-black text-primary font-display">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                                
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-1.5 flex items-center gap-4 border border-gray-100 dark:border-gray-700">
                                    <button onClick={() => updateQty(idx, -1)} className="size-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center text-slate-400 shadow-sm hover:text-red-500 transition-all"><Minus className="w-4 h-4" /></button>
                                    <span className="text-base font-black w-6 text-center text-slate-900 dark:text-white">{item.quantity}</span>
                                    <button onClick={() => updateQty(idx, 1)} className="size-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center text-primary shadow-sm hover:scale-110 transition-all"><Plus className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
         </div>
         
         {/* Footer Checkout Mock (Já que o ProPOS admin é mais para testes ou vendas balcão simples) */}
         {cart.length > 0 && (
             <div className="p-8 border-t border-gray-100 dark:border-gray-800">
                 <div className="flex justify-between items-center mb-6">
                     <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total</span>
                     <span className="text-3xl font-black text-primary">{formatCurrency(subtotal)}</span>
                 </div>
                 <button className="w-full bg-primary text-white py-5 rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-red-600 transition-all active:scale-[0.98]">
                     Finalizar Venda
                 </button>
             </div>
         )}
      </div>

      {/* Modal de Detalhes do Produto */}
      {selectedProduct && (
        <ProductSelectionModal 
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCartFromModal}
            extras={GLOBAL_EXTRAS}
        />
      )}
    </div>
  );
}
