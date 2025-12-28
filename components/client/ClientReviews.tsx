import React, { useState } from 'react';

interface Review {
  id: string;
  userName: string;
  userImage: string;
  rating: number;
  date: string;
  comment: string;
  hasPhoto?: boolean;
}

interface ClientReviewsProps {
    onBack: () => void;
    reviews: Review[];
}

const Icon: React.FC<{ name: string, className?: string, style?: React.CSSProperties }> = ({ name, className = "", style }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{name}</span>
);

export const ClientReviews: React.FC<ClientReviewsProps> = ({ onBack, reviews }) => {
    const [reviewFilter, setReviewFilter] = useState<'ALL' | 'RECENT' | 'COMMENTS' | 'PHOTOS'>('RECENT');

    const filteredReviews = reviews.filter(r => {
        if (reviewFilter === 'ALL') return true;
        if (reviewFilter === 'RECENT') return true; 
        if (reviewFilter === 'COMMENTS') return r.comment.length > 0;
        if (reviewFilter === 'PHOTOS') return r.hasPhoto;
        return true;
    });

    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-200">
        <style>{`
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            .filled-icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        `}</style>
        
        <div className="sticky top-0 z-20 bg-white dark:bg-background-dark border-b border-gray-200 dark:border-gray-800 transition-colors">
            <div className="flex items-center px-4 py-3 justify-between">
                <button onClick={onBack} className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-slate-800 dark:text-white">
                    <Icon name="arrow_back_ios_new" className="text-[24px]" />
                </button>
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Avaliações</h2>
                <div className="w-10"></div>
            </div>
        </div>

        <div className="flex-1 flex flex-col pb-24">
            <div className="bg-white dark:bg-[#2a1a1a] px-6 py-8 shadow-sm flex flex-col items-center justify-center gap-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-7xl font-bold text-slate-900 dark:text-white tracking-tight">4.8</span>
                <div className="flex items-center gap-1.5 text-yellow-400 my-1">
                    <span className="material-symbols-outlined filled-icon text-[32px]">star</span>
                    <span className="material-symbols-outlined filled-icon text-[32px]">star</span>
                    <span className="material-symbols-outlined filled-icon text-[32px]">star</span>
                    <span className="material-symbols-outlined filled-icon text-[32px]">star</span>
                    <span className="material-symbols-outlined filled-icon text-[32px]">star_half</span>
                </div>
            </div>
            
            <div className="mt-6 px-4 mb-4">
                <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                    {['Todas', 'Recentes', 'Comentários', 'Com Fotos'].map((filter) => {
                        const mapKey = filter === 'Todas' ? 'ALL' : filter === 'Recentes' ? 'RECENT' : filter === 'Comentários' ? 'COMMENTS' : 'PHOTOS';
                        const isActive = reviewFilter === mapKey;
                        return (
                            <button 
                                key={mapKey}
                                onClick={() => setReviewFilter(mapKey as any)} 
                                className={`px-4 py-2 text-sm font-bold rounded-full whitespace-nowrap transition-all ${isActive ? 'bg-[#ea2a33] text-white shadow-md shadow-[#ea2a33]/30' : 'bg-white dark:bg-[#2a1a1a] border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                            >
                                {filter}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-col gap-4 px-4 pb-4">
                {filteredReviews.map(review => (
                    <div key={review.id} className="bg-white dark:bg-[#2a1a1a] rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800/50">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                {review.userImage ? (
                                    <img src={review.userImage} alt={review.userName} className="size-10 rounded-full object-cover" />
                                ) : (
                                    <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                                        {review.userName.substring(0,2).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <span className="block font-bold text-slate-900 dark:text-white text-[16px]">{review.userName}</span>
                                    <div className="flex items-center gap-0.5">
                                        {[1,2,3,4,5].map(star => (
                                            <Icon key={star} name="star" className={`text-[14px] ${star <= review.rating ? 'text-yellow-400 filled-icon' : 'text-gray-300'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400 font-medium">{review.date}</span>
                        </div>
                        <p className="text-[15px] text-slate-600 dark:text-gray-300 leading-relaxed">
                            {review.comment}
                        </p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
};