
import React, { useCallback, memo } from 'react';
import { 
    LayoutDashboard, 
    Utensils, 
    Users, 
    FileText, 
    History, 
    DollarSign, 
    Megaphone, 
    Settings, 
    LogOut,
    ChevronLeft,
    ChevronRight,
    ShieldCheck
} from 'lucide-react';
import { AdminTab } from '../../types';

interface AdminSidebarProps {
    activeTab: AdminTab;
    setActiveTab: (tab: AdminTab) => void;
    onLogout: () => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export const AdminSidebar = memo<AdminSidebarProps>(({ 
    activeTab, 
    setActiveTab, 
    onLogout, 
    isOpen, 
    setIsOpen 
}) => {
    
    const toggleSidebar = useCallback(() => {
        setIsOpen(!isOpen);
    }, [isOpen, setIsOpen]);

    const handleTabClick = useCallback((id: AdminTab) => {
        setActiveTab(id);
    }, [setActiveTab]);

    const menuItems = [
        { id: 'DASHBOARD' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'MENU' as AdminTab, label: 'Cardápio', icon: Utensils },
        { id: 'CRM' as AdminTab, label: 'CRM Clientes', icon: Users },
        { id: 'REPORTS' as AdminTab, label: 'Relatórios', icon: FileText },
        { id: 'HISTORY' as AdminTab, label: 'Histórico', icon: History },
        { id: 'FINANCIAL' as AdminTab, label: 'Financeiro', icon: DollarSign },
        { id: 'MARKETING' as AdminTab, label: 'Marketing', icon: Megaphone },
        { id: 'SETTINGS' as AdminTab, label: 'Configurações', icon: Settings },
    ];

    return (
        <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shrink-0 z-50 shadow-sm relative font-display`}>
            
            {/* Toggle Button - Redesign Pílula */}
            <button 
                onClick={toggleSidebar}
                className="absolute -right-5 top-24 h-12 w-5 bg-[#EA2831] hover:bg-red-700 rounded-r-xl flex items-center justify-center text-white transition-all shadow-md z-50 active:scale-95 group"
                title={isOpen ? "Recolher Menu" : "Expandir Menu"}
            >
                {isOpen ? (
                    <ChevronLeft className="w-3 h-3 stroke-[4]" />
                ) : (
                    <ChevronRight className="w-3 h-3 stroke-[4]" />
                )}
            </button>

            {/* Brand Header */}
            <div className={`p-6 flex items-center gap-3 border-b border-gray-100 h-28 ${isOpen ? '' : 'justify-center px-2'}`}>
                <div className="bg-[#EA2831] p-2.5 rounded-2xl shrink-0 shadow-lg shadow-red-500/20">
                    <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                {isOpen && (
                    <div className="flex flex-col overflow-hidden whitespace-nowrap animate-[fadeIn_0.3s]">
                        <span className="font-black text-xl tracking-tight leading-none text-slate-900">Dreamlícias</span>
                        <span className="text-[9px] uppercase tracking-[0.25em] text-[#EA2831] font-bold mt-1.5 opacity-90">ADMIN</span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-8 px-3 space-y-2 overflow-y-auto no-scrollbar">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button 
                            key={item.id} 
                            onClick={() => handleTabClick(item.id)} 
                            title={!isOpen ? item.label : ''}
                            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${
                                isActive 
                                ? 'bg-[#EA2831] text-white shadow-xl shadow-red-500/20' 
                                : 'text-slate-500 hover:bg-red-50 hover:text-[#EA2831]'
                            } ${!isOpen ? 'justify-center px-0' : ''}`}
                        >
                            <Icon className={`w-5 h-5 shrink-0 stroke-[2px] transition-transform group-hover:scale-110`} />
                            {isOpen && (
                                <span className={`font-black text-[13px] tracking-tight ${isActive ? 'text-white' : ''}`}>
                                    {item.label}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Logout Footer */}
            <div className="p-6 border-t border-gray-100">
                <button 
                    onClick={onLogout} 
                    className={`w-full flex items-center gap-4 px-4 py-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl transition-all group ${!isOpen ? 'justify-center px-0' : ''}`}
                    title={!isOpen ? 'Sair' : ''}
                >
                    <LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform stroke-[2px]" />
                    {isOpen && <span className="font-black text-[13px]">Sair do Sistema</span>}
                </button>
            </div>
        </aside>
    );
});
