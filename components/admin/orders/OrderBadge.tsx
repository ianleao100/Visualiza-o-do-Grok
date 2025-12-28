
import React from 'react';
import { Layers, Bike, Zap } from 'lucide-react';
import { Order } from '../../../types';

interface OrderBadgeProps {
    order: Order;
}

export const OrderBadge: React.FC<OrderBadgeProps> = ({ order }) => {
    // Determina o estilo baseado na origem explícita ou fallback para propriedades antigas
    let type: 'MESA' | 'DELIVERY' | 'BALCAO' = 'BALCAO';
    
    if (order.origin) {
        type = order.origin;
    } else {
        // Fallback para compatibilidade
        if (order.isDelivery) type = 'DELIVERY';
        else if (order.tableNumber) type = 'MESA';
    }

    switch (type) {
        case 'MESA':
            return (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <Layers className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase tracking-wider">
                        Mesa {order.tableNumber}
                    </span>
                </div>
            );
        case 'DELIVERY':
            return (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                    <Bike className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase tracking-wider">
                        Delivery
                    </span>
                </div>
            );
        default: // BALCAO
            return (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                    <Zap className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase tracking-wider">
                        Balcão
                    </span>
                </div>
            );
    }
};
