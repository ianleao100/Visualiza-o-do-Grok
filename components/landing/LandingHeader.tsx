
import React from 'react';
import { ChefHat, Bike } from 'lucide-react';
import { Button } from '../Button';
import { ViewState } from '../../types';

interface LandingHeaderProps {
  onNavigate: (view: ViewState) => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ onNavigate }) => {
  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-orange-600 p-2 rounded-lg">
            <ChefHat className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-slate-900">DeliveryMaster AI</span>
        </div>
        <div className="flex gap-2">
           <Button variant="ghost" onClick={() => onNavigate('CLIENT_LOGIN')}>Sign In</Button>
           <Button variant="outline" onClick={() => onNavigate('RIDER_LOGIN')} className="hidden sm:flex border-orange-200 text-orange-600 hover:bg-orange-50">
              <Bike className="w-4 h-4 mr-2" /> Entregador
           </Button>
           <Button onClick={() => onNavigate('CLIENT_MENU')}>Order Now</Button>
        </div>
      </div>
    </nav>
  );
};