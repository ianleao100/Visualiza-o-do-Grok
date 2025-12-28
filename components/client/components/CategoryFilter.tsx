
import React from 'react';

interface CategoryFilterProps {
    categories: Record<string, { label: string, icon: string }>;
    activeCategory: string;
    onSelectCategory: (category: string) => void;
}

const Icon: React.FC<{ name: string, className?: string }> = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, activeCategory, onSelectCategory }) => {
    return (
        <div className="flex items-center gap-3 overflow-x-auto px-4 pb-4 no-scrollbar">
            <button 
                onClick={() => onSelectCategory('ALL')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                    activeCategory === 'ALL' 
                    ? 'bg-primary border-primary text-white shadow-md shadow-primary/30' 
                    : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-700 text-gray-500'
                }`}
            >
                <Icon name="grid_view" className="text-[18px]" />
                Todos
            </button>
            {Object.entries(categories).map(([catKey, data]) => {
                const categoryData = data as { label: string, icon: string };
                return (
                    <button 
                        key={catKey}
                        onClick={() => onSelectCategory(catKey)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                            activeCategory === catKey 
                            ? 'bg-primary border-primary text-white shadow-md shadow-primary/30' 
                            : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-700 text-gray-500'
                        }`}
                    >
                        <Icon name={categoryData.icon} className="text-[18px]" />
                        {categoryData.label}
                    </button>
                );
            })}
        </div>
    );
};
