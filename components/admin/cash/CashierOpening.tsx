
import React, { useState } from 'react';
import { Power, Play, Wallet, ChevronDown, User, Landmark } from 'lucide-react';
import { MOCK_PROFESSIONALS } from '../../../constants';

interface CashierOpeningProps {
    onOpen: (responsible: string, initialValue: number) => void;
}

export default function CashierOpening({ onOpen }: CashierOpeningProps) {
    const [openingValue, setOpeningValue] = useState('');
    const [selectedPro, setSelectedPro] = useState('');
    const [isSelectOpen, setIsSelectOpen] = useState(false);

    const handleOpenCashier = () => {
        if (!selectedPro) { alert('Por favor, selecione um operador.'); return; }
        onOpen(selectedPro, parseFloat(openingValue) || 0);
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[600px] relative animate-[fadeIn_0.3s]">
            <div className="w-full max-w-5xl bg-white dark:bg-surface-dark rounded-[32px] shadow-2xl flex flex-col md:flex-row overflow-visible relative z-10 border-2 border-[#EA2831] mt-16 md:mt-0">
                
                {/* Left Side - Visual & Branding */}
                <div className="hidden md:flex w-5/12 bg-slate-50 dark:bg-gray-800/50 items-center justify-center relative overflow-hidden rounded-l-[30px]">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                    <div className="relative z-10 flex flex-col items-center gap-6 p-8 text-center">
                        <div className="size-24 bg-white dark:bg-surface-dark rounded-[32px] shadow-xl shadow-slate-200/50 dark:shadow-black/20 flex items-center justify-center text-[#EA2831]">
                            <Landmark className="w-10 h-10" strokeWidth={1.5} />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Gestão Financeira</h2>
                            <p className="text-xs font-medium text-slate-400 max-w-[200px] mx-auto">Abra o caixa para iniciar as operações de venda e controle do dia.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="flex-1 p-8 md:p-12 flex flex-col justify-center gap-8 bg-white dark:bg-surface-dark rounded-r-[30px] rounded-bl-[30px] md:rounded-bl-none relative">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            <Wallet className="w-8 h-8 text-[#EA2831]" />
                            Controle de Caixa
                        </h1>
                        <p className="text-slate-500 font-medium text-sm ml-11">Configure o turno atual.</p>
                    </div>

                    <div className="space-y-6 max-w-md relative">
                        {/* Operator Select */}
                        <div className="space-y-2 relative z-50">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operador Responsável</label>
                            <div className="relative">
                                <button 
                                    onClick={() => setIsSelectOpen(!isSelectOpen)}
                                    className={`w-full px-6 py-4 bg-white border-2 text-left rounded-2xl font-bold text-sm flex items-center justify-between transition-all ${isSelectOpen ? 'border-[#EA2831] ring-2 ring-[#EA2831]/20 shadow-lg' : 'border-gray-100 hover:border-[#EA2831]/50'} ${selectedPro ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}
                                >
                                    {selectedPro || "Selecionar Operador..."}
                                    <ChevronDown className={`w-5 h-5 text-[#EA2831] transition-transform ${isSelectOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isSelectOpen && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden animate-[slideUp_0.1s_ease-out]">
                                        {MOCK_PROFESSIONALS.map(pro => (
                                            <button
                                                key={pro.id}
                                                onClick={() => { setSelectedPro(pro.name); setIsSelectOpen(false); }}
                                                className="w-full text-left px-6 py-3 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-[#EA2831] font-bold text-sm text-slate-600 dark:text-gray-300 transition-colors flex items-center gap-2"
                                            >
                                                <User className="w-4 h-4 opacity-50" />
                                                {pro.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Money Input */}
                        <div className="space-y-2 relative z-0">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Saldo Inicial (Fundo de Troco)</label>
                            <div className="relative group">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-xl group-focus-within:text-[#EA2831] transition-colors">R$</span>
                                <input 
                                    type="number" 
                                    value={openingValue} 
                                    onChange={e => setOpeningValue(e.target.value)} 
                                    placeholder="0,00" 
                                    className="w-full pl-16 pr-6 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#EA2831]/10 rounded-2xl focus:ring-0 font-black text-3xl text-slate-900 dark:text-white transition-all placeholder:text-slate-200 outline-none" 
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleOpenCashier}
                            disabled={!selectedPro}
                            className="w-full bg-[#EA2831] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-red-600/30 text-white font-black py-5 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-2 group relative z-0"
                        >
                            ABRIR CAIXA
                            <Play className="w-5 h-5 fill-current group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
