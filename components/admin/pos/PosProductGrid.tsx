
import React, { useState } from 'react';
import { LayoutGrid, List, Layers, Plus } from 'lucide-react';
import { Product } from '../../../types';
import { CATEGORIES } from '../../../constants';

interface PosProductGridProps {
    products: Product[];
    search: string;
    activeCategory: string;
    setActiveCategory: (cat: string) => void;
    onSelectProduct: (product: Product) => void;
}

export default function PosProductGrid({
    products,
    search,
    activeCategory,
    setActiveCategory,
    onSelectProduct
}: PosProductGridProps) {
    const [layout, setLayout] = useState<'GRID' | 'LIST'>('LIST');

    const filteredProducts = products.filter(p => 
        (activeCategory === 'ALL' || p.category === activeCategory) &&
        (p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Toolbar */}
            <div className="px-10 py-4 flex items-center justify-between border-b border-gray-50 dark:border-gray-800/50 shrink-0">
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                    <button onClick={() => setActiveCategory('ALL')} className={`px-5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${activeCategory === 'ALL' ? 'bg-primary text-white scale-105' : 'bg-white dark:bg-surface-dark text-slate-400 border border-gray-100 dark:border-gray-800'}`}>TODOS</button>
                    {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-primary text-white scale-105' : 'bg-white dark:bg-surface-dark text-slate-400 border border-gray-100 dark:border-gray-800'}`}>{cat.toUpperCase()}</button>
                    ))}
                </div>
                <div className="flex bg-gray-50 dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 ml-4">
                    <button onClick={() => setLayout('GRID')} className={`p-2.5 rounded-xl transition-all ${layout === 'GRID' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid className="w-5 h-5" /></button>
                    <button onClick={() => setLayout('LIST')} className={`p-2.5 rounded-xl transition-all ${layout === 'LIST' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><List className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Grid/List */}
            <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
                {layout === 'GRID' ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map(product => (
                            <div key={product.id} onClick={() => onSelectProduct(product)} className="bg-white dark:bg-surface-dark p-4 rounded-[32px] shadow-sm hover:shadow-2xl hover:scale-[1.03] transition-all border border-gray-50 dark:border-gray-800 cursor-pointer flex flex-col group">
                                <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden mb-4">
                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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
                        {CATEGORIES.map(cat => {
                            if (activeCategory !== 'ALL' && activeCategory !== cat) return null;
                            const catProducts = filteredProducts.filter(p => p.category === cat);
                            if (catProducts.length === 0) return null;
                            return (
                                <div key={cat} className="space-y-6">
                                    <div className="flex items-center gap-3 px-2 border-b border-gray-100 dark:border-gray-800 pb-2"><Layers className="w-5 h-5 text-primary" /><h2 className="text-xl font-black uppercase">{cat}</h2></div>
                                    <div className="flex flex-col gap-4">
                                        {catProducts.map(p => (
                                            <div key={p.id} onClick={() => onSelectProduct(p)} className="flex items-stretch justify-between gap-6 rounded-[24px] bg-white dark:bg-surface-dark p-4 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all group cursor-pointer border dark:border-gray-800">
                                                <div className="flex flex-col justify-between flex-1 py-1">
                                                    <div><h3 className="text-slate-900 dark:text-white text-lg font-black group-hover:text-primary transition-colors">{p.name}</h3><p className="text-slate-500 dark:text-gray-400 text-sm font-medium line-clamp-2 mt-1">{p.description}</p></div>
                                                    <div className="flex items-center justify-between mt-4"><p className="text-xl font-black font-display">R$ {p.price.toFixed(2)}</p><div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"><Plus className="w-4 h-4" /> Customizar</div></div>
                                                </div>
                                                <div className="relative w-32 h-32 bg-center bg-cover rounded-2xl shadow-md group-hover:scale-105 transition-all" style={{backgroundImage: `url('${p.imageUrl}')`}}></div>
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
    );
}
