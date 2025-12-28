import { useState, useCallback } from 'react';

interface UseCustomerSearchProps {
    loyaltySystem: any;
}

export const useCustomerSearch = ({ loyaltySystem }: UseCustomerSearchProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [customerFound, setCustomerFound] = useState(false);

    const handleSearch = useCallback((val: string, currentName: string) => {
        setSearchTerm(val);
        
        // Reset status se o usuário alterar o texto após selecionar
        if (customerFound && val !== currentName) {
            setCustomerFound(false);
        }

        if (val.length > 0) {
            const searchClean = val.toLowerCase().trim();
            const phoneDigits = val.replace(/\D/g, '');
            
            // Pool de busca: Apenas clientes reais do sistema
            const searchPool = [...(loyaltySystem?.customers || [])];
            
            // Filtro
            const matches = searchPool.filter((c: any) => {
                const cName = c.name.toLowerCase();
                const cPhone = c.whatsapp.replace(/\D/g, '');
                
                // Busca por Nome ou Telefone (parcial)
                return cName.includes(searchClean) || (phoneDigits.length >= 3 && cPhone.includes(phoneDigits));
            });

            // Remove duplicatas
            const uniqueMatches = Array.from(new Map(matches.map((item: any) => [item.whatsapp, item])).values());

            setSuggestions(uniqueMatches);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [loyaltySystem, customerFound]);

    const clearSuggestions = () => {
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return {
        searchTerm,
        setSearchTerm,
        suggestions,
        showSuggestions,
        customerFound,
        setCustomerFound,
        handleSearch,
        clearSuggestions
    };
};