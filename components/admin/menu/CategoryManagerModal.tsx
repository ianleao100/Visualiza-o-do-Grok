
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit2, Check, AlertTriangle, X, Layers, GripVertical } from 'lucide-react';
import { BaseModal } from '../../ui/BaseModal';
import { storageService } from '../../../services/storageService';

interface CategoryManagerModalProps {
    categories: string[];
    onClose: () => void;
    onProductsUpdate?: () => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ onClose, onProductsUpdate }) => {
    const [localCategories, setLocalCategories] = useState<string[]>([]);
    
    // Estado para Nova Categoria (Topo)
    const [newCategoryName, setNewCategoryName] = useState('');

    // Estados de Edição
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState('');
    
    // Estado para Drag and Drop
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
    
    // Estado para Exclusão Forçada
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

    const loadLocalCategories = () => {
        setLocalCategories(storageService.getCategories());
    };

    useEffect(() => {
        loadLocalCategories();
    }, []);

    // --- LÓGICA DE DRAG AND DROP ---
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        if (draggedItemIndex === null) return;
        if (draggedItemIndex === index) return;

        const newCategories = [...localCategories];
        const draggedItem = newCategories[draggedItemIndex];

        newCategories.splice(draggedItemIndex, 1);
        newCategories.splice(index, 0, draggedItem);

        setLocalCategories(newCategories);
        setDraggedItemIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedItemIndex(null);
        storageService.saveCategories(localCategories);
        if (onProductsUpdate) onProductsUpdate();
    };

    // --- LÓGICA DE CRUD (FORÇA BRUTA) ---

    const handleAddCategory = () => {
        if (!newCategoryName.trim()) return;

        const nameToAdd = newCategoryName.trim();

        // Validação Simples
        if (localCategories.some(c => c.toLowerCase() === nameToAdd.toLowerCase())) {
            alert('Esta categoria já existe.');
            return;
        }
        
        // 1. Atualiza Local (Feedback Instantâneo)
        const newCats = [nameToAdd, ...localCategories]; 
        setLocalCategories(newCats);
        
        // 2. Persiste e Dispara Eventos
        storageService.saveCategories(newCats);
        
        // 3. Limpeza
        setNewCategoryName('');
        
        if (onProductsUpdate) onProductsUpdate();
    };

    const startEditing = (index: number, currentName: string) => {
        setEditingIndex(index);
        setEditingValue(currentName);
    };

    const saveEditing = (index: number) => {
        if (!editingValue.trim()) {
            setEditingIndex(null);
            return;
        }
        const oldName = localCategories[index];
        const newName = editingValue.trim();
        
        if (oldName !== newName) {
            if (localCategories.some((c, i) => c.toLowerCase() === newName.toLowerCase() && i !== index)) {
                alert('Já existe uma categoria com este nome.');
                return;
            }
            
            const updatedCats = [...localCategories];
            updatedCats[index] = newName;
            setLocalCategories(updatedCats);

            storageService.updateCategory(oldName, newName);
            
            if (onProductsUpdate) onProductsUpdate();
        }
        setEditingIndex(null);
    };

    const requestDeleteCategory = (categoryName: string) => {
        setCategoryToDelete(categoryName);
    };

    const confirmDelete = () => {
        if (categoryToDelete) {
            const updatedCats = localCategories.filter(c => c !== categoryToDelete);
            setLocalCategories(updatedCats);
            storageService.deleteCategory(categoryToDelete);
            setCategoryToDelete(null);
            if (onProductsUpdate) onProductsUpdate();
        }
    };

    return (
        <BaseModal onClose={onClose} className="max-w-lg" hideCloseButton={true}>
            <div className="bg-white dark:bg-surface-dark rounded-[32px] overflow-hidden flex flex-col max-h-[85vh]">
                
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-surface-dark sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-50 dark:bg-red-900/20 p-2.5 rounded-xl text-[#EA2831]">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Categorias</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1">Arraste para reordenar o cardápio</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl hover:text-red-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-8 pt-6 space-y-6 bg-gray-50/50 dark:bg-black/20">
                    
                    {/* INPUT NOVO NO TOPO */}
                    <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adicionar Nova</label>
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                placeholder="Nome da Categoria..."
                                className="flex-1 bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#EA2831] transition-all"
                            />
                            <button 
                                onClick={handleAddCategory}
                                className="bg-[#EA2831] hover:bg-red-700 text-white px-4 py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-red-500/20 transition-all active:scale-[0.98] whitespace-nowrap flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4 stroke-[3]" /> Adicionar
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {localCategories.map((cat, idx) => (
                            <div 
                                key={cat} 
                                draggable={editingIndex === null} // Disable drag while editing
                                onDragStart={(e) => handleDragStart(e, idx)}
                                onDragEnter={(e) => handleDragEnter(e, idx)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => e.preventDefault()} 
                                className={`group relative flex items-center gap-4 p-4 bg-white dark:bg-surface-dark border rounded-2xl transition-all duration-200 ${
                                    draggedItemIndex === idx 
                                    ? 'opacity-50 border-dashed border-[#EA2831] bg-red-50 scale-95' 
                                    : 'border-gray-200 dark:border-gray-800 shadow-sm hover:border-[#EA2831]/30 hover:shadow-md'
                                } ${editingIndex === idx ? 'ring-2 ring-[#EA2831] border-[#EA2831]' : ''}`}
                            >
                                {/* Drag Handle */}
                                <div className={`cursor-grab active:cursor-grabbing p-1 text-slate-300 group-hover:text-[#EA2831] transition-colors ${editingIndex !== null ? 'opacity-20 pointer-events-none' : ''}`}>
                                    <GripVertical className="w-5 h-5" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    {editingIndex === idx ? (
                                        <div className="flex items-center gap-2 animate-[fadeIn_0.2s]">
                                            <input 
                                                value={editingValue}
                                                onChange={(e) => setEditingValue(e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border-none text-sm font-bold focus:ring-0 text-slate-900 dark:text-white"
                                                autoFocus
                                                onKeyDown={(e) => e.key === 'Enter' && saveEditing(idx)}
                                                placeholder="Nome da categoria"
                                            />
                                            <button 
                                                onClick={() => saveEditing(idx)} 
                                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col cursor-text" onClick={() => startEditing(idx, cat)}>
                                            <span className="font-black text-slate-700 dark:text-white text-sm truncate select-none">
                                                {cat}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                {editingIndex !== idx && (
                                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => startEditing(idx, cat)} 
                                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                                            title="Renomear"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => requestDeleteCategory(cat)} 
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {localCategories.length === 0 && (
                            <div className="text-center py-12 flex flex-col items-center gap-4 opacity-50">
                                <Layers className="w-16 h-16 text-slate-300" />
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Nenhuma categoria criada.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark z-20">
                    <button onClick={onClose} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-black transition-all shadow-lg active:scale-95">
                        CONCLUIR ORGANIZAÇÃO
                    </button>
                </div>
            </div>

            {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
            {categoryToDelete && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s]">
                    <div className="bg-white dark:bg-surface-dark rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-[slideUp_0.3s] text-center border-4 border-red-50 dark:border-red-900/20">
                        <div className="size-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 animate-bounce">
                            <AlertTriangle className="w-10 h-10 stroke-[1.5]" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Excluir Categoria?</h3>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                            A categoria <span className="font-bold text-slate-900 dark:text-white">"{categoryToDelete}"</span> e <span className="text-red-600 font-bold">todos os produtos nela</span> serão apagados permanentemente.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setCategoryToDelete(null)}
                                className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-sm uppercase tracking-wider transition-all"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="flex-1 py-4 bg-[#EA2831] hover:bg-red-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-red-500/20 transition-all active:scale-95"
                            >
                                Sim, Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </BaseModal>
    );
};
