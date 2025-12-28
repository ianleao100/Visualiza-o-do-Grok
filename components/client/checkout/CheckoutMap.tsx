
import React, { useRef, useEffect } from 'react';

// Global definition for Leaflet
declare const L: any;

interface CheckoutMapProps {
    coordinates: { lat: number; lng: number };
    savedAddresses: any[];
}

const Icon: React.FC<{ name: string, className?: string }> = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

export const CheckoutMap: React.FC<CheckoutMapProps> = ({ coordinates, savedAddresses }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);

    const zoomIn = () => { if (mapInstanceRef.current) mapInstanceRef.current.zoomIn(); };
    const zoomOut = () => { if (mapInstanceRef.current) mapInstanceRef.current.zoomOut(); };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (mapContainerRef.current && !mapInstanceRef.current) {
                const initialLat = coordinates.lat !== 0 ? coordinates.lat : (savedAddresses[0] ? savedAddresses[0].lat : -14.2233);
                const initialLng = coordinates.lng !== 0 ? coordinates.lng : (savedAddresses[0] ? savedAddresses[0].lng : -42.7766);
                
                const redPinIcon = L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });

                const map = L.map(mapContainerRef.current, {
                    center: [initialLat, initialLng],
                    zoom: 16,
                    zoomControl: false,
                    attributionControl: false,
                    dragging: true 
                });

                L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                    maxZoom: 20,
                    subdomains: 'abcd',
                }).addTo(map);

                const marker = L.marker([initialLat, initialLng], {
                    draggable: false, 
                    icon: redPinIcon
                }).addTo(map);

                mapInstanceRef.current = map;
                markerRef.current = marker;
            } else if (mapInstanceRef.current && markerRef.current) {
                const newLatLng = new L.LatLng(coordinates.lat, coordinates.lng);
                markerRef.current.setLatLng(newLatLng);
                mapInstanceRef.current.setView(newLatLng, 16);
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [coordinates, savedAddresses]);

    return (
        <div className="relative w-full flex-1 min-h-[256px] bg-slate-200 dark:bg-zinc-800 rounded-xl overflow-hidden group isolate">
            <div ref={mapContainerRef} className="w-full h-full z-10 absolute inset-0" />
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-[400]">
                <button onClick={zoomIn} className="w-8 h-8 bg-white dark:bg-surface-dark rounded-lg shadow flex items-center justify-center text-slate-600 dark:text-gray-300 hover:text-[#ea2a33] transition-colors border border-black/5 dark:border-white/5"><Icon name="add" className="text-lg" /></button>
                <button onClick={zoomOut} className="w-8 h-8 bg-white dark:bg-surface-dark rounded-lg shadow flex items-center justify-center text-slate-600 dark:text-gray-300 hover:text-[#ea2a33] transition-colors border border-black/5 dark:border-white/5"><Icon name="remove" className="text-lg" /></button>
            </div>
        </div>
    );
};
