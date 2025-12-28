
import React, { useState, useEffect } from 'react';
import { Ticket, Star, Megaphone, Plus, Trash2, Save, Sparkles, Percent, DollarSign, Gift } from 'lucide-react';
import { storageService } from '../../../services/storageService';
import { Coupon, MarketingConfig } from '../../../services/storage/marketingService';
import { Product } from '../../../types';
import { formatCurrency } from '../../../shared/utils/mathEngine';

export const AdminMarketing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'COUPONS' | 'LOYALTY' | 'FEATURED'>('COUPONS');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [config, setConfig] = useState<MarketingConfig>({ pointsPerCurrency: 1, featuredProductId: null });
  const [products, setProducts] = useState<Product[]>([]);

  // Form States
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({ code: '', type: 'PERCENT', value: 10, active: true });

  useEffect(() => {
      setCoupons(storageService.getCoupons());
      setConfig(storageService.getMarketingConfig());
      setProducts(storageService.getProducts());
  }, []);

  const handleSaveCoupon = () => {
      if (!newCoupon.code || !newCoupon.value) return;
      
      const coupon: Coupon = {
          id: Math.random().toString(36).substr(2, 9),
          code: newCoupon.code.toUpperCase(),
          type: newCoupon.type || 'PERCENT',
          value: newCoupon.value,
          active: true,
          usageCount: 0
      };
      
      storageService.saveCoupon(coupon);
      setCoupons(prev => [...prev, coupon]);
      setNewCoupon({ code: '', type: 'PERCENT', value: 10, active: true });
  };

  const handleDeleteCoupon = (id: string) => {
      storageService.deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
  };

  const handleSaveConfig = () => {
      storageService.saveMarketingConfig(config);
      alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
        
        {/* HEADER CONTEXTUAL */}
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Central de Marketing</h1>
            <p className="text-sm text-slate-500">Crie cupons, campanhas e programas de fidelidade.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 pb-1">
            <button 
                onClick={() => setActiveTab('COUPONS')}
                className={`flex items-center gap-2 pb-3 px-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'COUPONS' ? 'text-[#EA2831] border-[#EA2831]' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
            >
                <Ticket className="w-4 h-4" /> Cupons
            </button>
            <button 
                onClick={() => setActiveTab('LOYALTY')}
                className={`flex items-center gap-2 pb-3 px-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'LOYALTY' ? 'text-[#EA2831] border-[#EA2831]' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
            >
                <Star className="w-4 h-4" /> Fidelidade
            </button>
            <button 
                onClick={() => setActiveTab('FEATURED')}
                className={`flex items-center gap-2 pb-3 px-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'FEATURED' ? 'text-[#EA2831] border-[#EA2831]' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
            >
                <Megaphone className="w-4 h-4" /> Destaques
            </button>
        </div>

        {/* CONTENT - COUPONS */}
        {activeTab === 'COUPONS' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-[fadeIn_0.3s]">
                {/* Create Coupon */}
                <div className="bg-white dark:bg-surface-dark p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm h-fit">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Plus className="w-5 h-5 text-[#EA2831]" /> Novo Cupom</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Código</label>
                            <input 
                                type="text" 
                                value={newCoupon.code}
                                onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                                placeholder="Ex: BEMVINDO10"
                                className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl font-black text-slate-900 dark:text-white uppercase focus:ring-2 focus:ring-[#EA2831]"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipo</label>
                                <div className="flex bg-gray-50 dark:bg-gray-800 p-1 rounded-xl mt-1">
                                    <button 
                                        onClick={() => setNewCoupon({...newCoupon, type: 'PERCENT'})}
                                        className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${newCoupon.type === 'PERCENT' ? 'bg-white dark:bg-gray-700 text-[#EA2831] shadow-sm' : 'text-slate-400'}`}
                                    >
                                        %
                                    </button>
                                    <button 
                                        onClick={() => setNewCoupon({...newCoupon, type: 'FIXED'})}
                                        className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${newCoupon.type === 'FIXED' ? 'bg-white dark:bg-gray-700 text-[#EA2831] shadow-sm' : 'text-slate-400'}`}
                                    >
                                        R$
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor</label>
                                <input 
                                    type="number" 
                                    value={newCoupon.value}
                                    onChange={e => setNewCoupon({...newCoupon, value: parseFloat(e.target.value)})}
                                    className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-[#EA2831]"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={handleSaveCoupon}
                            disabled={!newCoupon.code}
                            className="w-full mt-4 bg-[#EA2831] hover:bg-red-700 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-red-500/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            Criar Cupom
                        </button>
                    </div>
                </div>

                {/* List Coupons */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2"><Ticket className="w-5 h-5 text-slate-400" /> Cupons Ativos</h3>
                    {coupons.length === 0 ? (
                        <div className="p-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[32px] text-center text-slate-400">
                            Nenhum cupom criado ainda.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {coupons.map(coupon => (
                                <div key={coupon.id} className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex justify-between items-center group relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#EA2831]"></div>
                                    <div>
                                        <p className="text-xl font-black text-slate-900 dark:text-white">{coupon.code}</p>
                                        <p className="text-xs font-bold text-slate-500 mt-1">
                                            Desconto de {coupon.type === 'PERCENT' ? `${coupon.value}%` : formatCurrency(coupon.value)}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteCoupon(coupon.id)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* CONTENT - LOYALTY */}
        {activeTab === 'LOYALTY' && (
            <div className="bg-white dark:bg-surface-dark p-10 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm max-w-2xl animate-[fadeIn_0.3s]">
                <div className="flex items-start gap-6">
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl text-yellow-600">
                        <Star className="w-10 h-10 fill-current" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Regra de Pontuação</h3>
                        <p className="text-sm text-slate-500 mb-6">Defina quantos pontos o cliente acumula a cada 1 Real gasto em compras.</p>
                        
                        <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase mb-1">A cada</span>
                                <div className="text-2xl font-black text-slate-700 dark:text-white">R$ 1,00</div>
                            </div>
                            <div className="h-px flex-1 bg-gray-300 dark:bg-gray-600 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-50 dark:bg-gray-800 px-2 text-slate-400 font-bold">=</div>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase mb-1">Ganha</span>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        value={config.pointsPerCurrency}
                                        onChange={(e) => setConfig({...config, pointsPerCurrency: parseFloat(e.target.value)})}
                                        className="w-20 px-2 py-1 bg-white dark:bg-surface-dark border-2 border-[#EA2831] rounded-lg text-center font-black text-xl focus:outline-none"
                                    />
                                    <span className="text-sm font-bold text-[#EA2831]">Pontos</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleSaveConfig}
                            className="mt-8 flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-lg"
                        >
                            <Save className="w-4 h-4" /> Salvar Regra
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* CONTENT - FEATURED */}
        {activeTab === 'FEATURED' && (
            <div className="bg-white dark:bg-surface-dark p-10 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm max-w-4xl animate-[fadeIn_0.3s]">
                <div className="flex items-start gap-6">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-2xl text-purple-600">
                        <Sparkles className="w-10 h-10" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Destaque do Dia</h3>
                        <p className="text-sm text-slate-500 mb-6">Escolha um produto para aparecer em evidência no topo do cardápio do cliente.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selecionar Produto</label>
                                <div className="max-h-60 overflow-y-auto no-scrollbar space-y-2 border border-gray-100 dark:border-gray-800 rounded-2xl p-2">
                                    {products.map(p => (
                                        <div 
                                            key={p.id}
                                            onClick={() => setConfig({...config, featuredProductId: p.id})}
                                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${config.featuredProductId === p.id ? 'bg-purple-50 border-purple-200 ring-1 ring-purple-200' : 'bg-white dark:bg-gray-800 border-transparent hover:bg-gray-50'}`}
                                        >
                                            <img src={p.imageUrl} className="size-10 rounded-lg object-cover bg-gray-200" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                                                <p className="text-xs text-slate-500">{formatCurrency(p.price)}</p>
                                            </div>
                                            {config.featuredProductId === p.id && <div className="size-3 rounded-full bg-purple-500"></div>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Preview Card */}
                            <div className="bg-gray-100 dark:bg-black/20 p-6 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Pré-visualização</span>
                                {config.featuredProductId ? (
                                    (() => {
                                        const p = products.find(prod => prod.id === config.featuredProductId);
                                        if (!p) return null;
                                        return (
                                            <div className="w-48 bg-white dark:bg-surface-dark rounded-2xl shadow-lg overflow-hidden">
                                                <div className="h-32 bg-cover bg-center" style={{backgroundImage: `url('${p.imageUrl}')`}}></div>
                                                <div className="p-3">
                                                    <p className="font-bold text-sm text-slate-900 truncate">{p.name}</p>
                                                    <p className="text-xs font-black text-purple-600 mt-1">{formatCurrency(p.price)}</p>
                                                </div>
                                            </div>
                                        )
                                    })()
                                ) : (
                                    <p className="text-slate-400 text-sm font-medium">Nenhum produto selecionado</p>
                                )}
                            </div>
                        </div>

                        <button 
                            onClick={handleSaveConfig}
                            className="mt-8 flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-lg"
                        >
                            <Save className="w-4 h-4" /> Salvar Destaque
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
