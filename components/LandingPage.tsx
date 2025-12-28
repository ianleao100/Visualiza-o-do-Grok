
import React from 'react';
import { ViewState } from '../types';
import { LandingHeader } from './landing/LandingHeader';
import { LandingHero } from './landing/LandingHero';
import { LandingFeatures } from './landing/LandingFeatures';
import { LandingFooter } from './landing/LandingFooter';
import { Bike } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: ViewState) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col relative pb-20">
      <LandingHeader onNavigate={onNavigate} />
      
      <main className="flex-grow">
        <LandingHero onNavigate={onNavigate} />
        <LandingFeatures />
      </main>

      <LandingFooter onNavigate={onNavigate} />

      {/* RIDER ACCESS DOCK */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-50 flex justify-center pointer-events-none">
        <button 
            onClick={() => onNavigate('RIDER_LOGIN')}
            className="pointer-events-auto bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all border-2 border-slate-700 group"
        >
            <div className="bg-[#EA2831] p-1.5 rounded-full">
                <Bike className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-sm uppercase tracking-wider">Acesso Entregador</span>
        </button>
      </div>
    </div>
  );
};