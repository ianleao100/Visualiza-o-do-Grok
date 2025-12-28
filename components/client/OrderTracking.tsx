
import React from 'react';
import { Order, OrderStatus } from '../../types';

interface OrderTrackingProps {
    order: Order;
    onClose: () => void;
}

const Icon: React.FC<{ name: string, className?: string, style?: React.CSSProperties }> = ({ name, className = "", style }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{name}</span>
);

export const OrderTracking: React.FC<OrderTrackingProps> = ({ order, onClose }) => {
    
    const getStepStatus = (step: OrderStatus) => {
        const orderSequence = [
            OrderStatus.PENDING,
            OrderStatus.CONFIRMED,
            OrderStatus.PREPARING,
            OrderStatus.READY,
            OrderStatus.DELIVERED
        ];
        
        const currentIndex = orderSequence.indexOf(order.status);
        const stepIndex = orderSequence.indexOf(step);

        if (order.status === OrderStatus.CANCELLED && step === OrderStatus.CONFIRMED) return 'REJECTED';
        if (currentIndex > stepIndex) return 'COMPLETED';
        if (currentIndex === stepIndex) return 'ACTIVE';
        return 'PENDING';
    };

    const steps = [
        { status: OrderStatus.PENDING, label: 'Aguardando Confirmação', sub: 'Aguarde o restaurante aceitar', icon: 'hourglass_empty' },
        { status: OrderStatus.CONFIRMED, label: 'Pedido Confirmado', sub: 'O restaurante aceitou seu pedido', icon: 'check' },
        { status: OrderStatus.PREPARING, label: 'Em Preparo', sub: 'Sua comida está sendo feita', icon: 'skillet' },
        { status: OrderStatus.READY, label: 'Saiu para Entrega', sub: 'O entregador está a caminho', icon: 'motorcycle' },
        { status: OrderStatus.DELIVERED, label: 'Entregue', sub: 'Pedido recebido', icon: 'home' }
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-background-dark flex flex-col animate-[slideUp_0.3s_ease-out]">
            
            {/* Header - Tela Cheia (100%) */}
            <header className="flex items-center justify-between px-6 py-5 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800 shrink-0">
                <h2 className="text-xl font-extrabold text-[#121118] dark:text-white tracking-tight">Acompanhar Pedido</h2>
                <button onClick={onClose} className="size-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all active:scale-90">
                    <Icon name="close" className="text-2xl" />
                </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-8">
                {/* Delivery Code Card */}
                <div className="bg-[#fff9f2] dark:bg-orange-900/10 rounded-[32px] p-8 border border-[#ffe9d1] dark:border-orange-900/30 flex flex-col items-center justify-center text-center mb-12 shadow-sm">
                    <span className="text-xs font-extrabold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-[0.2em]">Código de Entrega</span>
                    <span className="text-6xl font-[900] text-[#EA2831] tracking-wider leading-none">
                        {order.code || '237283'}
                    </span>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-5 max-w-[260px] leading-relaxed font-medium">
                        Apresente este código ao entregador para confirmar a entrega e finalizar o pedido.
                    </p>
                </div>

                {/* Timeline - Com Visibilidade Melhorada nos Itens Inativos */}
                <div className="relative pl-14 space-y-10 pb-12">
                    {/* Linha Vertical Contínua */}
                    <div className="absolute left-[24px] top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-800"></div>

                    {steps.map((step, index) => {
                        const currentStatus = getStepStatus(step.status);
                        
                        const isCompleted = currentStatus === 'COMPLETED';
                        const isActive = currentStatus === 'ACTIVE';
                        const isRejected = currentStatus === 'REJECTED';
                        const isPending = currentStatus === 'PENDING';
                        
                        const isNextStepReached = index < steps.length - 1 && 
                                               getStepStatus(steps[index + 1].status) !== 'PENDING';

                        return (
                            <div key={step.status} className={`relative flex items-center gap-6 transition-all duration-500 ${isPending ? 'opacity-70' : 'opacity-100'}`}>
                                
                                {/* Linha Vertical entre etapas */}
                                {index < steps.length - 1 && (
                                    <div className={`absolute left-[-30px] top-10 w-0.5 h-10 transition-colors duration-700 ${isNextStepReached ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-800'}`}></div>
                                )}

                                {/* Icon Circle - Tamanho Dinâmico */}
                                <div className={`relative z-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${
                                    isActive ? 'size-12 bg-[#f1c40f] text-white animate-pulse scale-100' : 'size-9 bg-gray-50 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700'
                                } ${
                                    isRejected ? 'bg-red-500 text-white shadow-red-500/20' : 
                                    isCompleted ? 'bg-white dark:bg-surface-dark text-green-500 border-2 border-green-500 shadow-none' : ''
                                }`}>
                                    <Icon 
                                        name={isRejected ? 'close' : (isCompleted ? 'check' : step.icon)} 
                                        className={`${isActive ? 'text-[24px]' : 'text-[16px]'} font-bold transition-all`} 
                                    />
                                    {isActive && (
                                        <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-ping"></div>
                                    )}
                                </div>

                                {/* Text Content - Visibilidade Melhorada */}
                                <div className="flex flex-col transition-all duration-500">
                                    <h4 className={`font-extrabold leading-tight transition-all ${
                                        isActive ? 'text-[18px] text-[#c09400] dark:text-[#f1c40f]' : 'text-[14px] text-gray-500 dark:text-gray-400'
                                    } ${
                                        isRejected ? 'text-red-600' : 
                                        (isCompleted ? 'text-green-600/60' : '')
                                    }`}>
                                        {isRejected ? 'Pedido Rejeitado' : step.label}
                                    </h4>
                                    <p className={`transition-all ${isActive ? 'text-[13px] opacity-100 mt-1' : 'text-[11px] opacity-0 h-0 overflow-hidden'} text-gray-500 dark:text-gray-400 font-medium`}>
                                        {isRejected ? 'O restaurante não pôde aceitar seu pedido' : step.sub}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer - Vermelho com Indicador de Pulso em Tempo Real */}
            <div className="p-6 bg-red-50/50 dark:bg-red-900/5 border-t border-red-100 dark:border-red-900/20">
                <div className="flex items-center justify-center gap-2">
                    <div className="size-2 bg-[#EA2831] rounded-full animate-pulse shadow-[0_0_8px_#EA2831]"></div>
                    <p className="text-center text-[10px] text-[#EA2831] font-extrabold uppercase tracking-[0.2em]">Acompanhando em tempo real</p>
                </div>
            </div>
        </div>
    );
};
