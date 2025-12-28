import React, { useEffect, useRef } from 'react';
import { Navigation, Maximize2, Map as MapIcon, Search, MapPin } from 'lucide-react';

// Global definition for Leaflet
declare const L: any;

interface MapComponentProps {
    lat: number;
    lng: number;
    onPositionChange: (lat: number, lng: number) => void;
    onExpand?: () => void;
    manualSearchTerm: string;
    setManualSearchTerm: (term: string) => void;
    onManualSearch: () => void;
    isLoading: boolean;
    isFullScreen?: boolean; // Nova prop para controle de layout
}

const MapComponent = React.memo(({ 
    lat, 
    lng, 
    onPositionChange, 
    onExpand, 
    manualSearchTerm, 
    setManualSearchTerm, 
    onManualSearch, 
    isLoading,
    isFullScreen = false
}: MapComponentProps) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);

    // Inicialização Única
    useEffect(() => {
        if (mapContainerRef.current && !mapInstanceRef.current && typeof L !== 'undefined') {
            const map = L.map(mapContainerRef.current, {
                center: [lat, lng],
                zoom: 16,
                zoomControl: false,
                attributionControl: false
            });
            
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
            
            const redPinIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            const marker = L.marker([lat, lng], {
                draggable: true,
                icon: redPinIcon
            }).addTo(map);

            // Eventos do Leaflet (Isolados do React State principal para performance)
            marker.on('dragend', function(event: any) {
                const position = marker.getLatLng();
                onPositionChange(position.lat, position.lng);
            });

            map.on('click', function(e: any) {
                marker.setLatLng(e.latlng);
                onPositionChange(e.latlng.lat, e.latlng.lng);
            });

            mapInstanceRef.current = map;
            markerRef.current = marker;
        }
    }, []); // Array vazio intencional para rodar apenas uma vez na montagem

    // Atualização de Coordenadas (Controlada)
    useEffect(() => {
        if (mapInstanceRef.current && markerRef.current) {
            const currentLatLng = markerRef.current.getLatLng();
            // Só atualiza se a diferença for significativa para evitar loops
            if (Math.abs(currentLatLng.lat - lat) > 0.0001 || Math.abs(currentLatLng.lng - lng) > 0.0001) {
                const newLatLng = new L.LatLng(lat, lng);
                markerRef.current.setLatLng(newLatLng);
                mapInstanceRef.current.setView(newLatLng, 16);
            }
            
            // Força repaint caso o container tenha mudado de tamanho
            setTimeout(() => {
                mapInstanceRef.current.invalidateSize();
            }, 200);
        }
    }, [lat, lng]);

    // Definição dinâmica das classes da barra de busca
    const searchBarClasses = isFullScreen 
        ? "absolute top-6 left-6 right-20 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-full md:max-w-md z-[400] flex gap-2" // Fullscreen: Centralizado no desktop, margem direita no mobile para o botão X
        : "absolute top-4 left-4 right-4 z-[400] flex gap-2"; // Normal: Largura total com padding

    return (
        <div className="relative flex-1 w-full bg-slate-200 rounded-2xl overflow-hidden border border-gray-300 dark:border-gray-700 shadow-md min-h-[300px]">
            
            {/* Barra de Busca Flutuante sobre o Mapa */}
            <div className={searchBarClasses}>
                <div className="relative flex-1 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-black/5">
                    <MapIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#EA2831]" />
                    <input 
                        type="text" 
                        placeholder="🔍 Pesquisar rua ou bairro..." 
                        value={manualSearchTerm}
                        onChange={(e) => setManualSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onManualSearch()}
                        className="w-full pl-10 pr-4 py-2.5 bg-transparent border-none text-sm font-bold text-slate-900 focus:ring-0 placeholder:text-slate-400"
                    />
                </div>
                <button 
                    onClick={onManualSearch} 
                    className="px-4 bg-[#EA2831] text-white rounded-xl shadow-lg hover:bg-red-700 font-bold transition-all flex items-center justify-center"
                >
                    <Search className="w-4 h-4" />
                </button>
            </div>

            <div ref={mapContainerRef} className="w-full h-full z-0" />
            
            {isLoading && (
                <div className="absolute inset-0 z-[500] bg-white/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 font-bold text-slate-700 animate-pulse">
                        <MapPin className="w-4 h-4 text-[#EA2831]" /> Localizando...
                    </div>
                </div>
            )}

            <div className="absolute bottom-4 left-4 z-[400] pointer-events-none">
                <div className="bg-white/90 px-3 py-2 rounded-xl shadow-lg border border-black/5 text-[11px] font-bold text-slate-700 flex items-center gap-2 backdrop-blur-sm">
                    <Navigation className="w-4 h-4 text-[#EA2831]" />
                    Posicione o Pino
                </div>
            </div>

            {onExpand && (
                <button 
                    onClick={onExpand}
                    className="absolute bottom-4 right-4 z-[400] p-3 bg-white rounded-xl shadow-lg text-slate-600 hover:text-[#EA2831] hover:scale-110 transition-all border border-gray-100"
                    title="Expandir Mapa"
                >
                    <Maximize2 className="w-6 h-6" />
                </button>
            )}
        </div>
    );
});

export default MapComponent;