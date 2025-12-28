
import React from 'react';
import { ChefHat } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f6f6] dark:bg-background-dark transition-colors">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-[#EA2831]/20 rounded-full blur-xl animate-pulse"></div>
        <div className="relative bg-[#EA2831] p-6 rounded-3xl shadow-xl shadow-red-500/30 animate-bounce">
          <ChefHat className="w-12 h-12 text-white" strokeWidth={2.5} />
        </div>
      </div>
      <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white animate-pulse">
        Carregando Dreamlícias...
      </h2>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
        Preparando o sistema
      </p>
    </div>
  );
};
