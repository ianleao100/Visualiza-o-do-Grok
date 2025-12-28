
import React, { useState, Suspense, lazy } from 'react';
import { LandingPage } from './components/LandingPage';
import { ClientView } from './components/ClientView';
import { AuthForm } from './components/auth/AuthForm';
import { ViewState, UserRole } from './types';
import { LoadingScreen } from './components/ui/LoadingScreen';

// Code Splitting: Lazy Load Heavy Dashboards
// Utiliza .then para lidar com Named Exports (export const ...)
const ProfessionalView = lazy(() => import('./components/professional/ProfessionalView').then(module => ({ default: module.ProfessionalView })));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const RiderDashboard = lazy(() => import('./components/rider/RiderDashboard').then(module => ({ default: module.RiderDashboard })));

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('LANDING');

  // Simple login simulation
  const handleLogin = (role: UserRole) => {
    if (role === UserRole.CLIENT) setCurrentView('CLIENT_MENU');
    if (role === UserRole.PROFESSIONAL) setCurrentView('PROFESSIONAL_DASHBOARD');
    if (role === UserRole.ADMIN) setCurrentView('ADMIN_DASHBOARD');
    if (role === UserRole.RIDER) setCurrentView('RIDER_DASHBOARD');
  };

  const renderView = () => {
    switch (currentView) {
      case 'LANDING':
        return <LandingPage onNavigate={setCurrentView} />;
      
      case 'CLIENT_LOGIN':
        return <AuthForm title="Client Login" role={UserRole.CLIENT} onLogin={handleLogin} onCancel={() => setCurrentView('LANDING')} />;
      case 'CLIENT_MENU':
        return <ClientView onBack={() => setCurrentView('LANDING')} />;
      
      case 'PROFESSIONAL_LOGIN':
        return <AuthForm title="Professional Portal" role={UserRole.PROFESSIONAL} onLogin={handleLogin} onCancel={() => setCurrentView('LANDING')} />;
      case 'PROFESSIONAL_DASHBOARD':
        return <ProfessionalView onLogout={() => setCurrentView('LANDING')} />;
      
      case 'ADMIN_LOGIN':
        return <AuthForm title="Administrator Access" role={UserRole.ADMIN} onLogin={handleLogin} onCancel={() => setCurrentView('LANDING')} />;
      case 'ADMIN_DASHBOARD':
        return <AdminDashboard onLogout={() => setCurrentView('LANDING')} />;

      case 'RIDER_LOGIN':
        return <AuthForm title="Entregador Parceiro" role={UserRole.RIDER} onLogin={handleLogin} onCancel={() => setCurrentView('LANDING')} />;
      case 'RIDER_DASHBOARD':
        return <RiderDashboard onLogout={() => setCurrentView('LANDING')} />;
        
      default:
        return <LandingPage onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="font-sans text-slate-900">
      <Suspense fallback={<LoadingScreen />}>
        {renderView()}
      </Suspense>
    </div>
  );
}
