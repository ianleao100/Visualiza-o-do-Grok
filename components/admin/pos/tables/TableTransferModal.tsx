
import React from 'react';
import { X, Utensils, ArrowRight } from 'lucide-react';
import { TableConfig, TableSession } from '../../../../types';
import { BaseModal } from '../../../ui/BaseModal';

interface TableTransferModalProps {
  currentTableId: string;
  tablesConfig: TableConfig[];
  tableSessions: Record<string, TableSession>;
  onClose: () => void;
  onTransfer: (toTableId: string) => void;
}

export default function TableTransferModal({
  currentTableId,
  tablesConfig,
  tableSessions,
  onClose,
  onTransfer
}: TableTransferModalProps) {
  const currentTable = tablesConfig.find(t => t.id === currentTableId);
  const availableTables = tablesConfig.filter(t => t.id !== currentTableId && !tableSessions[t.id]);

  return (
    <BaseModal onClose={onClose} className="max-w-2xl">
      <div className="relative w-full bg-white dark:bg-surface-dark rounded-[40px] shadow-2xl p-10 flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black tracking-tight">Trocar de Mesa</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Selecione o novo destino para o pedido</p>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:text-red-500 transition-all"><X /></button>
        </div>

        <div className="flex items-center justify-center gap-10 py-4">
            <div className="flex flex-col items-center gap-2">
                <div className="size-20 bg-primary text-white rounded-[24px] flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="text-3xl font-black">{currentTable?.number}</span>
                </div>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Origem</span>
            </div>
            <ArrowRight className="w-10 h-10 text-slate-200 animate-pulse" />
            <div className="flex flex-col items-center gap-2">
                <div className="size-20 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-slate-300 dark:border-gray-700 rounded-[24px] flex items-center justify-center text-slate-300">
                    <Utensils className="w-8 h-8" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Destino</span>
            </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 overflow-y-auto max-h-[40vh] p-2 no-scrollbar">
            {availableTables.map(table => (
                <button 
                    key={table.id}
                    onClick={() => onTransfer(table.id)}
                    className="aspect-square bg-white dark:bg-surface-dark border-2 border-red-500 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all hover:bg-red-50 hover:scale-110 active:scale-95 text-red-600 shadow-sm"
                >
                    <span className="text-lg font-black">{table.number}</span>
                    <span className="text-[8px] font-bold uppercase truncate px-1">{table.description || 'Livre'}</span>
                </button>
            ))}
            {availableTables.length === 0 && (
                <div className="col-span-full py-10 text-center text-slate-400 font-bold italic">
                    Nenhuma mesa livre disponível para transferência.
                </div>
            )}
        </div>

        <div className="flex justify-end pt-4">
            <button onClick={onClose} className="px-8 py-4 bg-gray-100 dark:bg-gray-800 rounded-2xl font-black text-xs text-slate-500 hover:bg-gray-200 transition-all">CANCELAR OPERAÇÃO</button>
        </div>
      </div>
    </BaseModal>
  );
}
