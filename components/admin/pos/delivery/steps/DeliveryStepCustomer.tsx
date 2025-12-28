import React, { useState } from 'react';
import { Search, AlertCircle, CheckCircle, User, MapPin, ChevronRight, Home, Plus, Briefcase, Map, ChevronDown, Star } from 'lucide-react';
import { maskPhone } from '../../../../../shared/utils/mathEngine';
import { DeliveryAddress } from '../types';

interface DeliveryStepCustomerProps {
    customerSearch: string;
    handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    showSuggestions: boolean;
    suggestions: any[];
    handleSelectSuggestion: (customer: any) => void;
    customerFound: boolean;
    customerName: string;
    setCustomerName: (val: string) => void;
    customerPhone: string;
    setCustomerPhone: (val: string) => void;
    customerPoints?: number; // Added Points
    savedAddresses: DeliveryAddress[];
    selectedAddressId: string;
    handleSelectAddress: (id: string) => void;
    addressForm: any;
    setAddressForm: (field: string, val: string) => void;
}

const DeliveryStepCustomer = React.memo((props: DeliveryStepCustomerProps) => {
    const [isAddressMenuOpen, setIsAddressMenuOpen] = useState(false);
    
    // Helper para ícones
    const getIcon = (label: string) => {
        const l = label ? label.toLowerCase() : '';
        if (l.includes('casa')) return Home;
        if (l.includes('trabalho') || l.includes('escritório')) return Briefcase;
        return MapPin;
    };

    const currentAddressLabel = props.selectedAddressId === 'new' 
        ? 'Novo Endereço' 
        : props.savedAddresses.find(a => a.id === props.selectedAddressId)?.label || 'Selecionar...';

    const CurrentIcon = getIcon(currentAddressLabel);

    const handleSelectAndClose = (id: string) => {
        props.handleSelectAddress(id);
        setIsAddressMenuOpen(false);
    };

    return (
        <div className="space-y-6 animate-[fadeIn_0.3s]">
            <div className="flex gap-3 items-start relative z-50">
                <div className="flex-1 space-y-1 relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Buscar (Nome ou WhatsApp)</label>
                    <div className="relative">
                        <input 
                            value={props.customerSearch} 
                            onChange={props.handleSearchChange}
                            placeholder="Digite para ver sugestões..." 
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-surface-dark border-2 border-slate-200 dark:border-gray-700 rounded-xl font-bold text-slate-900 dark:text-white focus:border-[#EA2831] focus:ring-0 transition-all text-sm"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>

                    {/* DROPDOWN DE SUGESTÕES */}
                    {props.showSuggestions && props.suggestions.length > 0 && (
                        <div className="absolute top-full left-0 w-full bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl mt-1 z-[100] max-h-60 overflow-y-auto animate-[slideDown_0.2s]">
                            {props.suggestions.map((customer: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => props.handleSelectSuggestion(customer)}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between border-b border-gray-50 dark:border-gray-800/50 last:border-0 transition-colors group"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#EA2831] transition-colors">{customer.name}</span>
                                        <span className="text-[10px] text-slate-500">{customer.whatsapp}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {customer.points > 0 && (
                                            <span className="text-[10px] font-black text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                                                {customer.points} pts
                                            </span>
                                        )}
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#EA2831]" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {props.customerSearch.length > 0 && !props.customerFound && !props.showSuggestions && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl flex items-center gap-2 animate-[fadeIn_0.3s]">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400">Cliente não encontrado - Cadastre os dados abaixo.</span>
                </div>
            )}
            
            {props.customerFound && (
                <div className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-xl flex items-center gap-2 animate-[fadeIn_0.3s]">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-bold text-green-700 dark:text-green-400">Cliente Selecionado! Dados carregados.</span>
                </div>
            )}

            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 md:col-span-4 space-y-4">
                    {/* Header Alinhado - Altura Fixa */}
                    <div className="h-9 flex items-center border-b border-gray-100 dark:border-gray-800 pb-2">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                            <User className="w-4 h-4 text-[#EA2831]" /> Dados do Cliente
                        </h4>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Nome Completo *</label>
                            <input 
                                value={props.customerName} 
                                onChange={e => props.setCustomerName(e.target.value)}
                                placeholder="Ex: João da Silva"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#EA2831] text-sm placeholder:text-gray-400/70"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">WhatsApp *</label>
                            <input 
                                value={props.customerPhone} 
                                onChange={e => props.setCustomerPhone(maskPhone(e.target.value))}
                                placeholder="Ex: (77) 99999-9999"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-[#EA2831] text-sm placeholder:text-gray-400/70"
                            />
                            {/* Exibição de Saldo de Pontos */}
                            {props.customerFound && (
                                <div className="flex items-center gap-1.5 px-1 pt-1 animate-[fadeIn_0.3s]">
                                    <Star className="w-3 h-3 text-emerald-500 fill-current" />
                                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                        Saldo de Fidelidade: {props.customerPoints || 0} pontos
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-span-12 md:col-span-8 space-y-4">
                    {/* Header Alinhado com Seletor - Altura Fixa */}
                    <div className="h-9 flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2 relative z-40">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#EA2831]" /> Endereço de Entrega
                        </h4>

                        {/* COMPACT ADDRESS SELECTOR */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsAddressMenuOpen(!isAddressMenuOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-full shadow-sm hover:border-[#EA2831] transition-all group"
                            >
                                <CurrentIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#EA2831]" />
                                <span className="text-[11px] font-bold text-slate-700 dark:text-gray-200 group-hover:text-[#EA2831]">{currentAddressLabel}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isAddressMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isAddressMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden animate-[slideUp_0.1s_ease-out] flex flex-col z-[100]">
                                    {props.savedAddresses.length > 0 && (
                                        <div className="p-1">
                                            {props.savedAddresses.map(addr => {
                                                const AddrIcon = getIcon(addr.label);
                                                return (
                                                    <button 
                                                        key={addr.id}
                                                        onClick={() => handleSelectAndClose(addr.id)}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${props.selectedAddressId === addr.id ? 'bg-red-50 text-[#EA2831]' : 'hover:bg-gray-50 text-slate-600'}`}
                                                    >
                                                        <AddrIcon className="w-4 h-4" />
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold">{addr.label}</span>
                                                            <span className="text-[9px] opacity-70 truncate max-w-[140px]">{addr.street}, {addr.number}</span>
                                                        </div>
                                                        {props.selectedAddressId === addr.id && <CheckCircle className="w-3 h-3 ml-auto" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <div className="border-t border-gray-100 dark:border-gray-700 p-1">
                                        <button 
                                            onClick={() => handleSelectAndClose('new')}
                                            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-xs font-bold transition-colors ${props.selectedAddressId === 'new' ? 'bg-red-50 text-[#EA2831]' : 'text-[#EA2831] hover:bg-red-50'}`}
                                        >
                                            <Plus className="w-4 h-4" />
                                            Novo Endereço
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-12 gap-3 bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div className="col-span-9 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Rua *</label>
                            <input 
                                value={props.addressForm.street} 
                                onChange={e => props.setAddressForm('street', e.target.value)} 
                                placeholder="Ex: Av. Centenário"
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#EA2831] text-sm placeholder:text-gray-400/70" 
                            />
                        </div>
                        <div className="col-span-3 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Nº *</label>
                            <input 
                                value={props.addressForm.number} 
                                onChange={e => props.setAddressForm('number', e.target.value)} 
                                placeholder="Ex: 100"
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#EA2831] text-sm placeholder:text-gray-400/70" 
                            />
                        </div>
                        <div className="col-span-5 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Bairro *</label>
                            <input 
                                value={props.addressForm.district} 
                                onChange={e => props.setAddressForm('district', e.target.value)} 
                                placeholder="Ex: Centro"
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#EA2831] text-sm placeholder:text-gray-400/70" 
                            />
                        </div>
                        <div className="col-span-7 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Complemento</label>
                            <input 
                                value={props.addressForm.complement} 
                                onChange={e => props.setAddressForm('complement', e.target.value)} 
                                placeholder="Ex: Apartamento 102"
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#EA2831] text-sm placeholder:text-gray-400/70" 
                            />
                        </div>
                        <div className="col-span-12 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Referência</label>
                            <input 
                                value={props.addressForm.reference} 
                                onChange={e => props.setAddressForm('reference', e.target.value)} 
                                placeholder="Ex: Ao lado do Banco Caixa"
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#EA2831] text-sm placeholder:text-gray-400/70" 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default DeliveryStepCustomer;