
import React from 'react';

interface CartFloatingButtonProps {
    count: number;
    total: number;
    onClick: () => void;
}

const Icon: React.FC<{ name: string, className?: string }> = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

export const CartFloatingButton: React.FC<CartFloatingButtonProps> = ({ count, total, onClick }) => {
    if (count === 0) return null;

    return (
        <div className="fixed bottom-6 left-4 right-4 z-50">
            <button onClick={onClick} className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-14 shadow-[0_8px_30px_rgb(48,20,184,0.3)] flex items-center justify-between px-4 transition-all active:scale-[0.98]">
                <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-white/20 text-white text-sm font-bold">{count}</div>
                    <span className="font-extrabold text-lg">Ver Pedido</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg">R$ {total.toFixed(2)}</span>
                    <Icon name="arrow_forward_ios" className="ml-1 text-[20px] font-bold" />
                </div>
            </button>
        </div>
    );
};
