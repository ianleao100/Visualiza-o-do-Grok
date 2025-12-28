
import { useState, useRef, useEffect, useMemo } from 'react';
import { Product, CartItem } from '../types';
import { menuService } from '../services/storage/menuService';
import { storageService } from '../services/storageService';

interface UseMenuLogicProps {
    initialProducts?: Product[];
    cart: CartItem[];
    onAddToCart: (item: CartItem) => void;
}

export const useMenuLogic = ({ initialProducts, cart, onAddToCart }: UseMenuLogicProps) => {
    // Data State (Centralized here)
    const [products, setProducts] = useState<Product[]>(initialProducts || []);
    
    // UI State
    const [search, setSearch] = useState<string>('');
    const [activeCategory, setActiveCategory] = useState<string>('ALL');
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Load Data Effect
    useEffect(() => {
        // If initialProducts not provided or empty, load from storage
        if (!initialProducts || initialProducts.length === 0) {
            const loaded = storageService.getProducts();
            setProducts(loaded);
        } else {
            setProducts(initialProducts);
        }
    }, [initialProducts]);

    // Constants
    const categoryDisplayNames: Record<string, { label: string, icon: string }> = {
        'Individual': { label: 'Executivos', icon: 'person' },
        'Equipe': { label: 'Para o Time', icon: 'groups' },
        'Eventos': { label: 'Coffee & Drinks', icon: 'coffee' }
    };

    // --- Filtering Logic ---
    const getProductsByCategory = (categoryKey: string) => {
        return products.filter(p => {
            const matchesCategory = activeCategory === 'ALL' || p.category === categoryKey;
            // Strict category check for the section rendering loop
            const belongsToSection = p.category === categoryKey;
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
            
            return matchesCategory && belongsToSection && matchesSearch;
        });
    };

    const featuredProducts = useMemo(() => {
        // Simple logic: first 6 items as featured if no search
        if (activeCategory === 'ALL' && !search) {
            return [...products].slice(0, 6);
        }
        return [];
    }, [products, activeCategory, search]);

    // --- Carousel Logic ---
    const scrollRef = useRef<HTMLDivElement>(null);
    const isPausedRef = useRef<boolean>(false);
    const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        let animationFrameId: number;
        const speed = 0.5;

        const autoScroll = () => {
            if (!isPausedRef.current && scrollContainer) {
                if (scrollContainer.scrollLeft >= (scrollContainer.scrollWidth / 2)) {
                    scrollContainer.scrollLeft = 0; 
                } else {
                    scrollContainer.scrollLeft += speed;
                }
            }
            animationFrameId = requestAnimationFrame(autoScroll);
        };

        animationFrameId = requestAnimationFrame(autoScroll);
        return () => cancelAnimationFrame(animationFrameId);
    }, [products]);

    const handleInteractionStart = () => {
        if (resumeTimeoutRef.current) {
            clearTimeout(resumeTimeoutRef.current);
            resumeTimeoutRef.current = null;
        }
        isPausedRef.current = true;
    };

    const handleInteractionEnd = () => {
        if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = setTimeout(() => {
            isPausedRef.current = false;
        }, 5000);
    };

    // --- Cart Wrappers ---
    const handleAddToCart = (item: CartItem) => {
        onAddToCart(item);
        setSelectedProduct(null);
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return {
        // State
        products,
        search,
        setSearch,
        activeCategory,
        setActiveCategory,
        isMenuOpen,
        setIsMenuOpen,
        selectedProduct,
        setSelectedProduct,
        
        // Data/Constants
        categoryDisplayNames,
        getProductsByCategory,
        featuredProducts,
        
        // Carousel
        scrollRef,
        handleInteractionStart,
        handleInteractionEnd,
        
        // Handlers & Derived
        handleAddToCart,
        cartTotal,
        cartItemCount
    };
};
