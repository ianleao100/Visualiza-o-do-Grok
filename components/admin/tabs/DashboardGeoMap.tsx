
import React, { useEffect, useRef } from 'react';

// Global definition for Leaflet
declare const L: any;

interface DashboardGeoMapProps {
    points: { lat: number; lng: number; weight: number }[];
}

export const DashboardGeoMap: React.FC<DashboardGeoMapProps> = ({ points }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (mapContainerRef.current && !mapInstanceRef.current) {
            // Center roughly on first point or default
            const center = points.length > 0 ? [points[0].lat, points[0].lng] : [-23.550520, -46.633308];
            
            const map = L.map(mapContainerRef.current, {
                center: center,
                zoom: 13,
                zoomControl: false,
                attributionControl: false
            });

            // Minimalistic Dark Mode Map Style
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 18,
            }).addTo(map);

            mapInstanceRef.current = map;
        }

        // Update Markers/Heatmap simulation
        if (mapInstanceRef.current) {
            // Clear existing layers logic would go here if strict update needed, 
            // but for dashboard usually we just render once or need a cleanup function.
            // Simplified: Add Circles for "Hotspots"
            
            points.forEach(p => {
                const color = p.weight > 100 ? '#EA2831' : '#F59E0B'; // Red for high value, Orange for med
                
                L.circleMarker([p.lat, p.lng], {
                    radius: 8,
                    fillColor: color,
                    color: "#fff",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.6
                }).addTo(mapInstanceRef.current);
            });
        }
    }, [points]);

    return (
        <div className="relative w-full h-full rounded-[24px] overflow-hidden">
            <div ref={mapContainerRef} className="w-full h-full z-0" />
            
            {/* Overlay Gradient for seamless integration */}
            <div className="absolute inset-0 pointer-events-none border border-black/5 rounded-[24px]"></div>
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-sm text-[10px] font-bold text-slate-600 z-[400]">
                <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-[#EA2831]"></span> Alta Demanda</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span> Média Demanda</div>
            </div>
        </div>
    );
};
