import React from 'react';
import { Truck } from 'lucide-react';
import MapComponent from '../MapComponent';

interface DeliveryStepMapProps {
    geoCoords: { lat: number, lng: number };
    setGeoCoords: (coords: { lat: number, lng: number }) => void;
    manualMapSearch: string;
    setManualMapSearch: (val: string) => void;
    handleManualMapSearch: () => void;
    isLoadingGeo: boolean;
    onExpandMap: () => void;
}

const DeliveryStepMap = React.memo((props: DeliveryStepMapProps) => {
    return (
        <div className="flex flex-col h-full gap-4 animate-[fadeIn_0.3s]">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#EA2831]" /> Localização no Mapa
                </h4>
            </div>

            <MapComponent 
                lat={props.geoCoords.lat}
                lng={props.geoCoords.lng}
                onPositionChange={(lat, lng) => props.setGeoCoords({ lat, lng })}
                onExpand={props.onExpandMap}
                manualSearchTerm={props.manualMapSearch}
                setManualSearchTerm={props.setManualMapSearch}
                onManualSearch={props.handleManualMapSearch}
                isLoading={props.isLoadingGeo}
            />
        </div>
    );
});

export default DeliveryStepMap;