
import React, { useState, useMemo } from 'react';
import { Search, Filter, ShoppingBag, Star, User, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, DollarSign, Clock, ListOrdered, Plus, Edit2, Trash2, Cake, FileText, AlertTriangle } from 'lucide-react';
import { useCustomerLoyalty } from '../../hooks/useCustomerLoyalty';
import { formatCurrency, isTodayBirthday } from '../../shared/utils/mathEngine';
import { CustomerDetailModal } from './crm/CustomerDetailModal';
import { NewCustomerModal } from './crm/NewCustomerModal';
import { CustomerProfile } from '../../types';

type SortDirection = 'asc' | 'desc';
type SortKey = keyof CustomerProfile | 'lastOrderAt';

export const AdminCRM: React.FC = () => {
  const { customers, addCustomer, editCustomer, removeCustomer } = useCustomerLoyalty();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<CustomerProfile | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<CustomerProfile | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'lastOrderAt', direction: 'desc' });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSort = (key: SortKey) => {
      setSortConfig((current) => {
          if (current.key === key) return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
          if (key === 'name') return { key, direction: 'asc' };
          return { key, direction: 'desc' }; 
      });
  };

  const filteredCustomers = useMemo(() => {
      // Safe Rendering: Default to empty array
      const safeCustomers = customers || [];
      
      let result = safeCustomers.filter(c => 
          (c?.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
          (c?.whatsapp && c.whatsapp.includes(searchTerm))
      );

      result = result.sort((a, b) => {
          if (!a || !b) return 0; // Protection against null items
          
          const aValue = a[sortConfig.key];
          const bValue = b[sortConfig.key];
          
          if (sortConfig.key === 'lastOrderAt') {
             const dateA = a.lastOrderAt ? new Date(a.lastOrderAt).getTime() : 0;
             const dateB = b.lastOrderAt ? new Date(b.lastOrderAt).getTime() : 0;
             return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
          }
          
          // Safe comparison
          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
      });
      return result;
  }, [customers, searchTerm, sortConfig]);

  const totalPages = Math.ceil((filteredCustomers?.length || 0) / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers?.slice(indexOfFirstItem, indexOfLastItem) || [];

  useMemo(() => { setCurrentPage(1); }, [searchTerm, itemsPerPage, sortConfig]);

  const openWhatsApp = (e: React.MouseEvent, phone?: string) => {
      e.stopPropagation();
      if (!phone) return;
      const rawPhone = phone.replace(/\D/g, '');
      const target = rawPhone.length <= 11 ? `55${rawPhone}` : rawPhone;
      window.open(`https://wa.me/${target}`, '_blank');
  };

  const handlePageChange = (pageNumber: number) => {
      if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  const handleSaveCustomer = (data: any) => {
      if (customerToEdit) editCustomer({ ...customerToEdit, ...data });
      else addCustomer(data);
      
      setIsAddModalOpen(false);
      setCustomerToEdit(null);
  };

  const handleConfirmDelete = () => {
      if (customerToDelete?.id) {
          removeCustomer(customerToDelete.id);
          setCustomerToDelete(null);
      }
  };

  const SortableHeader = ({ label, field }: { label: string, field: SortKey }) => {
      const isActive = sortConfig.key === field;
      return (
          <th className="px-4 py-5 cursor-pointer group transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/80 text-center align-middle whitespace-nowrap" onClick={() => handleSort(field)}>
              <div className="flex items-center justify-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-[#EA2831]' : 'text-slate-600 dark:text-slate-300'}`}>{label}</span>
                  <div className="flex flex-col -space-y-1">
                      <ChevronUp className={`w-2.5 h-2.5 ${isActive && sortConfig.direction === 'asc' ? 'text-[#EA2831] stroke-[3px]' : 'text-slate-300 dark:text-slate-600'}`} />
                      <ChevronDown className={`w-2.5 h-2.5 ${isActive && sortConfig.direction === 'desc' ? 'text-[#EA2831] stroke-[3px]' : 'text-slate-300 dark:text-slate-600'}`} />
                  </div>
              </div>
          </th>
      );
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out] pb-20" onClick={() => setIsFilterOpen(false)}>
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-2">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Gestão de Clientes</h1>
                <p className="text-sm text-slate-500 font-medium mt-1">Entenda o comportamento e a fidelidade do seu público.</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative group flex-1 md:w-[320px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-[#EA2831] transition-colors" />
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar cliente..." className="w-full pl-10 pr-4 py-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#EA2831] outline-none transition-all" />
                </div>
                <button onClick={(e) => { e.stopPropagation(); setCustomerToEdit(null); setIsAddModalOpen(true); }} className="flex items-center gap-2 px-5 py-3 bg-[#EA2831] hover:bg-red-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-500/20 transition-all active:scale-95 whitespace-nowrap">
                    <Plus className="w-4 h-4 stroke-[3]" /> Novo Cliente
                </button>
                <div className="relative">
                    <button onClick={(e) => { e.stopPropagation(); setIsFilterOpen(!isFilterOpen); }} className={`p-3 rounded-xl border transition-all shadow-sm group active:scale-95 flex items-center gap-2 ${isFilterOpen ? 'bg-[#EA2831] text-white border-[#EA2831]' : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-800 text-slate-600 dark:text-white hover:border-[#EA2831] hover:text-[#EA2831]'}`} title="Filtros Rápidos">
                        <Filter className="w-5 h-5" />
                    </button>
                    {isFilterOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-surface-dark rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-20 animate-[slideDown_0.2s_ease-out]">
                            <div className="p-2 space-y-1">
                                <button onClick={() => setSortConfig({key: 'lastOrderAt', direction: 'desc'})} className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 text-slate-600 hover:bg-gray-50 hover:text-[#EA2831]"><Clock className="w-3.5 h-3.5" /> Mais Recentes</button>
                                <button onClick={() => setSortConfig({key: 'totalSpent', direction: 'desc'})} className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 text-slate-600 hover:bg-gray-50 hover:text-[#EA2831]"><DollarSign className="w-3.5 h-3.5" /> Maior Gasto</button>
                                <button onClick={() => setSortConfig({key: 'name', direction: 'asc'})} className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 text-slate-600 hover:bg-gray-50 hover:text-[#EA2831]"><ListOrdered className="w-3.5 h-3.5" /> Ordem A-Z</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* LISTA */}
        <div className="bg-white dark:bg-surface-dark rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 select-none">
                        <tr>
                            <SortableHeader label="Cliente" field="name" />
                            <th className="px-4 py-5 text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest text-center align-middle cursor-default">Contato</th>
                            <th className="px-4 py-5 text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest text-center align-middle cursor-default">Nascimento</th>
                            <th className="px-4 py-5 text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest text-center align-middle cursor-default">Obs</th>
                            <SortableHeader label="Pontos" field="points" />
                            <SortableHeader label="Pedidos" field="orderCount" />
                            {/* Visual Distinction for Action Columns */}
                            <th className="px-4 py-5 text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest text-center align-middle cursor-default bg-gray-100/50 dark:bg-gray-800/30 border-l border-gray-200 dark:border-gray-700">Informações</th>
                            <th className="px-4 py-5 text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest text-center align-middle cursor-default border-l border-gray-200 dark:border-gray-700">Gestão</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {currentCustomers.map((customer) => {
                            // Safe Rendering Check
                            if (!customer) return null;

                            return (
                                <tr key={customer.id} className="group hover:bg-gray-50/50 transition-colors">
                                    
                                    {/* CLIENTE */}
                                    <td className="px-4 py-5 align-middle text-center cursor-pointer" onClick={() => setSelectedCustomer(customer)}>
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="size-10 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-slate-500 font-black text-xs group-hover:bg-primary/10 group-hover:text-primary transition-colors overflow-hidden shrink-0">
                                                {customer.photo ? <img src={customer.photo} alt={customer.name} className="w-full h-full object-cover" /> : (customer.name || '?').substring(0, 1).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col items-start min-w-[120px]">
                                                <span className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{customer.name || 'Sem nome'}</span>
                                                <span className="text-[10px] text-slate-400 font-black font-display">{formatCurrency(customer.totalSpent || 0)}</span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* CONTATO */}
                                    <td className="px-4 py-5 text-center align-middle cursor-pointer" onClick={() => setSelectedCustomer(customer)}>
                                        {customer.whatsapp ? (
                                            <button onClick={(e) => openWhatsApp(e, customer.whatsapp)} className="inline-block px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-[10px] font-black uppercase tracking-wide shadow-sm" title={`Conversar com ${customer.whatsapp}`}>WhatsApp</button>
                                        ) : <span className="text-slate-300 text-xs">-</span>}
                                    </td>

                                    {/* NASCIMENTO */}
                                    <td className="px-4 py-5 text-center align-middle cursor-pointer" onClick={() => setSelectedCustomer(customer)}>
                                        {customer.birthDate ? (
                                            <div className={`flex items-center justify-center gap-1.5 ${isTodayBirthday(customer.birthDate) ? 'text-pink-600 font-black bg-pink-50 px-2 py-1 rounded-lg animate-pulse' : 'text-slate-500'}`}>
                                                <Cake className="w-3.5 h-3.5" />
                                                <span className="text-xs font-bold">{customer.birthDate.substring(0,5)}</span>
                                            </div>
                                        ) : <span className="text-slate-300">-</span>}
                                    </td>

                                    {/* OBS */}
                                    <td className="px-4 py-5 text-center align-middle cursor-pointer" onClick={() => setSelectedCustomer(customer)}>
                                        {customer.observations ? (
                                            <div className="flex items-center justify-center text-yellow-600 bg-yellow-50 size-8 rounded-lg mx-auto border border-yellow-200" title={customer.observations}>
                                                <FileText className="w-4 h-4" />
                                            </div>
                                        ) : <span className="text-slate-300">-</span>}
                                    </td>

                                    {/* PONTOS */}
                                    <td className="px-4 py-5 text-center align-middle cursor-pointer" onClick={() => setSelectedCustomer(customer)}>
                                        <div className="flex items-center justify-center gap-1.5">
                                            <div className="flex items-center gap-1 text-xs font-bold text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/10 px-2 py-1 rounded-lg border border-yellow-100 dark:border-yellow-900/20">
                                                <Star className="w-3 h-3 fill-current" />{customer.points || 0}
                                            </div>
                                        </div>
                                    </td>

                                    {/* PEDIDOS */}
                                    <td className="px-4 py-5 text-center align-middle cursor-pointer" onClick={() => setSelectedCustomer(customer)}>
                                        <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-gray-800 rounded-lg text-slate-600 dark:text-gray-300 font-bold text-xs"><ShoppingBag className="w-3 h-3" />{customer.orderCount || 0}</div>
                                    </td>
                                    
                                    {/* INFORMAÇÕES (Visual Separated Column) */}
                                    <td className="px-4 py-5 text-center align-middle bg-gray-50/30 dark:bg-gray-800/10 border-l border-r border-gray-100 dark:border-gray-800/50">
                                        <button 
                                            onClick={(e) => { 
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setSelectedCustomer(customer); 
                                            }} 
                                            className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 mx-auto"
                                        >
                                            Ver Mais
                                        </button>
                                    </td>

                                    {/* GESTÃO (Visual Separated Column) */}
                                    <td className="px-4 py-5 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    setCustomerToEdit(customer); 
                                                    setIsAddModalOpen(true); 
                                                }} 
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" 
                                                title="Editar Cliente"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            
                                            <button 
                                                type="button" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCustomerToDelete(customer);
                                                }}
                                                className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
                                                title="Excluir Cliente"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {currentCustomers.length === 0 && (
                            <tr>
                                <td colSpan={9} className="px-8 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3 text-slate-300"><User className="w-12 h-12 opacity-20" /><p className="font-bold text-xs uppercase tracking-widest">Nenhum cliente encontrado</p></div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION FOOTER */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exibir:</span>
                    <div className="flex items-center gap-1 bg-white dark:bg-surface-dark p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                        {[10, 25, 50, 100].map(val => <button key={val} onClick={() => setItemsPerPage(val)} className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-colors ${itemsPerPage === val ? 'bg-[#EA2831] text-white' : 'text-slate-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{val}</button>)}
                    </div>
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Mostrando {Math.min(indexOfFirstItem + 1, filteredCustomers?.length || 0)} - {Math.min(indexOfLastItem, filteredCustomers?.length || 0)} de {filteredCustomers?.length || 0} resultados
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-slate-500 hover:bg-white hover:text-[#EA2831] disabled:opacity-50 disabled:cursor-not-allowed transition-all"><ChevronLeft className="w-4 h-4" /></button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1).map((page, index, array) => {
                            const isGap = index > 0 && page - array[index - 1] > 1;
                            return (
                                <React.Fragment key={page}>
                                    {isGap && <span className="text-slate-400 text-xs px-1">...</span>}
                                    <button onClick={() => handlePageChange(page)} className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${currentPage === page ? 'bg-[#EA2831] text-white shadow-md shadow-red-500/30' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}>{page}</button>
                                </React.Fragment>
                            );
                        })}
                    </div>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-slate-500 hover:bg-white hover:text-[#EA2831] disabled:opacity-50 disabled:cursor-not-allowed transition-all"><ChevronRight className="w-4 h-4" /></button>
                </div>
            </div>
        </div>

        {selectedCustomer && <CustomerDetailModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />}
        {isAddModalOpen && <NewCustomerModal onClose={() => { setIsAddModalOpen(false); setCustomerToEdit(null); }} onSave={handleSaveCustomer} initialData={customerToEdit} />}

        {/* MODAL CUSTOMIZADO DE EXCLUSÃO */}
        {customerToDelete && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s]">
                <div className="bg-white dark:bg-surface-dark rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-[slideUp_0.3s] text-center border-4 border-red-50 dark:border-red-900/20">
                    <div className="size-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 animate-bounce">
                        <AlertTriangle className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Excluir Permanente?</h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                        Você está prestes a remover <span className="font-bold text-slate-900 dark:text-white">"{customerToDelete.name}"</span> do sistema. Essa ação não poderá ser desfeita.
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setCustomerToDelete(null)}
                            className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-sm uppercase tracking-wider transition-all"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleConfirmDelete}
                            className="flex-1 py-4 bg-[#EA2831] hover:bg-red-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-red-500/20 transition-all active:scale-95"
                        >
                            Sim, Excluir
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
