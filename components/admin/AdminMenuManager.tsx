
import React, { useState, useEffect, useCallback } from 'react';
import { Product } from '../../types';
import { Plus, Search, Edit2, Copy, Trash2, Layers, ImagePlus, AlertTriangle, List } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { formatCurrency } from '../../shared/utils/mathEngine';
import { AdminProductModal } from './menu/AdminProductModal';
import { CategoryManagerModal } from './menu/CategoryManagerModal';

export const AdminMenuManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Estado para Exclusão Forçada
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Função centralizada para recarregar dados
  const loadData = useCallback(() => {
      setProducts(storageService.getProducts() || []);
      setCategories(storageService.getCategories() || []);
  }, []);

  useEffect(() => {
      loadData();
      const handleStorageChange = () => loadData();
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('storage-update', handleStorageChange);
      return () => {
          window.removeEventListener('storage', handleStorageChange);
          window.removeEventListener('storage-update', handleStorageChange);
      };
  }, [loadData]);

  const handleSaveProduct = (savedProduct: Product) => {
    // Atualização Otimista ao Salvar
    setProducts(prev => {
        const safePrev = prev || [];
        const exists = safePrev.find(p => p?.id === savedProduct.id);
        if (exists) return safePrev.map(p => p.id === savedProduct.id ? savedProduct : p);
        return [...safePrev, savedProduct];
    });

    const currentProducts = storageService.getProducts() || []; 
    const updatedProducts = currentProducts.some(p => p.id === savedProduct.id)
        ? currentProducts.map(p => p.id === savedProduct.id ? savedProduct : p)
        : [...currentProducts, savedProduct];
        
    storageService.saveProducts(updatedProducts);
    
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  // --- DELETE LOGIC: OPTIMISTIC UPDATE ---
  const handleDeleteClick = (e: React.MouseEvent, product: Product) => {
      e.preventDefault();
      e.stopPropagation(); 
      e.nativeEvent.stopImmediatePropagation();
      setProductToDelete(product);
  };

  const confirmDelete = () => {
      if (productToDelete) {
          const idToDelete = productToDelete.id;

          // 1. Atualiza Estado Local IMEDIATAMENTE (Otimista)
          setProducts(prev => (prev || []).filter(p => p.id !== idToDelete));

          // 2. Persiste a exclusão no Storage
          storageService.deleteProduct(idToDelete);
          
          // 3. Notifica o sistema
          window.dispatchEvent(new Event('storage-update'));
          
          // 4. Fecha o modal
          setProductToDelete(null);
      }
  };

  const handleDuplicateProduct = (product: Product) => {
      storageService.duplicateProduct(product);
      loadData(); 
  };

  const handleEdit = (product: Product) => {
      setEditingProduct(product);
      setIsProductModalOpen(true);
  };

  const handleNew = (preSelectedCategory?: string) => {
      setEditingProduct({ category: preSelectedCategory || categories[0] || 'Geral' });
      setIsProductModalOpen(true);
  };

  const filteredProducts = (products || []).filter(p => p && p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Lógica de Renderização
  const categoriesToRender = [...(categories || [])];
  const usedCategories = new Set((products || []).map(p => p?.category));
  usedCategories.forEach(cat => {
      if (cat && !categoriesToRender.includes(cat)) {
          categoriesToRender.push(cat);
      }
  });

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out] pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-2">
          <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Gestão de Itens</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Gerencie produtos, preços e categorias.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative group flex-1 md:w-[320px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-[#EA2831] transition-colors" />
                  <input 
                      type="text" 
                      placeholder="Buscar item..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#EA2831] outline-none transition-all"
                  />
              </div>
              
              <button 
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="bg-white dark:bg-surface-dark border border-[#EA1D2C] text-slate-700 dark:text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow-sm active:scale-95 flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/10 group"
                  title="Gerenciar Categorias"
              >
                  <List className="w-4 h-4 text-[#EA1D2C]" />
                  GERENCIAR CATEGORIAS
              </button>

              <button 
                  type="button"
                  onClick={() => handleNew()}
                  className="bg-[#EA2831] hover:bg-red-700 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-500/20 transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap"
              >
                  <Plus className="w-4 h-4 stroke-[3]" /> Novo Item
              </button>
          </div>
      </div>

      {/* LISTA DE CATEGORIAS */}
      <div className="space-y-10">
          {categoriesToRender.map(category => {
              const catProducts = filteredProducts.filter(p => p?.category === category);
              
              return (
                  <div key={category} className="space-y-4 animate-[fadeIn_0.3s]">
                      <div className="flex items-center justify-between px-2">
                          <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-3">
                              <span className="w-2 h-8 bg-[#EA2831] rounded-full"></span>
                              {category}
                          </h4>
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${catProducts.length > 0 ? 'bg-gray-100 dark:bg-gray-800 text-slate-500' : 'bg-red-50 text-red-400'}`}>
                              {catProducts.length} itens
                          </span>
                      </div>
                      
                      {catProducts.length > 0 ? (
                          <div className="grid grid-cols-1 gap-4">
                              {catProducts.map(product => {
                                  // --- SAFE RENDERING CHECK ---
                                  if (!product) return null;

                                  return (
                                      <div 
                                        key={product.id} 
                                        onClick={() => handleEdit(product)}
                                        className={`relative bg-white dark:bg-surface-dark rounded-[24px] border transition-all duration-200 flex items-center p-4 cursor-pointer group hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-700 ${!product.available ? 'border-gray-100 dark:border-gray-800 opacity-80 bg-gray-50/50' : 'border-gray-100 dark:border-gray-800 shadow-sm'}`}
                                      >
                                          <div className="relative shrink-0">
                                              {product.imageUrl ? (
                                                  <img 
                                                    src={product.imageUrl} 
                                                    alt={product.name} 
                                                    className={`size-20 rounded-[20px] object-cover shadow-sm transition-transform group-hover:scale-105 ${!product.available ? 'grayscale opacity-60' : ''}`} 
                                                  />
                                              ) : (
                                                  <div className="size-20 rounded-[20px] bg-gray-100 flex items-center justify-center text-slate-300">
                                                      <ImagePlus className="w-8 h-8" />
                                                  </div>
                                              )}
                                          </div>
                                          
                                          <div className="flex-1 flex flex-col justify-center px-6 min-w-0">
                                              <div className="flex items-center gap-2 mb-1">
                                                  <span className={`font-black text-base truncate ${product.available ? 'text-slate-900 dark:text-white' : 'text-slate-400 line-through decoration-2 decoration-slate-300'}`}>
                                                      {product.name}
                                                  </span>
                                              </div>
                                              <p className="text-xs font-medium text-slate-500 dark:text-gray-400 line-clamp-1 mb-1.5">{product.description}</p>
                                              <span className={`text-lg font-black font-display ${product.available ? 'text-slate-900 dark:text-white' : 'text-slate-300'}`}>
                                                  {formatCurrency(product.price || 0)}
                                              </span>
                                          </div>

                                          {/* AÇÕES CRÍTICAS - Isolamento de Eventos */}
                                          <div 
                                            className="flex items-center gap-2 pl-4 border-l border-gray-100 dark:border-gray-800 relative z-50 cursor-default"
                                            onClick={(e) => {
                                                e.preventDefault(); 
                                                e.stopPropagation(); 
                                            }}
                                          >
                                              <button 
                                                  type="button"
                                                  onClick={(e) => { 
                                                      e.stopPropagation();
                                                      handleEdit(product); 
                                                  }}
                                                  className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-slate-400 hover:text-[#EA2831] hover:bg-red-50 transition-colors pointer-events-auto"
                                                  title="Editar"
                                              >
                                                  <Edit2 className="w-4 h-4" />
                                              </button>
                                              <button 
                                                  type="button"
                                                  onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleDuplicateProduct(product);
                                                  }}
                                                  className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors pointer-events-auto"
                                                  title="Duplicar"
                                              >
                                                  <Copy className="w-4 h-4" />
                                              </button>
                                              
                                              {/* BOTÃO DE EXCLUSÃO ROBUSTA */}
                                              <button 
                                                type="button" 
                                                onClick={(e) => handleDeleteClick(e, product)}
                                                className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm active:scale-95 pointer-events-auto"
                                                title="Excluir Produto"
                                                >
                                                <Trash2 className="w-4 h-4" />
                                                </button>
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      ) : (
                          <div 
                            onClick={() => handleNew(category)}
                            className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[24px] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#EA2831] hover:bg-red-50/10 transition-all group"
                          >
                              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full text-slate-400 group-hover:text-[#EA2831] mb-2 transition-colors">
                                  <Plus className="w-6 h-6" />
                              </div>
                              <p className="text-sm font-bold text-slate-500 group-hover:text-[#EA2831] transition-colors">Nenhum produto nesta categoria</p>
                              <p className="text-xs text-slate-400 mt-1">Clique para adicionar um item em <b>{category}</b></p>
                          </div>
                      )}
                  </div>
              );
          })}
          
          {categoriesToRender.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 opacity-50">
                  <Layers className="w-16 h-16 text-slate-300 mb-4" />
                  <p className="text-lg font-bold text-slate-400">Nenhuma categoria criada.</p>
                  <p className="text-sm text-slate-400">Use o botão de camadas acima para começar.</p>
              </div>
          )}
      </div>

      {/* MODAIS */}
      {isProductModalOpen && editingProduct && (
          <AdminProductModal 
              product={editingProduct} 
              onClose={() => setIsProductModalOpen(false)} 
              onSave={handleSaveProduct} 
          />
      )}

      {isCategoryModalOpen && (
          <CategoryManagerModal 
              categories={categories}
              onClose={() => setIsCategoryModalOpen(false)}
              onProductsUpdate={loadData}
          />
      )}

      {/* MODAL CUSTOMIZADO DE EXCLUSÃO (ESTILO CRM) */}
      {productToDelete && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s]">
                <div className="bg-white dark:bg-surface-dark rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-[slideUp_0.3s] text-center border-4 border-red-50 dark:border-red-900/20">
                    <div className="size-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 animate-bounce">
                        <AlertTriangle className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Excluir Permanente?</h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                        Você está prestes a remover <span className="font-bold text-slate-900 dark:text-white">"{productToDelete?.name}"</span> do cardápio. Essa ação não poderá ser desfeita.
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setProductToDelete(null)}
                            className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-sm uppercase tracking-wider transition-all"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={confirmDelete}
                            className="flex-1 py-4 bg-[#EA2831] hover:bg-red-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-red-500/20 transition-all active:scale-95"
                        >
                            Sim, Excluir
                        </button>
                    </div>
                </div>
            </div>
      )}
    </div>
  );
};
