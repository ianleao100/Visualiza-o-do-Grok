
import React from 'react';
import { ChevronLeft, Zap, Utensils, Bike, ArrowLeftRight, Search } from 'lucide-react';

interface PosHeaderProps {
    onBack: () => void;
    posMode: 'QUICK' | 'TABLES' | 'DELIVERY';
    setPosMode: (mode: any) => void;
    selectedTableId: string | null;
    onTransferTable: () => void;
    isTransferEnabled: boolean;
    search: string;
    setSearch: (val: string) => void;
    onResetSelection: () => void;
}

export default function PosHeader({
    onBack,
    posMode,
    setPosMode,
    selectedTableId,
    onTransferTable,
    isTransferEnabled,
    search,
    setSearch,
    onResetSelection
}: PosHeaderProps) {
    return (
        <header className="h-24 bg-white dark:bg-surface-dark px-10 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-primary hover:text-white transition-all"><ChevronLeft /></button>
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-[20px] border dark:border-gray-700">
              <button 
                onClick={() => { onResetSelection(); setPosMode('QUICK'); }} 
                className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-xs transition-all ${posMode === 'QUICK' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-400'}`}
              >
                <Zap className="w-4 h-4" /> VENDA RÁPIDA
              </button>
              <button 
                onClick={() => setPosMode('TABLES')} 
                className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-xs transition-all ${posMode === 'TABLES' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-400'}`}
              >
                <Utensils className="w-4 h-4" /> MESAS
              </button>
              <button 
                onClick={() => { onResetSelection(); setPosMode('DELIVERY'); }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-xs transition-all ${posMode === 'DELIVERY' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-400'}`}
              >
                <Bike className="w-4 h-4" /> DELIVERY
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
              {selectedTableId && (
                <button 
                    onClick={onTransferTable} 
                    disabled={!isTransferEnabled} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase transition-all ${!isTransferEnabled ? 'bg-gray-100 text-slate-400 cursor-not-allowed opacity-60' : 'bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-100'}`}
                >
                  <ArrowLeftRight className="w-4 h-4" /> Trocar Mesa
                </button>
              )}
              <div className="relative w-72 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="Pesquisar produto..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold shadow-sm"
                />
              </div>
          </div>
        </header>
    );
}
