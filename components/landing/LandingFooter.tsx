import React from 'react';
import { Users, ShieldCheck } from 'lucide-react';
import { Button } from '../Button';
import { ViewState } from '../../types';

interface LandingFooterProps {
  onNavigate: (view: ViewState) => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">DeliveryMaster AI</h3>
            <p className="text-slate-400">The smartest way to manage food delivery.</p>
          </div>
          <div className="flex flex-col items-start md:items-end space-y-4">
            <h3 className="text-lg font-semibold">Employee Access</h3>
            <div className="flex gap-4">
              <Button variant="secondary" onClick={() => onNavigate('PROFESSIONAL_LOGIN')}>
                <Users className="w-4 h-4 mr-2" />
                Staff Login
              </Button>
              <Button variant="secondary" onClick={() => onNavigate('ADMIN_LOGIN')}>
                <ShieldCheck className="w-4 h-4 mr-2" />
                Admin Login
              </Button>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
          &copy; 2024 DeliveryMaster AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};