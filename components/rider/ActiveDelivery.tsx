
import React, { useState, useRef } from 'react';
import { MapPin, Navigation, Phone, CheckCircle, Camera, Package, AlertTriangle, ShieldCheck, User, ArrowRight } from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { formatCurrency } from '../../shared/utils/mathEngine';

interface ActiveDeliveryProps {
    order: Order;
    onUpdateStatus: (order: Order, status: OrderStatus) => void;
    totalStops?: number;
    currentStopIndex?: number;
}

export default function ActiveDelivery({ order, onUpdateStatus, totalStops, currentStopIndex }: ActiveDeliveryProps) {
    const [validationCode, setValidationCode] = useState('');
    const [showCamera, setShowCamera] = useState(false);
    
    // Mock Location for Demo (Fallback se order não tiver coords)
    const latitude = order.coordinates?.lat || -23.550520;
    const longitude = order.coordinates?.lng || -46.633308;

    const handleOpenGPS = () => {
        window.open(`https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`, '_blank');
    };

    const handleWhatsApp = () => {
        const phone = order.customerWhatsapp?.replace(/\D/g, '');
        if (phone) window.open(`https://wa.me/55${phone}`, '_blank');
    };

    const handleValidateCode = () => {
        if (validationCode === order.code || validationCode === '0000') { 
            onUpdateStatus(order, OrderStatus.DELIVERED);
        } else {
            alert('Código Inválido! Tente novamente.');
        }
    };

    const handleTakePhoto = () => {
        setShowCamera(false);
        onUpdateStatus(order, OrderStatus.DELIVERED);
    };

    const [viewState, setViewState] = useState<'ROUTE' | 'VALIDATION'>('ROUTE');

    if (viewState === 'ROUTE') {
        return (
            <div className="flex-1 flex flex-col bg-white h-full animate-[slideIn_0.3s]">
                {/* INFO CARD GIGANTE */}
                <div className="flex-1 p-6 flex flex-col justify-center gap-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <User className="w-4 h-4" /> Cliente
                            </span>
                            <h2 className="text-4xl font-black text-black leading-tight">{order.customerName}</h2>
                        </div>
                        {order.sector && (
                            <div className="bg-slate-100 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest text-slate-500">
                                Zona {order.sector}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="p-6 bg-gray-50 border-2 border-gray-200 rounded-3xl">
                            <div className="flex items-start gap-4">
                                <MapPin className="w-8 h-8 text-[#EA2831] shrink-0 mt-1" />
                                <div>
                                    <p className="text-2xl font-bold text-gray-800 leading-snug">{order.address}</p>
                                    <p className="text-sm font-bold text-gray-400 mt-2 uppercase">Pagamento: {order.paymentMethod}</p>
                                    {(order as any).changeFor && (
                                        <p className="text-sm font-black text-red-600 mt-1 uppercase bg-red-50 inline-block px-2 py-1 rounded">
                                            Troco para R$ {(order as any).changeFor}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Indicador de Próximas Entregas (Se houver) */}
                        {totalStops && totalStops > 1 && (
                            <div className="text-center">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Mais {totalStops - (currentStopIndex || 1)} entregas nesta rota
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ACTION BUTTONS GRID */}
                    <div className="grid grid-cols-2 gap-4 mt-auto">
                        <button 
                            onClick={handleOpenGPS}
                            className="h-24 bg-blue-600 text-white rounded-3xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform shadow-xl"
                        >
                            <Navigation className="w-8 h-8" />
                            <span className="font-black text-lg uppercase tracking-wider">Abrir GPS</span>
                        </button>
                        <button 
                            onClick={handleWhatsApp}
                            className="h-24 bg-green-600 text-white rounded-3xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform shadow-xl"
                        >
                            <Phone className="w-8 h-8" />
                            <span className="font-black text-lg uppercase tracking-wider">WhatsApp</span>
                        </button>
                    </div>
                </div>

                {/* BOTTOM ACTION */}
                <div className="p-6 pb-8 bg-white border-t border-gray-100">
                    <button 
                        onClick={() => setViewState('VALIDATION')}
                        className="w-full h-20 bg-black text-white rounded-full font-black text-xl uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-transform"
                    >
                        <MapPin className="w-6 h-6" /> Cheguei no Local
                    </button>
                </div>
            </div>
        );
    }

    if (viewState === 'VALIDATION') {
        return (
            <div className="flex-1 flex flex-col bg-[#EA2831] h-full text-white animate-[slideUp_0.3s]">
                <div className="p-8 pt-12 flex flex-col items-center text-center gap-6">
                    <ShieldCheck className="w-20 h-20" />
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tight">Validar Entrega</h2>
                        <p className="text-white/80 font-bold mt-2">Solicite o código ao cliente</p>
                    </div>
                </div>

                <div className="flex-1 bg-white rounded-t-[40px] p-8 flex flex-col gap-8 shadow-2xl">
                    {/* INPUT CODE */}
                    <div className="space-y-4">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block text-center">Código de Segurança</label>
                        <input 
                            type="tel" 
                            maxLength={6}
                            value={validationCode}
                            onChange={(e) => setValidationCode(e.target.value)}
                            placeholder="000000"
                            className="w-full h-24 text-center text-5xl font-black tracking-[0.5em] border-b-4 border-gray-200 focus:border-[#EA2831] outline-none text-black placeholder:text-gray-200 transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-4 mt-auto">
                        <button 
                            onClick={handleValidateCode}
                            disabled={validationCode.length < 4}
                            className="h-20 w-full bg-[#EA2831] disabled:bg-gray-300 text-white rounded-3xl font-black text-xl uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95"
                        >
                            <CheckCircle className="w-8 h-8" /> 
                            {totalStops && totalStops > (currentStopIndex || 1) ? 'Próxima Entrega' : 'Finalizar Rota'}
                        </button>
                        
                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase">OU</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <button 
                            onClick={() => setShowCamera(true)}
                            className="h-16 w-full bg-black text-white rounded-3xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform"
                        >
                            <Camera className="w-6 h-6" /> Foto Comprovante
                        </button>
                        
                        <button 
                            onClick={() => setViewState('ROUTE')}
                            className="text-gray-400 font-bold text-sm uppercase p-4"
                        >
                            Voltar para Rota
                        </button>
                    </div>
                </div>

                {/* MOCK CAMERA OVERLAY */}
                {showCamera && (
                    <div className="fixed inset-0 z-[200] bg-black flex flex-col">
                        <div className="flex-1 bg-gray-900 relative">
                            {/* Viewfinder Mock */}
                            <div className="absolute inset-0 border-[2px] border-white/30 m-8 rounded-3xl"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-white/50 font-bold uppercase tracking-widest">
                                Câmera Ativa
                            </div>
                        </div>
                        <div className="h-32 bg-black flex items-center justify-center gap-10">
                            <button onClick={() => setShowCamera(false)} className="text-white font-bold uppercase">Cancelar</button>
                            <button onClick={handleTakePhoto} className="size-20 bg-white rounded-full border-4 border-gray-300 active:scale-90 transition-transform"></button>
                            <div className="w-16"></div> {/* Spacer */}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return null;
}