import React, { useState, useRef, useEffect } from 'react';

// Global definition for Leaflet
declare const L: any;

interface AddressData {
    id: string;
    label: string;
    icon: string;
    street: string;
    number: string;
    district: string;
    complement: string;
    reference: string;
    lat?: number;
    lng?: number;
}

interface AddressManagerProps {
    initialData?: AddressData;
    onClose: () => void;
    onSave: (address: AddressData) => void;
}

const Icon: React.FC<{ name: string, className?: string, style?: React.CSSProperties }> = ({ name, className = "", style }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{name}</span>
);

export const AddressManager: React.FC<AddressManagerProps> = ({ initialData, onClose, onSave }) => {
    const initialAddressState = { 
        id: '', label: '', icon: 'home', street: '', number: '', district: '', complement: '', reference: '', ...initialData 
    };
    
    const [addressForm, setAddressForm] = useState<AddressData>(initialAddressState);
    const [coords, setCoords] = useState<{lat: number, lng: number}>({
        lat: initialData?.lat || -14.2233,
        lng: initialData?.lng || -42.7766
    });

    // Map Refs
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);

    const addressIcons = [
        { id: 'home', label: 'Casa' },
        { id: 'work', label: 'Trabalho' },
        { id: 'star', label: 'Favorito' },
        { id: 'location_on', label: 'Outro' }
    ];

    const inputClasses = "w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#ea2a33] focus:border-[#ea2a33] outline-none transition-all placeholder:text-gray-400";

    // Initialize Map
    useEffect(() => {
        const timer = setTimeout(() => {
            if (mapContainerRef.current && !mapInstanceRef.current) {
                const redPinIcon = L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });

                const map = L.map(mapContainerRef.current, {
                    center: [coords.lat, coords.lng],
                    zoom: 16,
                    zoomControl: false,
                    attributionControl: false
                });

                L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                    maxZoom: 20,
                    subdomains: 'abcd',
                }).addTo(map);

                const marker = L.marker([coords.lat, coords.lng], {
                    draggable: true,
                    icon: redPinIcon
                }).addTo(map);

                marker.on('dragend', function(event: any) {
                    const position = marker.getLatLng();
                    setCoords({ lat: position.lat, lng: position.lng });
                });
                
                map.on('click', function(e: any) {
                    marker.setLatLng(e.latlng);
                    setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
                });

                mapInstanceRef.current = map;
                markerRef.current = marker;
            }
        }, 200);
        return () => clearTimeout(timer);
    }, []);

    const handleZoomIn = () => {
        if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
    };

    const handleZoomOut = () => {
        if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
    };

    const handleSave = () => {
        if (addressForm.street && addressForm.label) {
            onSave({
                ...addressForm,
                lat: coords.lat,
                lng: coords.lng
            });
        } else {
            alert("Por favor, preencha o nome do endereço e a rua.");
        }
    };

    return (
        <div className="fixed inset-0 z-[70] bg-white dark:bg-background-dark flex flex-col animate-[slideUp_0.3s_ease-out]">
            <header className="sticky top-0 z-50 flex items-center bg-[#f8f6f6] dark:bg-background-dark p-4 pb-2 justify-between border-b border-gray-200/50 dark:border-gray-800/50">
                <button onClick={onClose} className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer text-slate-900 dark:text-white"><Icon name="arrow_back_ios_new" /></button>
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight flex-1 text-center pr-10">
                    {initialData?.id ? 'Editar Endereço' : 'Novo Endereço'}
                </h2>
            </header>
            <div className="flex-1 overflow-y-auto">
                {/* Interactive Map */}
                <div className="p-4 pb-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Localização no Mapa</h3>
                    <div className="relative w-full h-56 bg-slate-200 dark:bg-zinc-800 rounded-xl overflow-hidden shadow-sm border border-gray-300 dark:border-gray-600 isolate">
                        <div ref={mapContainerRef} className="w-full h-full z-10 absolute inset-0" />
                        
                        <div className="absolute top-3 left-3 z-[400] pointer-events-none">
                            <div className="bg-white/90 dark:bg-surface-dark/90 px-3 py-1.5 rounded-lg shadow-sm border border-black/5 dark:border-white/5 text-[10px] font-bold text-slate-700 dark:text-white">
                                Arraste para ajustar
                            </div>
                        </div>

                        <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-[400]">
                            <button onClick={handleZoomIn} className="w-8 h-8 bg-white dark:bg-surface-dark rounded-lg shadow flex items-center justify-center text-slate-600 dark:text-gray-300 hover:text-[#ea2a33] transition-colors">
                                <Icon name="add" className="text-lg" />
                            </button>
                            <button onClick={handleZoomOut} className="w-8 h-8 bg-white dark:bg-surface-dark rounded-lg shadow flex items-center justify-center text-slate-600 dark:text-gray-300 hover:text-[#ea2a33] transition-colors">
                                <Icon name="remove" className="text-lg" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Endereço</h3>
                    
                    <div className="flex items-center gap-4 mb-4">
                        <label className="text-sm font-bold text-gray-500 shrink-0">Ícone do Endereço</label>
                        <div className="flex gap-2">
                            {addressIcons.map((iconOption) => (
                                <button
                                    key={iconOption.id}
                                    onClick={() => setAddressForm({ ...addressForm, icon: iconOption.id })}
                                    className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all ${
                                        addressForm.icon === iconOption.id
                                            ? 'bg-[#ea2a33] border-[#ea2a33] text-white'
                                            : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50'
                                    }`}
                                    title={iconOption.label}
                                >
                                    <Icon name={iconOption.id} className="text-lg" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <input placeholder="Nome (Ex: Casa, Trabalho)" className={inputClasses} value={addressForm.label} onChange={e => setAddressForm({...addressForm, label: e.target.value})} />
                    <div className="flex gap-4">
                        <input placeholder="Rua" className={`flex-[2] ${inputClasses}`} value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} />
                        <input placeholder="Nº" className={`flex-1 ${inputClasses}`} value={addressForm.number} onChange={e => setAddressForm({...addressForm, number: e.target.value})} />
                    </div>
                    <input placeholder="Bairro" className={inputClasses} value={addressForm.district} onChange={e => setAddressForm({...addressForm, district: e.target.value})} />
                    <input placeholder="Complemento (Opcional)" className={inputClasses} value={addressForm.complement} onChange={e => setAddressForm({...addressForm, complement: e.target.value})} />
                    <input placeholder="Ponto de Referência" className={inputClasses} value={addressForm.reference} onChange={e => setAddressForm({...addressForm, reference: e.target.value})} />
                </div>
            </div>
            <div className="flex gap-4 p-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button onClick={onClose} className="flex-1 bg-gray-200 dark:bg-gray-700 text-slate-700 dark:text-gray-300 font-bold py-3.5 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
                <button onClick={handleSave} className="flex-1 bg-[#ea2a33] text-white font-bold py-3.5 rounded-lg shadow-md shadow-[#ea2a33]/30 hover:bg-[#d6252d] transition-colors">Salvar</button>
            </div>
        </div>
    );
};