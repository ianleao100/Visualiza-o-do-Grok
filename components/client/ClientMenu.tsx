
import React from 'react';
import { Product, CartItem, UserProfile, ClientViewMode } from '../../types';
import { ProductDetailModal } from './ProductDetailModal';
import { useMenuLogic } from '../../hooks/useMenuLogic';

// Atomic Components
import { ProductCard } from './components/ProductCard';
import { CategoryFilter } from './components/CategoryFilter';
import { NavigationDrawer } from './components/NavigationDrawer';
import { CartFloatingButton } from './components/CartFloatingButton';

interface ClientMenuProps {
    products: Product[];
    userProfile: UserProfile;
    cart: CartItem[];
    onAddToCart: (item: CartItem) => void;
    onNavigate: (view: ClientViewMode) => void;
    onBack: () => void;
}

const Icon: React.FC<{ name: string, className?: string, style?: React.CSSProperties }> = ({ name, className = "", style }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{name}</span>
);

export const ClientMenu: React.FC<ClientMenuProps> = ({ 
    products: initialProducts, 
    userProfile, 
    cart, 
    onAddToCart, 
    onNavigate, 
    onBack 
}) => {
    // Logic extraction: Component now only concerns itself with Layout.
    const {
        products, // Freshly loaded/managed by hook
        search,
        setSearch,
        activeCategory,
        setActiveCategory,
        isMenuOpen,
        setIsMenuOpen,
        selectedProduct,
        setSelectedProduct,
        categoryDisplayNames,
        getProductsByCategory,
        featuredProducts,
        scrollRef,
        handleInteractionStart,
        handleInteractionEnd,
        handleAddToCart,
        cartTotal,
        cartItemCount
    } = useMenuLogic({ initialProducts, cart, onAddToCart });

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden pb-24 bg-background-light dark:bg-background-dark text-[#121118] dark:text-gray-100">
          
          <ProductDetailModal 
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
          />

          <NavigationDrawer 
            isOpen={isMenuOpen} 
            onClose={() => setIsMenuOpen(false)} 
            onNavigate={onNavigate} 
            onBack={onBack} 
          />

          {/* Header */}
          <header className="sticky top-0 z-50 bg-surface-light dark:bg-surface-dark shadow-sm transition-colors duration-200">
            <div className="flex items-center justify-between px-4 py-3">
              <button onClick={() => setIsMenuOpen(true)} className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-[#121118] dark:text-white transition-colors">
                <Icon name="menu" />
              </button>
              <h1 className="text-xl font-extrabold tracking-tight text-primary">Dreamlícias</h1>
              <button onClick={() => { onNavigate('PROFILE'); }} className="flex size-10 items-center justify-center overflow-hidden rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-600">
                <div className="flex size-full items-center justify-center rounded-full bg-white dark:bg-surface-dark overflow-hidden">
                    {userProfile.photo ? (
                        <img src={userProfile.photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <Icon name="person" className="text-gray-800 dark:text-gray-200 text-[22px]" />
                    )}
                </div>
              </button>
            </div>
          </header>

          {/* Search & Categories */}
          <div className="bg-surface-light dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
            <div className="px-4 py-3">
                <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="search" className="text-gray-400" />
                </div>
                <input 
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors" 
                    placeholder="O que você procura hoje?" 
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                </div>
            </div>

            <CategoryFilter 
                categories={categoryDisplayNames} 
                activeCategory={activeCategory} 
                onSelectCategory={setActiveCategory} 
            />
          </div>

          {(!products || products.length === 0) ? (
             <div className="flex flex-col items-center justify-center py-20 text-center px-4 animate-[fadeIn_0.5s]">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Icon name="restaurant_menu" className="text-3xl text-gray-400" />
                </div>
                <h3 className="font-bold text-slate-700 dark:text-gray-300 text-lg">Cardápio Indisponível</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Estamos atualizando nosso menu. Volte em instantes.</p>
             </div>
          ) : (
             <>
                {/* Featured Section */}
                {featuredProducts.length > 0 && (
                    <section className="mt-4">
                        <div className="flex items-center justify-between px-4 pb-2">
                            <h2 className="text-xl font-bold leading-tight text-[#121118] dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-yellow-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                Favoritos do Mês
                            </h2>
                        </div>
                        
                        <div 
                            ref={scrollRef}
                            className="flex w-full overflow-x-auto gap-4 px-4 pb-4 no-scrollbar touch-pan-x cursor-grab"
                            onMouseEnter={handleInteractionStart}
                            onMouseLeave={handleInteractionEnd}
                            onTouchStart={handleInteractionStart}
                            onTouchEnd={handleInteractionEnd}
                        >
                            {[...featuredProducts, ...featuredProducts].map((p, idx) => (
                                <ProductCard 
                                    key={`fav-${p.id}-${idx}`}
                                    product={p}
                                    onClick={setSelectedProduct}
                                    variant="featured"
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Main Product List by Category */}
                <section className="mt-2 px-4 pb-4">
                    {Object.entries(categoryDisplayNames).map(([catKey, data]) => {
                        const catProducts = getProductsByCategory(catKey);
                        if (catProducts.length === 0) return null;

                        return (
                            <div key={catKey} className="mb-8 animate-[fadeIn_0.3s]">
                                <h2 className="text-xl font-bold leading-tight text-[#121118] dark:text-white mb-4 flex items-center gap-2">
                                    <Icon name={data.icon} className="text-primary" />
                                    {data.label}
                                </h2>
                                <div className="flex flex-col gap-4">
                                    {catProducts.map(product => (
                                        <ProductCard 
                                            key={product.id}
                                            product={product}
                                            onClick={setSelectedProduct}
                                            variant="list"
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </section>
             </>
          )}

          <CartFloatingButton 
            count={cartItemCount} 
            total={cartTotal} 
            onClick={() => onNavigate('CART')} 
          />
        </div>
    );
};
