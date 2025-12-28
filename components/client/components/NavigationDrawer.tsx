
import React from 'react';
import { ClientViewMode } from '../../../types';

interface NavigationDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (view: ClientViewMode) => void;
    onBack: () => void;
}

const Icon: React.FC<{ name: string }> = ({ name }) => (
  <span className="material-symbols-outlined">{name}</span>
);

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ isOpen, onClose, onNavigate, onBack }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex">
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>
            <div className="relative w-[80%] max-w-[300px] bg-surface-light dark:bg-surface-dark h-full shadow-2xl p-6 flex flex-col gap-6 animate-[slideIn_0.3s_ease-out]">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-extrabold text-primary tracking-tight">Dreamlícias</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                        <Icon name="close" />
                    </button>
                </div>
                <nav className="flex flex-col mt-4">
                    <button onClick={() => { onClose(); onBack(); }} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 font-bold transition-all text-left text-gray-800 dark:text-white">
                        <div className="p-2 text-gray-600 dark:text-gray-400"><Icon name="home" /></div> Início
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-gray-800 mx-4"></div>
                    <button onClick={() => { onClose(); onNavigate('ORDERS'); }} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 font-bold transition-all text-left text-gray-800 dark:text-white">
                        <div className="p-2 text-gray-600 dark:text-gray-400"><Icon name="receipt_long" /></div> Histórico
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-gray-800 mx-4"></div>
                    <button onClick={() => { onClose(); onNavigate('REVIEWS'); }} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 font-bold transition-all text-left text-gray-800 dark:text-white">
                            <div className="p-2 text-gray-600 dark:text-gray-400"><Icon name="star" /></div> Avaliações
                    </button>
                </nav>
            </div>
        </div>
    );
};
