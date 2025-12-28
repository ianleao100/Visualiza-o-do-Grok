
import React from 'react';
import { X, Utensils, MapPin, Save } from 'lucide-react';
import { TableConfig } from '../../../../types';
import { BaseModal } from '../../../ui/BaseModal';

interface TableManagementModalProps {
  editingTable: Partial<TableConfig>;
  setEditingTable: (table: Partial<TableConfig>) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function TableManagementModal({
  editingTable,
  setEditingTable,
  onClose,
  onSave
}: TableManagementModalProps) {
  return (
    <BaseModal onClose={onClose} className="max-w-md" hideCloseButton={true}>
      <div className="relative w-full bg-white dark:bg-surface-dark rounded-[40px] shadow-2xl p-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black tracking-tight">{editingTable.number ? 'Editar Mesa' : 'Nova Mesa'}</h2>
          <button onClick={onClose} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl hover:text-red-500 transition-all"><X /></button>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número Identificador</label>
            <div className="relative">
              <Utensils className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="text" 
                value={editingTable.number || ''}
                onChange={(e) => setEditingTable({...editingTable, number: e.target.value})}
                placeholder="Ex: 01, 150, A2..."
                className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary font-black text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Localização / Descrição</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="text" 
                value={editingTable.description || ''}
                onChange={(e) => setEditingTable({...editingTable, description: e.target.value})}
                placeholder="Ex: Salão, Calçada, Superior..."
                className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary font-black text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <button 
            onClick={onSave}
            disabled={!editingTable.number}
            className="w-full bg-[#EA2831] hover:bg-red-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            SALVAR CONFIGURAÇÃO
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
