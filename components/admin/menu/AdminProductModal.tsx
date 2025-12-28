
import React, { useState, useEffect } from 'react';
import { Save, X, ImagePlus, Wand2, ChefHat, Clock, AlertCircle, CheckCircle, List, Plus, Layers, CheckSquare, Loader2 } from 'lucide-react';
import { Product, ProductExtra } from '../../../types';
import { generateDishDescription, generateDishImage } from '../../../services/geminiService';
import { BaseModal } from '../../ui/BaseModal';
import { storageService } from '../../../services/storageService';
import { formatCurrency } from '../../../shared/utils/mathEngine';

interface AdminProductModalProps {
    product: Partial<Product>;
    onClose: () => void;
    onSave: (product: Product) => void;
}

export const AdminProductModal: React.FC<AdminProductModalProps> = ({ product, onClose, onSave }) => {
    const [activeTab, setActiveTab] = useState<'BASIC' | 'KITCHEN' | 'EXTRAS'>('BASIC');
    const [categories, setCategories] = useState<string[]>([]);
    
    // Form Data
    const [formData, setFormData] = useState<Partial<Product>>({
        id: product.id || Math.random().toString(36).substr(2, 9),
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        category: product.category || 'Individual',
        imageUrl: product.imageUrl || '',
        available: product.available !== false,
        needsPreparation: product.needsPreparation !== false,
        prepTime: product.prepTime || 15
    });

    // Extras State
    const [allExtras, setAllExtras] = useState<ProductExtra[]>([]);
    const [enabledExtras, setEnabledExtras] = useState<string[]>([]); // Extras enabled for THIS product

    useEffect(() => {
        setCategories(storageService.getCategories()); // Load dynamic categories
        
        const extras = storageService.getExtras();
        setAllExtras(extras);

        if (product.id) {
            // Check which extras are enabled for this product
            const enabled = extras.filter(e => storageService.isExtraAvailableForProduct(product.id!, e.id)).map(e => e.id);
            setEnabledExtras(enabled);
        } else {
            // New product: enable all global extras by default
            setEnabledExtras(extras.map(e => e.id));
        }
    }, [product.id]);

    const [aiLoading, setAiLoading] = useState<'NONE' | 'DESC' | 'IMAGE'>('NONE');

    const handleGenerateDesc = async () => {
        if (!formData.name) return;
        try {
            setAiLoading('DESC');
            const desc = await generateDishDescription(formData.name, "ingredientes frescos");
            setFormData(prev => ({ ...prev, description: desc }));
        } catch (error) {
            console.error("Erro na geração de descrição:", error);
        } finally {
            setAiLoading('NONE');
        }
    };

    const handleGenerateImage = async () => {
        if (!formData.name) return;
        try {
            setAiLoading('IMAGE');
            const img = await generateDishImage(formData.name);
            if (img) setFormData(prev => ({ ...prev, imageUrl: img }));
        } catch (error) {
            console.error("Erro na geração de imagem:", error);
        } finally {
            setAiLoading('NONE');
        }
    };

    const handleSave = () => {
        if (!formData.name || !formData.price) {
            alert('Nome e Preço são obrigatórios');
            return;
        }
        
        // Save Extras Linking
        if (formData.id) {
            allExtras.forEach(extra => {
                const isEnabled = enabledExtras.includes(extra.id);
                const currentStatus = storageService.isExtraAvailableForProduct(formData.id!, extra.id);
                // Sync state if different
                if (currentStatus !== isEnabled) {
                    storageService.toggleProductExtraAvailability(formData.id!, extra.id);
                }
            });
        }

        // Construct final product with safety defaults
        const finalProduct: Product = {
            id: formData.id!,
            name: formData.name,
            price: formData.price,
            description: formData.description || '',
            category: formData.category || 'Geral',
            imageUrl: formData.imageUrl || '',
            available: formData.available,
            needsPreparation: formData.needsPreparation,
            prepTime: formData.prepTime
        };

        onSave(finalProduct);
    };

    const toggleExtraForProduct = (extraId: string) => {
        setEnabledExtras(prev => 
            prev.includes(extraId) ? prev.filter(id => id !== extraId) : [...prev, extraId]
        );
    };

    return (
        <BaseModal onClose={onClose} className="max-w-4xl w-full h-[90vh]" hideCloseButton={true}>
            <div className="flex flex-col h-full bg-white dark:bg-surface-dark rounded-[32px] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {product.id ? 'Editar Produto' : 'Novo Item'}
                        </h2>
                        <p className="text-sm font-bold text-slate-400">Gerenciamento completo do item</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl hover:text-red-500 transition-colors"><X className="w-6 h-6" /></button>
                </div>

                {/* Tabs */}
                <div className="px-8 pt-4 border-b border-gray-100 dark:border-gray-800 flex gap-6">
                    <button onClick={() => setActiveTab('BASIC')} className={`pb-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'BASIC' ? 'text-[#EA2831] border-[#EA2831]' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>Dados Básicos</button>
                    <button onClick={() => setActiveTab('KITCHEN')} className={`pb-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'KITCHEN' ? 'text-[#EA2831] border-[#EA2831]' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>Logística & Cozinha</button>
                    <button onClick={() => setActiveTab('EXTRAS')} className={`pb-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'EXTRAS' ? 'text-[#EA2831] border-[#EA2831]' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>Complementos</button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-gray-50/50 dark:bg-black/20">
                    
                    {/* TAB: BASIC */}
                    {activeTab === 'BASIC' && (
                        <div className="flex flex-col lg:flex-row gap-10 animate-[fadeIn_0.3s]">
                            <div className="w-full lg:w-1/3 flex flex-col gap-4">
                                <div className="aspect-[4/3] w-full bg-white dark:bg-gray-800 rounded-3xl overflow-hidden relative group border-2 border-dashed border-gray-200 dark:border-gray-700 shadow-sm">
                                    {formData.imageUrl ? (
                                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                            <ImagePlus className="w-12 h-12 opacity-50 mb-2" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Sem Imagem</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button 
                                            onClick={handleGenerateImage} 
                                            disabled={aiLoading === 'IMAGE'} 
                                            className="bg-white text-slate-900 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
                                        >
                                            {aiLoading === 'IMAGE' ? <Loader2 className="w-4 h-4 text-[#EA2831] animate-spin" /> : <Wand2 className="w-4 h-4 text-[#EA2831]" />}
                                            {aiLoading === 'IMAGE' ? 'Gerando...' : 'IA'}
                                        </button>
                                    </div>
                                </div>
                                <input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full p-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#EA2831] shadow-sm" placeholder="URL da Imagem..." />
                            </div>

                            <div className="flex-1 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome</label>
                                        <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-none rounded-xl font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-[#EA2831] shadow-sm" placeholder="Ex: X-Bacon" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Preço (R$)</label>
                                        <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-none rounded-xl font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-[#EA2831] shadow-sm" placeholder="0.00" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descrição</label>
                                        <button 
                                            onClick={handleGenerateDesc} 
                                            disabled={!formData.name || aiLoading === 'DESC'} 
                                            className="text-[10px] font-bold text-[#EA2831] hover:underline flex items-center gap-1 disabled:opacity-50"
                                        >
                                            {aiLoading === 'DESC' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                            {aiLoading === 'DESC' ? 'Gerando...' : 'IA'}
                                        </button>
                                    </div>
                                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 bg-white dark:bg-gray-800 border-none rounded-2xl font-medium text-sm text-slate-600 dark:text-gray-300 focus:ring-2 focus:ring-[#EA2831] h-28 resize-none shadow-sm" placeholder="Descreva o item..." />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {categories.map(cat => (
                                            <button key={cat} onClick={() => setFormData({...formData, category: cat})} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 shadow-sm ${formData.category === cat ? 'border-[#EA2831] bg-red-50 text-[#EA2831]' : 'border-transparent bg-white text-slate-500 hover:border-gray-200'}`}>
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: KITCHEN */}
                    {activeTab === 'KITCHEN' && (
                        <div className="space-y-6 max-w-xl mx-auto animate-[fadeIn_0.3s]">
                            <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><ChefHat className="w-4 h-4 text-orange-500" /> Necessita Preparo?</span>
                                        <span className="text-[10px] text-slate-500 font-medium mt-1">Envia para tela da cozinha (KDS)</span>
                                    </div>
                                    <button onClick={() => setFormData({...formData, needsPreparation: !formData.needsPreparation})} className={`w-14 h-8 rounded-full p-1 transition-colors ${formData.needsPreparation ? 'bg-orange-500' : 'bg-gray-300'}`}>
                                        <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${formData.needsPreparation ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>

                                {formData.needsPreparation && (
                                    <div className="pt-4 border-t border-dashed border-gray-100 dark:border-gray-800">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Tempo Médio de Preparo (min)</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input type="number" value={formData.prepTime} onChange={e => setFormData({...formData, prepTime: parseInt(e.target.value)})} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        {formData.available ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                                        Status no Cardápio
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-medium mt-1">Controla a visibilidade para o cliente</span>
                                </div>
                                <button onClick={() => setFormData({...formData, available: !formData.available})} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wide transition-colors ${formData.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                    {formData.available ? 'Disponível' : 'Esgotado'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* TAB: EXTRAS */}
                    {activeTab === 'EXTRAS' && (
                        <div className="animate-[fadeIn_0.3s]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-[#EA2831]" /> Adicionais Disponíveis
                                </h3>
                                <button className="text-xs font-bold text-[#EA2831] bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Gerenciar Grupos
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {allExtras.map(extra => {
                                    const isEnabled = enabledExtras.includes(extra.id);
                                    return (
                                        <div 
                                            key={extra.id}
                                            onClick={() => toggleExtraForProduct(extra.id)}
                                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${isEnabled ? 'bg-white border-[#EA2831] shadow-md' : 'bg-gray-100 border-transparent opacity-60 hover:opacity-80'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`size-6 rounded-md border-2 flex items-center justify-center ${isEnabled ? 'bg-[#EA2831] border-[#EA2831] text-white' : 'border-slate-400'}`}>
                                                    {isEnabled && <CheckSquare className="w-4 h-4" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm text-slate-900 dark:text-white">{extra.name}</span>
                                                    <span className="text-[10px] font-bold text-slate-400">Adicional Individual</span>
                                                </div>
                                            </div>
                                            <span className="text-sm font-black text-slate-900 dark:text-white">+ {formatCurrency(extra.price)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {allExtras.length === 0 && (
                                <div className="text-center py-10 text-slate-400 font-bold text-sm bg-white rounded-3xl border border-dashed border-gray-200">
                                    Nenhum adicional cadastrado no sistema.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark shrink-0">
                    <button 
                        onClick={handleSave}
                        className="w-full bg-[#EA2831] hover:bg-red-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-red-500/20 uppercase text-sm tracking-[0.2em] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        <Save className="w-5 h-5" /> Salvar Alterações
                    </button>
                </div>
            </div>
        </BaseModal>
    );
};
