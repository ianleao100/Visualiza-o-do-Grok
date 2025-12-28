
import React, { useState } from 'react';
import { AdminTab } from '../../types';
import { AdminSidebar } from './AdminSidebar';
import { DashboardOverview } from './tabs/DashboardOverview';
import { AdminMenuManager } from './AdminMenuManager';
import { AdminCRM } from './AdminCRM';
import { AdminReports } from './reports/AdminReports';
import { AdminMarketing } from './marketing/AdminMarketing';
import { AdminSettings } from './settings/AdminSettings';
import { SalesHistory } from '../professional/history/SalesHistory';
import { AdminFinancial } from './financial/AdminFinancial';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case 'DASHBOARD':
        return <DashboardOverview />;
      case 'MENU':
        return <AdminMenuManager />;
      case 'CRM':
        return <AdminCRM />;
      case 'HISTORY':
        return <SalesHistory />;
      case 'FINANCIAL':
        return <AdminFinancial />;
      case 'REPORTS':
        return <AdminReports />;
      case 'MARKETING':
        return <AdminMarketing />;
      case 'SETTINGS':
        return <AdminSettings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f6f6] dark:bg-background-dark font-display overflow-hidden text-slate-900 dark:text-white transition-colors">
      
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 relative h-full overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-8 no-scrollbar h-full">
              {renderContent()}
          </main>
      </div>
    </div>
  );
};
