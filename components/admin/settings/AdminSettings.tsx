
import React, { useState, useEffect } from 'react';
import { Settings, Clock, MapPin, Building, Save, Truck, Trash2, AlertTriangle } from 'lucide-react';
import { storageService } from '../../../services/storageService';
import { StoreProfile, DaySchedule } from '../../../services/storage/settingsService';
import { OperatingHours } from './OperatingHours';

export const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'HOURS' | 'DELIVERY' | 'DANGER'>('PROFILE');
  const [profile, setProfile] = useState<StoreProfile>({ name: '', cnpj: '', address: '', phone: '', deliveryBaseFee: 0, freeShippingThreshold: 0 });
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);

  useEffect(() => {
      setProfile(storageService.getStoreProfile());
      setSchedule(storageService.getStoreHours());
  }, []);

  const handleSave = () => {
      storageService.saveStoreProfile(profile);
      storageService.saveStoreHours(schedule);
      alert('Configurações salvas com sucesso!');
  };

  const handleFactoryReset = () => {
      if (confirm('⚠️ PERIGO: ISSO APAGARÁ TUDO!\n\nTodos os produtos, pedidos, clientes e configurações serão perdidos permanentemente.\n\nDeseja realmente resetar o sistema para o estado inicial?')) {
          storageService.clearAll();
          alert('Sistema resetado. A página será recarregada.');
          window.location.reload();
      }
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
        
        {/* HEADER CONTEXTUAL */}
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Configurações do Estabelecimento</h1>
            <p className="text-sm text-slate-500">Gerencie horários, taxas e dados da sua unidade.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 pb-1 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveTab('PROFILE')} className={`flex items-center gap-2 pb-3 px-4 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'PROFILE' ? 'text-[#EA2831] border-[#EA2831]' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
                <Building className="w-4 h-4" /> Dados da Loja
            </button>
            <button onClick={() => setActiveTab('HOURS')} className={`flex items-center gap-2 pb-3 px-4 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'HOURS' ? 'text-[#EA2831] border-[#EA2831]' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
                <Clock className="w-4 h-4" /> Horários
            </button>
            <button onClick={() => setActiveTab('DELIVERY')} className={`flex items-center gap-2 pb-3 px-4 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'DELIVERY' ? 'text-[#EA2831] border-[#EA2831]' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
                <Truck className="w-4 h-4" /> Taxas & Entrega
            </button>
            <button onClick={() => setActiveTab('DANGER')} className={`flex items-center gap-2 pb-3 px-4 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'DANGER' ? 'text-red-600 border-red-600' : 'text-slate-400 border-transparent hover:text-red-500'}`}>
                <AlertTriangle className="w-4 h-4" /> Zona de Perigo
            </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                
                {activeTab === 'PROFILE' && (
                    <div className="bg-white dark:bg-surface-dark p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm animate-[fadeIn_0.3s]">
                        <h3 className="text-lg font-black text-slate-900 mb-6">Identidade da Loja</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Nome Fantasia</label>
                                <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-[#EA2831] outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">CNPJ</label>
                                <input value={profile.cnpj} onChange={e => setProfile({...profile, cnpj: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-[#EA2831] outline-none" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Endereço Completo</label>
                                <input value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-[#EA2831] outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Telefone / WhatsApp</label>
                                <input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-[#EA2831] outline-none" />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'HOURS' && (
                    <div className="animate-[fadeIn_0.3s]">
                        <OperatingHours schedule={schedule} onChange={setSchedule} />
                    </div>
                )}

                {activeTab === 'DELIVERY' && (
                    <div className="bg-white dark:bg-surface-dark p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm animate-[fadeIn_0.3s]">
                        <h3 className="text-lg font-black text-slate-900 mb-6">Logística de Entrega</h3>
                        <div className="space-y-6 max-w-md">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Taxa de Entrega Fixa</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                                    <input 
                                        type="number" 
                                        value={profile.deliveryBaseFee} 
                                        onChange={e => setProfile({...profile, deliveryBaseFee: parseFloat(e.target.value)})} 
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-[#EA2831] outline-none" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Frete Grátis acima de</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                                    <input 
                                        type="number" 
                                        value={profile.freeShippingThreshold} 
                                        onChange={e => setProfile({...profile, freeShippingThreshold: parseFloat(e.target.value)})} 
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-[#EA2831] outline-none" 
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400">Deixe 0 para desativar isenção.</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'DANGER' && (
                    <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-[32px] border-2 border-red-100 dark:border-red-900/30 animate-[fadeIn_0.3s]">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl text-red-600">
                                <Trash2 className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-red-700 dark:text-red-400 mb-2">Resetar Banco de Dados</h3>
                                <p className="text-sm font-medium text-red-600/80 mb-6 leading-relaxed max-w-md">
                                    Esta ação é irreversível. Ela apagará todos os pedidos, clientes, histórico de caixa e produtos cadastrados, retornando o sistema ao estado original de instalação.
                                </p>
                                <button 
                                    onClick={handleFactoryReset}
                                    className="px-8 py-4 bg-red-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" /> Confirmar Reset Total
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab !== 'DANGER' && (
                    <div className="flex justify-end pt-4">
                        <button 
                            onClick={handleSave}
                            className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-lg flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" /> Salvar Alterações
                        </button>
                    </div>
                )}
            </div>

            {/* Side Info */}
            <div className="space-y-6">
                <div className="bg-[#EA2831] text-white p-8 rounded-[32px] shadow-xl shadow-red-500/20">
                    <Settings className="w-10 h-10 mb-4 opacity-80" />
                    <h4 className="text-xl font-black mb-2">Painel de Controle</h4>
                    <p className="text-xs text-white/80 leading-relaxed font-medium">
                        Mantenha os dados da sua loja sempre atualizados para garantir a melhor experiência para seus clientes.
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};
