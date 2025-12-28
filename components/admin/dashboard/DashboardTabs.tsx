
import React from 'react';
import { 
    LayoutDashboard, 
    DollarSign, 
    Users, 
    Activity, // Trocado para representar Operação melhor
    ShoppingBag, 
    Megaphone 
} from 'lucide-react';

export type DashboardTab = 'RESUMO' | 'VENDAS' | 'OPERACAO' | 'CLIENTES' | 'PEDIDOS' | 'MARKETING';

interface DashboardTabsProps {
    activeTab: DashboardTab;
    onChange: (tab: DashboardTab) => void;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({ activeTab, onChange }) => {
    const tabs = [
        { id: 'RESUMO', label: 'Resumo', icon: LayoutDashboard },
        { id: 'VENDAS', label: 'Vendas', icon: DollarSign },
        { id: 'OPERACAO', label: 'Operação', icon: Activity },
        { id: 'CLIENTES', label: 'Clientes', icon: Users },
        // Mantendo extras caso precise expandir depois, mas focando nos 4 principais
        { id: 'PEDIDOS', label: 'Pedidos', icon: ShoppingBag },
        { id: 'MARKETING', label: 'Marketing', icon: Megaphone },
    ];

    return (
        <div className="sticky top-0 z-[100] bg-white dark:bg-background-dark w-full flex justify-center border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-200">
            <div className="flex items-center gap-8 overflow-x-auto no-scrollbar px-4 pt-4">
                {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onChange(tab.id as DashboardTab)}
                            className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all relative whitespace-nowrap group ${
                                isActive 
                                ? 'text-[#EA2831]' 
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'stroke-[3px]' : 'stroke-[2px]'}`} />
                            {tab.label}
                            
                            {/* Barra de Ativação */}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#EA2831] rounded-t-full shadow-[0_-2px_6px_rgba(234,40,49,0.3)]"></div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
