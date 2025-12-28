
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, AlertCircle, CheckCircle, SlidersHorizontal } from 'lucide-react';
import { storageService } from '../../../services/storageService';
import { Product, ProductExtra } from '../../../types';
import { CATEGORIES } from '../../../constants';
import { formatCurrency } from '../../../shared/utils/mathEngine';

export default function MenuEditor() {
  const [products, setProducts] = useState<Product[]>([]);
  const [globalExtras, setGlobalExtras] = useState<ProductExtra[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Controle de quais produtos estão expandidos para edição de adicionais
  const [expandedProducts, setExpandedProducts] = useState<string[]>([]);
  
  // Mapa local de estado para forçar re-render ao mudar toggles aninhados
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const loadData = () => {
      setProducts(storageService.getProducts());
      setGlobalExtras(storageService.getExtras());
  };

  useEffect(() => {
      loadData();
  }, [updateTrigger]);

  const toggleProduct = (id: string) => {
      storageService.toggleProductAvailability(id);
      setUpdateTrigger(prev => prev + 1);
  };

  const toggleProductExtra = (productId: string, extraId: string) => {
      storageService.toggleProductExtraAvailability(productId, extraId);
      setUpdateTrigger(prev => prev + 1);
  };

  const toggleExpand = (productId: string) => {
      setExpandedProducts(prev => 
          prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
      );
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Componente Toggle Switch Reutilizável
  const ToggleSwitch = ({ isOn, onToggle, label, size = 'md' }: { isOn: boolean, onToggle: (e: React.MouseEvent) => void, label?: string, size?: 'sm' | 'md' }) => {
      const hClass = size === 'sm' ? 'h-6 w-10' : 'h-8 w-14';
      const circleClass = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
      const translateClass = size === 'sm' ? 'translate-x-5' : 'translate-x-7';
      const translateBase = 'translate-x-1';

      return (
        <button 
            onClick={(e) => { e.stopPropagation(); onToggle(e); }}
            className={`relative inline-flex items-center rounded-full transition-colors focus:outline-none ${hClass} ${isOn ? 'bg-[#EA2831]' : 'bg-slate-200'}`}
        >
            <span className="sr-only">{label || 'Toggle'}</span>
            <span 
                className={`inline-block transform bg-white rounded-full transition-transform shadow-sm ${circleClass} ${isOn ? translateClass : translateBase}`}
            />
        </button>
      );
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Gerenciar Cardápio</h3>
          <p className="text-slate-500 font-medium">Controle a disponibilidade e personalize adicionais por produto.</p>
        </div>
        
        <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
            <input 
                type="text" 
                placeholder="Buscar produto..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            />
        </div>
      </div>
      
      {/* Lista de Produtos Organizada Hierarquicamente */}
      <div className="space-y-10">
          {CATEGORIES.map(category => {
              const catProducts = filteredProducts.filter(p => p.category === category);
              if (catProducts.length === 0) return null;

              return (
                  <div key={category} className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                          <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-3">
                              <span className="w-2 h-8 bg-primary rounded-full"></span>
                              {category}
                          </h4>
                          <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg text-xs font-bold text-slate-500">
                              {catProducts.length} itens
                          </span>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                          {catProducts.map(product => {
                              const isExpanded = expandedProducts.includes(product.id);
                              
                              return (
                                  <div key={product.id} className={`bg-white dark:bg-surface-dark rounded-[24px] border transition-all duration-300 overflow-hidden ${!product.available ? 'border-gray-100 dark:border-gray-800 opacity-90' : 'border-gray-200 dark:border-gray-700 shadow-sm'}`}>
                                      
                                      {/* Product Header Card */}
                                      <div 
                                        className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                                        onClick={() => toggleExpand(product.id)}
                                      >
                                          <div className="flex items-center gap-6">
                                              <div className="relative shrink-0">
                                                  <img 
                                                    src={product.imageUrl} 
                                                    alt={product.name} 
                                                    className={`size-24 rounded-2xl object-cover shadow-md transition-all ${!product.available ? 'grayscale opacity-60' : ''}`} 
                                                  />
                                                  {!product.available && (
                                                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl backdrop-blur-[1px]">
                                                          <div className="bg-white/90 p-1.5 rounded-full shadow-sm"><AlertCircle className="w-5 h-5 text-slate-500" /></div>
                                                      </div>
                                                  )}
                                              </div>
                                              
                                              <div className="flex flex-col gap-1">
                                                  <span className={`font-black text-lg transition-colors leading-tight ${product.available ? 'text-slate-900 dark:text-white' : 'text-slate-400 line-through decoration-2 decoration-slate-300'}`}>
                                                      {product.name}
                                                  </span>
                                                  <span className={`text-sm font-medium line-clamp-1 ${product.available ? 'text-slate-500' : 'text-slate-300'}`}>
                                                      {product.description}
                                                  </span>
                                                  <span className={`text-2xl font-black mt-1 font-display ${product.available ? 'text-slate-900 dark:text-white' : 'text-slate-300'}`}>
                                                      {formatCurrency(product.price)}
                                                  </span>
                                              </div>
                                          </div>

                                          <div className="flex items-center gap-6 pl-4 border-l border-gray-100 dark:border-gray-800 h-16">
                                              <div className="flex flex-col items-center gap-1">
                                                  <span className={`text-[10px] font-black uppercase tracking-widest ${product.available ? 'text-primary' : 'text-slate-300'}`}>
                                                      {product.available ? 'Disponível' : 'Esgotado'}
                                                  </span>
                                                  <ToggleSwitch isOn={!!product.available} onToggle={() => toggleProduct(product.id)} />
                                              </div>
                                              
                                              <div className={`p-2 rounded-full transition-all ${isExpanded ? 'bg-primary text-white rotate-180' : 'bg-gray-100 dark:bg-gray-800 text-slate-400 hover:text-primary'}`}>
                                                  <ChevronDown className="w-6 h-6" />
                                              </div>
                                          </div>
                                      </div>

                                      {/* Expanded Area - Extras Manager */}
                                      {isExpanded && (
                                          <div className="bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800 p-6 animate-[slideDown_0.2s_ease-out]">
                                              <div className="flex items-center gap-2 mb-4">
                                                  <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                                                  <h5 className="text-xs font-black text-slate-500 uppercase tracking-widest">Gestão de Adicionais para este item</h5>
                                              </div>
                                              
                                              {globalExtras.length > 0 ? (
                                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                      {globalExtras.map(extra => {
                                                          const isAvailableForThis = storageService.isExtraAvailableForProduct(product.id, extra.id);
                                                          return (
                                                              <div 
                                                                key={extra.id} 
                                                                className={`flex items-center justify-between p-3 rounded-xl border bg-white dark:bg-surface-dark transition-all ${isAvailableForThis ? 'border-gray-200 dark:border-gray-700 shadow-sm' : 'border-transparent opacity-60 grayscale'}`}
                                                              >
                                                                  <div className="flex flex-col">
                                                                      <span className="font-bold text-sm text-slate-800 dark:text-white">{extra.name}</span>
                                                                      <span className="text-xs font-bold text-slate-400">+ {formatCurrency(extra.price)}</span>
                                                                  </div>
                                                                  <ToggleSwitch 
                                                                    size="sm"
                                                                    isOn={isAvailableForThis} 
                                                                    onToggle={() => toggleProductExtra(product.id, extra.id)} 
                                                                  />
                                                              </div>
                                                          );
                                                      })}
                                                  </div>
                                              ) : (
                                                  <p className="text-sm text-slate-400 italic pl-6">Nenhum adicional configurado no sistema.</p>
                                              )}
                                          </div>
                                      )}
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              );
          })}
      </div>
    </div>
  );
}