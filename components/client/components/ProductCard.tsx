
import React, { memo } from 'react';
import { Product } from '../../../types';

interface ProductCardProps {
    product: Product;
    onClick: (product: Product) => void;
    variant?: 'featured' | 'list';
}

const Icon: React.FC<{ name: string, className?: string, style?: React.CSSProperties }> = ({ name, className = "", style }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{name}</span>
);

export const ProductCard = memo<ProductCardProps>(({ product, onClick, variant = 'list' }) => {
    const isAvailable = product.available !== false;

    if (variant === 'featured') {
        return (
            <div 
                onClick={() => isAvailable && onClick(product)} 
                className={`shrink-0 w-[190px] rounded-2xl bg-surface-light dark:bg-surface-dark p-3 shadow-md transition-all dark:shadow-none dark:border dark:border-gray-800 ${!isAvailable ? 'opacity-60 grayscale pointer-events-none' : 'cursor-pointer active:scale-95 hover:shadow-lg'}`}
            >
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-3">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform hover:scale-105 duration-500" style={{backgroundImage: `url('${product.imageUrl}')`}}></div>
                    {!isAvailable && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
                            <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">Esgotado</span>
                        </div>
                    )}
                    {isAvailable && (
                        <div className="absolute top-2 right-2 z-10">
                            <span className="material-symbols-outlined text-yellow-400 text-[24px] drop-shadow-md" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-lg text-[#121118] dark:text-white line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 h-8">{product.description}</p>
                    <div className="mt-2">
                        <span className="text-lg font-extrabold text-[#121118] dark:text-white">R$ {product.price.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div 
            onClick={() => isAvailable && onClick(product)} 
            className={`flex items-stretch justify-between gap-4 rounded-xl bg-surface-light dark:bg-surface-dark p-3 shadow-sm border border-transparent dark:border-gray-800 transition-all ${!isAvailable ? 'opacity-60 grayscale pointer-events-none' : 'cursor-pointer active:scale-[0.98]'}`}
        >
            <div className="flex flex-col justify-between flex-[2_2_0px] py-1">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[#121118] dark:text-white text-base font-bold leading-tight">{product.name}</h3>
                        {!isAvailable && (
                            <span className="bg-red-100 text-red-600 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">Esgotado</span>
                        )}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed line-clamp-2">{product.description}</p>
                </div>
                <p className="text-[#121118] dark:text-white text-lg font-extrabold mt-2">R$ {product.price.toFixed(2)}</p>
            </div>
            <div className="relative w-28 h-28 shrink-0">
                <div className="w-full h-full bg-center bg-cover rounded-lg" style={{backgroundImage: `url('${product.imageUrl}')`}}></div>
                {!isAvailable && (
                    <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                        <Icon name="block" className="text-white text-3xl opacity-80" />
                    </div>
                )}
            </div>
        </div>
    );
});
