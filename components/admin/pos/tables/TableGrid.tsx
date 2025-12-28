
import React from 'react';
import { Utensils, Clock, Edit2, Trash2, Plus } from 'lucide-react';
import { TableConfig, TableSession } from '../../../../types';

interface TableGridProps {
  tablesConfig: TableConfig[];
  tableSessions: Record<string, TableSession>;
  onSelectTable: (table: TableConfig) => void;
  onEditTable: (e: React.MouseEvent, table: TableConfig) => void;
  onDeleteTable: (e: React.MouseEvent, tableId: string) => void;
  onAddTable: () => void;
}

export default function TableGrid({
  tablesConfig,
  tableSessions,
  onSelectTable,
  onEditTable,
  onDeleteTable,
  onAddTable
}: TableGridProps) {
  return (
    <div className="p-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 animate-[fadeIn_0.3s]">
      {tablesConfig.map(table => {
        const session = tableSessions[table.id];
        const isOccupied = !!session;
        return (
          <div key={table.id} className="relative group">
            <button 
              onClick={() => onSelectTable(table)}
              className={`relative w-full aspect-square rounded-[32px] border-2 transition-all flex flex-col items-center justify-center gap-2 group active:scale-95 shadow-sm ${
                isOccupied 
                ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' 
                : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-gray-800 text-slate-400 hover:border-primary hover:text-primary hover:bg-red-50/30'
              }`}
            >
              <Utensils className={`w-8 h-8 transition-colors ${isOccupied ? 'text-white animate-pulse' : 'text-slate-300 group-hover:text-primary'}`} />
              <span className={`text-2xl font-black transition-colors ${isOccupied ? 'text-white' : 'text-slate-600 group-hover:text-primary'}`}>{table.number}</span>
              <div className="flex flex-col items-center">
                <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isOccupied ? 'text-white/80' : 'text-slate-400 group-hover:text-primary'}`}>
                  {isOccupied ? session.customerName.split(' ')[0] : table.description || 'Mesa'}
                </span>
                {isOccupied && (
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-white" />
                    <span className="text-[9px] font-bold text-white">Ocupada</span>
                  </div>
                )}
              </div>
            </button>
            
            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all z-10">
              <button 
                onClick={(e) => onEditTable(e, table)} 
                className="p-2.5 rounded-full shadow-lg bg-white dark:bg-gray-800 text-slate-400 hover:text-primary transition-all active:scale-90 border border-gray-100 dark:border-gray-700"
                title="Editar Mesa"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => onDeleteTable(e, table.id)} 
                className="p-2.5 rounded-full shadow-lg bg-white dark:bg-gray-800 text-slate-400 hover:text-red-500 transition-all active:scale-90 border border-gray-100 dark:border-gray-700"
                title="Excluir Mesa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
      
      <button 
        onClick={onAddTable}
        className="aspect-square rounded-[32px] border-2 border-dashed border-red-500 bg-white dark:bg-surface-dark flex flex-col items-center justify-center gap-3 text-primary transition-all active:scale-95 shadow-sm hover:bg-red-50/50"
      >
        <Plus className="w-10 h-10" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Adicionar Mesa</span>
      </button>
    </div>
  );
}
