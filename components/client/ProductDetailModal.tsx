
import React, { useState, useEffect } from 'react';
import { Product, CartItem, ProductExtra } from '../../types';
import { storageService } from '../../services/storageService';

interface ProductDetailModalProps {
    product: Product | null;
    onClose: () => void;
    onAddToCart: (item: CartItem) => void;
}

const Icon: React.FC<{ name: string, className?: string, style?: React.CSSProperties }> = ({ name, className = "", style }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{name}</span>
);

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onAddToCart }) => {
    const [modalQuantity, setModalQuantity] = useState<number>(1);
    const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
    const [availableExtras, setAvailableExtras] = useState<ProductExtra[]>([]);

    useEffect(() => {
        if (product) {
            setModalQuantity(1);
            setSelectedExtras([]);
            
            // Carrega todos os extras globais
            const allExtras = storageService.getExtras();
            
            // Filtra: 1. Precisa estar ativo globalmente (já vem do getExtras)
            // 2. Precisa estar ativo especificamente para este produto
            const filtered = allExtras.filter(e => 
                e.available && storageService.isExtraAvailableForProduct(product.id, e.id)
            );
            
            setAvailableExtras(filtered);
        }
    }, [product]);

    const toggleExtra = (extraId: string) => {
        setSelectedExtras(prev => 
            prev.includes(extraId) ? prev.filter(id => id !== extraId) : [...prev, extraId]
        );
    };

    const handleAddToCart = () => {
        if (!product) return;

        const extrasDetails = availableExtras.filter(e => selectedExtras.includes(e.id));
        const extrasTotal = extrasDetails.reduce((sum, e) => sum + e.price, 0);
        const finalPrice = product.price + extrasTotal;

        const cartItem: CartItem = { 
            ...product, 
            price: finalPrice, 
            quantity: modalQuantity,
            selectedExtras: extrasDetails // Passa os objetos completos
        };

        onAddToCart(cartItem);
    };

    if (!product) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>
            
            {/* Modal Content - Fullscreen Mobile / Card Desktop */}
            <div className="relative w-full h-full lg:h-auto lg:max-w-5xl lg:aspect-[16/9] lg:max-h-[85vh] bg-surface-light dark:bg-surface-dark shadow-2xl overflow-y-auto lg:overflow-hidden no-scrollbar flex flex-col lg:flex-row animate-[slideUp_0.3s_ease-out] lg:rounded-3xl">
                
                {/* Image Section - Top Mobile / Left Desktop */}
                <div className="relative h-72 lg:h-full w-full lg:w-1/2 shrink-0">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    
                    {/* Close Button - Responsive Position */}
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-black/30 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/50 transition-colors z-10"
                    >
                        <Icon name="close" />
                    </button>
                </div>

                {/* Content Section - Bottom Mobile / Right Desktop */}
                <div className="flex-1 flex flex-col w-full lg:w-1/2 lg:h-full lg:min-h-0 bg-surface-light dark:bg-surface-dark">
                    
                    {/* Scrollable Content */}
                    <div className="p-6 lg:flex-1 lg:overflow-y-auto no-scrollbar">
                        <div className="mb-3">
                            <h2 className="text-2xl font-bold text-[#121118] dark:text-white leading-tight">{product.name}</h2>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">{product.description}</p>

                        {/* Extras Section */}
                        {availableExtras.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Adicionais</h3>
                                <div className="space-y-3">
                                    {availableExtras.map(extra => (
                                        <div 
                                            key={extra.id}
                                            onClick={() => toggleExtra(extra.id)}
                                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedExtras.includes(extra.id) ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-200 dark:border-gray-700'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`size-5 rounded border flex items-center justify-center ${selectedExtras.includes(extra.id) ? 'bg-primary border-primary' : 'border-gray-400'}`}>
                                                    {selectedExtras.includes(extra.id) && <Icon name="check" className="text-white text-xs" />}
                                                </div>
                                                <span className="font-medium">{extra.name}</span>
                                            </div>
                                            <span className="text-primary font-bold">+ R$ {extra.price.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl mb-4">
                            <span className="font-bold text-gray-700 dark:text-gray-300">Quantidade</span>
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                                    className="size-10 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-primary hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
                                    disabled={modalQuantity <= 1}
                                >
                                    <Icon name="remove" />
                                </button>
                                <span className="text-xl font-bold w-6 text-center">{modalQuantity}</span>
                                <button 
                                    onClick={() => setModalQuantity(modalQuantity + 1)}
                                    className="size-10 rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary/90"
                                >
                                    <Icon name="add" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Add to Cart Button Footer */}
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark sticky bottom-0 z-20 lg:static">
                        <button 
                            onClick={handleAddToCart}
                            className="w-full bg-primary text-white font-bold h-14 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-between px-6 hover:bg-primary/90 transition-transform active:scale-[0.98]"
                        >
                            <span>Adicionar ao Pedido</span>
                            <span className="bg-white/20 px-2 py-1 rounded text-sm">
                                R$ {((product.price + availableExtras.filter(e => selectedExtras.includes(e.id)).reduce((s, e) => s + e.price, 0)) * modalQuantity).toFixed(2)}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};