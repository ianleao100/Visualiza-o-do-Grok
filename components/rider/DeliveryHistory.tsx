
import React from 'react';
import { Package, DollarSign } from 'lucide-react';
import { Order } from '../../types';
import { formatCurrency } from '../../shared/utils/mathEngine';

interface DeliveryHistoryProps {
    deliveries: Order[];
}

export default function DeliveryHistory({ deliveries }: DeliveryHistoryProps) {
    const totalEarnings = deliveries.reduce((acc, order) => acc + (order.deliveryFee || 0), 0);

    return (
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-6 pb-8 shrink-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="size-12 bg-white rounded-2xl flex items-center justify-center border border-gray-200 shadow-sm">
                        <Package className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Entregas Hoje</p>
                        <p className="text-2xl font-black text-black leading-none">{deliveries.length}</p>
                    </div>
                </div>

                <div className="h-10 w-px bg-gray-300 mx-4"></div>

                <div className="flex items-center gap-4 text-right">
                    <div className="flex flex-col items-end">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Saldo Estimado</p>
                        <p className="text-2xl font-black text-[#EA2831] leading-none">{formatCurrency(totalEarnings)}</p>
                    </div>
                    <div className="size-12 bg-[#EA2831] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                        <DollarSign className="w-6 h-6" />
                    </div>
                </div>
            </div>
        </div>
    );
}