
import React, { useState, useCallback } from 'react';
import { ShoppingBag, Utensils, DollarSign, Users, LogOut, History, Store, ChevronLeft, ChevronRight, ChefHat, Bike } from 'lucide-react';
import { useCashRegister } from '../../hooks/useCashRegister';
import { useCustomerLoyalty } from '../../hooks/useCustomerLoyalty';

// Sub-Modules
import { FinanceManager } from './finances/FinanceManager';
import { ProPOS } from './pos/ProPOS';
import { KitchenManager } from './kitchen/KitchenManager';
import { SalesHistory } from './history/SalesHistory';
import ProCustomers from '../pro/ProCustomers'; 
import MenuEditor from '../admin/menu/MenuEditor'; 

interface ProfessionalViewProps {
  onLogout: () => void;
}

type ProTab = 'FINANCES' | 'POS' | 'KITCHEN_LOCAL' | 'DELIVERY_ORDERS' | 'MENU' | 'CUSTOMERS' | 'HISTORY';

export const ProfessionalView: React.FC<ProfessionalViewProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<ProTab>('FINANCES');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Hooks Globais de Estado
  const cashierRegistry = useCashRegister();
  const loyaltySystem = useCustomerLoyalty();

  // Handlers Otimizados com useCallback
  const handleOpenPOS = useCallback(() => {
      setActiveTab('POS');
  }, []);

  const handleBackToFinances = useCallback(() => {
      setActiveTab('FINANCES');
  }, []);

  const toggleSidebar = useCallback(() => {
      setIsSidebarOpen(prev => !prev);
  }, []);

  const navItems = [
    { id: 'FINANCES' as ProTab, label: 'Caixa', icon: DollarSign },
    { id: 'KITCHEN_LOCAL' as ProTab, label: 'Cozinha', icon: ChefHat }, // Ícone Chef
    { id: 'DELIVERY_ORDERS' as ProTab, label: 'Pedidos', icon: Bike }, // Ícone Moto
    { id: 'MENU' as ProTab, label: 'Cardápio', icon: Utensils },
    { id: 'CUSTOMERS' as ProTab, label: 'Clientes', icon: Users },
    { id: 'HISTORY' as ProTab, label: 'Histórico', icon: History },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'FINANCES': 
        return (
          <FinanceManager 
            cashierRegistry={cashierRegistry}
            onOpenPOS={handleOpenPOS} 
          />
        );
      case 'POS': 
        return (
            <ProPOS 
                onBack={handleBackToFinances}
                cashierRegistry={cashierRegistry}
                loyaltySystem={loyaltySystem}
            />
        );
      case 'KITCHEN_LOCAL': return <KitchenManager mode="KITCHEN" />;
      case 'DELIVERY_ORDERS': return <KitchenManager mode="DELIVERY" />;
      case 'MENU': return <MenuEditor />;
      case 'CUSTOMERS': return <ProCustomers loyaltySystem={loyaltySystem} />;
      case 'HISTORY': return <SalesHistory />;
      default: return null;
    }
  };

  if (activeTab === 'POS') {
      return renderContent();
  }

  return (
    <div className="flex h-screen bg-[#f8f6f6] dark:bg-background-dark overflow-hidden font-display transition-colors">
      
      {/* Sidebar Retrátil */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-surface-dark transition-all duration-300 flex flex-col shrink-0 z-50 shadow-xl relative`}>
        
        {/* Toggle Button */}
        <button 
            onClick={toggleSidebar}
            className="absolute -right-5 top-24 h-12 w-5 bg-[#EA2831] hover:bg-red-700 rounded-r-xl flex items-center justify-center text-white transition-all shadow-md z-50 active:scale-95 group"
            title={isSidebarOpen ? "Recolher Menu" : "Expandir Menu"}
        >
            {isSidebarOpen ? (
                <ChevronLeft className="w-3 h-3 stroke-[4]" />
            ) : (
                <ChevronRight className="w-3 h-3 stroke-[4]" />
            )}
        </button>

        <div className={`p-6 flex items-center gap-3 border-b border-gray-50 dark:border-gray-800 h-28 ${isSidebarOpen ? '' : 'justify-center px-2'}`}>
          <div className="bg-[#EA2831] p-2.5 rounded-2xl shrink-0 shadow-lg shadow-red-500/20"><Store className="w-6 h-6 text-white" /></div>
          {isSidebarOpen && (
              <div className="flex flex-col overflow-hidden whitespace-nowrap animate-[fadeIn_0.3s]">
                  <span className="font-black text-xl tracking-tight leading-none text-slate-900 dark:text-white">Dreamlícias</span>
                  <span className="text-[9px] uppercase tracking-[0.25em] text-[#EA2831] font-bold mt-1.5 opacity-90">PRO PANEL</span>
              </div>
          )}
        </div>

        <nav className="flex-1 py-8 px-3 space-y-2 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id)} 
                title={!isSidebarOpen ? item.label : ''}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${
                    isActive 
                    ? 'bg-[#EA2831] text-white shadow-xl shadow-red-500/20' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-[#EA2831]'
                } ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`w-5 h-5 shrink-0 stroke-[2px] transition-transform group-hover:scale-110`} />
                {isSidebarOpen && <span className="font-black text-[13px] tracking-tight">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gray-50 dark:border-gray-800">
          <button 
            onClick={onLogout} 
            className={`w-full flex items-center gap-4 px-4 py-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl transition-all group ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
            title={!isSidebarOpen ? 'Sair' : ''}
          >
            <LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform stroke-[2px]" />
            {isSidebarOpen && <span className="font-black text-[13px]">Sair do Painel</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 relative h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 no-scrollbar h-full">{renderContent()}</div>
      </main>
    </div>
  );
};
