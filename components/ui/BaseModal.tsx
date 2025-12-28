
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BaseModalProps {
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
  hideCloseButton?: boolean;
  title?: string;
}

export const BaseModal: React.FC<BaseModalProps> = ({ 
  children, 
  onClose, 
  className = '',
  hideCloseButton = false,
  title
}) => {
  
  // 4. Limpeza de Scroll: Trava o scroll do body enquanto o modal está aberto
  useEffect(() => {
    // Salva o estilo original
    const originalStyle = window.getComputedStyle(document.body).overflow;
    // Aplica o bloqueio
    document.body.style.overflow = 'hidden';
    
    // Cleanup ao fechar
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    // 1. Reset de Posicionamento e 3. Garantia de Centralização
    // Utilizando !important (!) para sobrescrever qualquer estilo pai restritivo
    <div className="fixed !inset-0 !top-0 !left-0 !w-screen !h-screen !m-0 !p-4 !z-[99999] flex items-center justify-center pointer-events-auto">
      
      {/* Overlay Blackout (Fundo Escuro) */}
      <div 
        className="absolute !inset-0 !w-full !h-full bg-black/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      ></div>
      
      {title ? (
        // MODO CARD PADRÃO (Para Sangria, Suprimento, Avisos)
        <div className={`relative z-10 w-full bg-white dark:bg-surface-dark rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] animate-[slideUp_0.3s] overflow-hidden ${className}`}>
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-surface-dark">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h3>
                {!hideCloseButton && (
                    <button 
                        onClick={onClose} 
                        className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
            <div className="p-8 overflow-y-auto no-scrollbar">
                {children}
            </div>
        </div>
      ) : (
        // MODO RAW (Para Layouts Complexos como PDV)
        <div className={`relative z-10 w-full ${className} animate-[slideUp_0.3s] max-h-[95vh] flex flex-col`}>
            {!hideCloseButton && (
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-white/50 dark:bg-black/50 rounded-full hover:bg-red-500 hover:text-white transition-all z-50 backdrop-blur-sm"
                >
                    <X className="w-5 h-5" />
                </button>
            )}
            {children}
        </div>
      )}
    </div>
  );
};
