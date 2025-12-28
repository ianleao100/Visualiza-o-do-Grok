import React, { useState } from 'react';
import { Button } from '../Button';
import { AdminDashboard } from './AdminDashboard';
import { AdminMenuManager } from './AdminMenuManager';
import { AdminCRM } from './AdminCRM';
import { LayoutDashboard, Menu, Settings, LogOut, Users } from 'lucide-react';

interface AdminLayoutProps {
  onLogout: () => void;
}

type AdminViewType = 'DASHBOARD' | 'MENU' | 'CRM';

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onLogout }) => {
  const [activeView, setActiveView] = useState<AdminViewType>('DASHBOARD');

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 transition-all">
        <div className="p-6 border-b border-slate-800">
           <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveView('DASHBOARD')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeView === 'DASHBOARD' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveView('MENU')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeView === 'MENU' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Menu className="w-5 h-5 mr-3" />
            Menu Management
          </button>
          <button 
            onClick={() => setActiveView('CRM')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeView === 'CRM' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Users className="w-5 h-5 mr-3" />
            Customers (CRM)
          </button>
          <button className="w-full flex items-center px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Button variant="secondary" onClick={onLogout} className="w-full justify-start">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen bg-slate-50">
        {activeView === 'DASHBOARD' && <AdminDashboard onLogout={onLogout} />}
        {activeView === 'MENU' && <AdminMenuManager />}
        {activeView === 'CRM' && <AdminCRM />}
      </main>
    </div>
  );
};