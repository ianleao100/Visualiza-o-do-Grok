import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, Check, MapPin } from 'lucide-react';
import { BaseModal } from '../../ui/BaseModal';
import { CartItem, PaymentMethodType } from '../../../types';
import { roundFinance, calculatePointsDiscount } from '../../../shared/utils/mathEngine';
import DeliverySteps from './delivery/DeliverySteps';
import MapComponent from './delivery/MapComponent';
import { useCustomerSearch } from '../../../hooks/useCustomerSearch';
import { DeliveryAddress } from './delivery/types';

interface DeliveryCheckoutModalProps {
  onClose: () => void;
  cart: CartItem[];
  subtotal: number;
  onConfirm: (orderData: any) => void;
  loyaltySystem: any; 
}

// Fullscreen Map Wrapper para o Modal (Step Opcional)
const FullscreenMapWrapper = ({ lat, lng, onClose }: { lat: number, lng: number, onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col animate-[fadeIn_0.2s]">
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 z-[10000] p-3 bg-white rounded-full shadow-lg hover:text-red-500 hover:bg-gray-50 transition-all border border-gray-100"
            >
                <X className="w-6 h-6" />
            </button>
            
            {/* Using the same MapComponent but full screen logic handled by parent container */}
            <div className="w-full h-full relative">
                 <MapComponent 
                    lat={lat} 
                    lng={lng} 
                    onPositionChange={() => {}} // No-op for fullscreen static view or pass handler if needed
                    manualSearchTerm=""
                    setManualSearchTerm={() => {}}
                    onManualSearch={() => {}}
                    isLoading={false}
                    isFullScreen={true}
                 />
            </div>
            
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[10000]">
                <button 
                    onClick={onClose}
                    className="bg-[#EA2831] text-white px-8 py-4 rounded-2xl font-black shadow-2xl shadow-red-500/30 hover:bg-red-700 transition-all active:scale-95 flex items-center gap-3 text-lg"
                >
                    <CheckCircle className="w-6 h-6" /> CONFIRMAR LOCALIZAÇÃO
                </button>
            </div>
        </div>
    );
};

export default function DeliveryCheckoutModal({ onClose, cart, subtotal, onConfirm, loyaltySystem }: DeliveryCheckoutModalProps) {
  const [step, setStep] = useState(1);
  
  // Custom Hook for Search Logic
  const { 
      searchTerm: customerSearch, 
      setSearchTerm: setCustomerSearch, 
      suggestions, 
      showSuggestions, 
      customerFound, 
      setCustomerFound,
      handleSearch,
      clearSuggestions
  } = useCustomerSearch({ loyaltySystem });

  // Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerPoints, setCustomerPoints] = useState(0);
  
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  
  // Address Form Individual Fields
  const [addrStreet, setAddrStreet] = useState('');
  const [addrNumber, setAddrNumber] = useState('');
  const [addrDistrict, setAddrDistrict] = useState('');
  const [addrComplement, setAddrComplement] = useState('');
  const [addrReference, setAddrReference] = useState('');

  // Map State
  const [geoCoords, setGeoCoords] = useState<{lat: number, lng: number}>({ lat: -14.2233, lng: -42.7766 }); 
  const [manualMapSearch, setManualMapSearch] = useState('');
  const [isLoadingGeo, setIsLoadingGeo] = useState(false);
  const [isFullscreenMapOpen, setIsFullscreenMapOpen] = useState(false);

  // Payment & Options
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('PIX');
  const [cashPaidAmount, setCashPaidAmount] = useState(''); 
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState<number>(5.00); 
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'BRL' | 'PERCENT'>('BRL');
  const [pointsToUse, setPointsToUse] = useState(0); // Mudança aqui: Numérico

  // --- Derived Values ---
  const isStep1Valid = customerName.length > 2 && 
                       customerPhone.length >= 14 && 
                       addrStreet.length > 3 && 
                       addrNumber.length > 0 && 
                       addrDistrict.length > 2;

  const calculatedDiscount = discountType === 'PERCENT' ? (subtotal * discount) / 100 : discount;
  const pointsDiscountValue = calculatePointsDiscount(pointsToUse); 
  const totalValue = roundFinance(Math.max(0, subtotal + deliveryFee - calculatedDiscount - pointsDiscountValue));
  const cashValue = parseFloat(cashPaidAmount) || 0;
  const changeValue = Math.max(0, cashValue - totalValue);

  // --- Handlers ---

  const performGeocode = async (query: string): Promise<{lat: number, lng: number} | null> => {
      try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
          const data = await response.json();
          if (data && data.length > 0) {
              return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
          }
          return null;
      } catch (e) {
          return null;
      }
  };

  const handleManualMapSearchAction = async () => {
      if (!manualMapSearch.trim()) return;
      setIsLoadingGeo(true);
      
      let query = manualMapSearch.trim();
      if (!query.toLowerCase().includes('guanambi')) {
          query += ", Guanambi, Bahia, Brazil";
      }

      const result = await performGeocode(query);
      
      if (result) {
          setGeoCoords(result);
      } else {
          const looseResult = await performGeocode(manualMapSearch.trim());
          if (looseResult) {
             setGeoCoords(looseResult);
          } else {
             alert("Local não encontrado.");
          }
      }
      setIsLoadingGeo(false);
  };

  const fillCustomerData = (found: any) => {
      setCustomerFound(true);
      setCustomerName(found.name);
      setCustomerPhone(found.whatsapp);
      setCustomerPoints(found.points);
      
      let loadedAddresses: DeliveryAddress[] = [];
      if (found.addresses && Array.isArray(found.addresses)) {
          loadedAddresses = found.addresses;
      } else if (found.address) {
          loadedAddresses = [found.address.id ? found.address : {
              id: 'addr-main',
              label: 'Endereço Principal',
              street: found.address.street || '',
              number: found.address.number || '',
              district: found.address.district || '',
              complement: found.address.complement || '',
              reference: found.address.reference || '',
              lat: found.address.lat || -14.2233,
              lng: found.address.lng || -42.7766
          }];
      }
      
      setSavedAddresses(loadedAddresses);
      
      if (loadedAddresses.length > 0) {
          handleSelectAddress(loadedAddresses[0].id, loadedAddresses);
      } else {
          setSelectedAddressId('new');
          setAddrStreet('');
          setAddrNumber('');
          setAddrDistrict('');
          setAddrComplement('');
          setAddrReference('');
      }
      
      clearSuggestions();
      setCustomerSearch(found.name);
  };

  const handleSelectAddress = (id: string, list = savedAddresses) => {
      setSelectedAddressId(id);
      if (id === 'new') {
          setAddrStreet('');
          setAddrNumber('');
          setAddrDistrict('');
          setAddrComplement('');
          setAddrReference('');
          setGeoCoords({ lat: -14.2233, lng: -42.7766 });
      } else {
          const addr = list.find(a => a.id === id);
          if (addr) {
              setAddrStreet(addr.street);
              setAddrNumber(addr.number);
              setAddrDistrict(addr.district);
              setAddrComplement(addr.complement || '');
              setAddrReference(addr.reference || '');
              if (addr.lat && addr.lng) {
                  setGeoCoords({ lat: addr.lat, lng: addr.lng });
              }
          }
      }
  };

  const updateAddressField = (field: string, val: string) => {
      if (field === 'street') setAddrStreet(val);
      if (field === 'number') setAddrNumber(val);
      if (field === 'district') setAddrDistrict(val);
      if (field === 'complement') setAddrComplement(val);
      if (field === 'reference') setAddrReference(val);
  };

  const handleFinalize = () => {
      const orderData = {
          customer: {
              name: customerName,
              whatsapp: customerPhone,
              address: `${addrStreet}, ${addrNumber} - ${addrDistrict} ${addrComplement ? '(' + addrComplement + ')' : ''}`,
              pointsUsed: pointsToUse
          },
          delivery: {
              fee: deliveryFee,
              coordinates: geoCoords,
              waived: deliveryFee === 0
          },
          payment: {
              method: paymentMethod,
              total: totalValue,
              subtotal: subtotal,
              discount: calculatedDiscount + pointsDiscountValue,
              changeFor: paymentMethod === 'CASH' ? cashPaidAmount : undefined
          }
      };
      onConfirm(orderData);
  };

  return (
    <BaseModal onClose={onClose} className="max-w-5xl w-full" hideCloseButton={true}>
        {isFullscreenMapOpen && (
            <FullscreenMapWrapper 
                lat={geoCoords.lat}
                lng={geoCoords.lng}
                onClose={() => setIsFullscreenMapOpen(false)}
            />
        )}

        <div className="flex flex-col h-[85vh] bg-white dark:bg-surface-dark rounded-[32px] shadow-2xl overflow-hidden relative">
            
            {/* HEADER - DIVISÓRIA FINA */}
            <div className="bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800 px-8 py-5 shrink-0 z-30 flex items-center justify-between relative">
                 <div className="flex flex-col">
                      <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Pedido Delivery</h2>
                 </div>
                 
                 <div className="absolute left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-4">
                        {[1, 2, 3].map(s => (
                            <React.Fragment key={s}>
                                <div className={`flex items-center gap-2 ${step === s ? 'opacity-100 scale-105' : 'opacity-50'}`}>
                                    <div className={`size-6 rounded-full flex items-center justify-center border-2 font-black text-[10px] transition-all ${step >= s ? 'bg-[#EA2831] border-[#EA2831] text-white' : 'bg-white border-slate-300 text-slate-400'}`}>{s}</div>
                                    <span className={`text-xs font-bold ${step >= s ? 'text-[#EA2831]' : 'text-slate-400'}`}>{s === 1 ? 'Cliente' : s === 2 ? 'Endereço' : 'Pagamento'}</span>
                                </div>
                                {s < 3 && <div className="w-8 h-px bg-slate-200"></div>}
                            </React.Fragment>
                        ))}
                    </div>
                 </div>
                 
                 <button onClick={onClose} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><X className="w-5 h-5" /></button>
            </div>
            
            {/* CONTENT - BRANCO PURO */}
            <div className="flex-1 px-8 pt-6 pb-28 overflow-y-auto no-scrollbar relative bg-white dark:bg-surface-dark">
                <DeliverySteps 
                    step={step}
                    // Step 1
                    customerSearch={customerSearch}
                    handleSearchChange={(e) => handleSearch(e.target.value, customerName)}
                    showSuggestions={showSuggestions}
                    suggestions={suggestions}
                    handleSelectSuggestion={fillCustomerData}
                    customerFound={customerFound}
                    customerName={customerName}
                    setCustomerName={setCustomerName}
                    customerPhone={customerPhone}
                    setCustomerPhone={setCustomerPhone}
                    customerPoints={customerPoints}
                    savedAddresses={savedAddresses}
                    selectedAddressId={selectedAddressId}
                    handleSelectAddress={(id) => handleSelectAddress(id)}
                    addressForm={{ street: addrStreet, number: addrNumber, district: addrDistrict, complement: addrComplement, reference: addrReference }}
                    setAddressForm={updateAddressField}
                    // Step 2
                    geoCoords={geoCoords}
                    setGeoCoords={setGeoCoords}
                    manualMapSearch={manualMapSearch}
                    setManualMapSearch={setManualMapSearch}
                    handleManualMapSearch={handleManualMapSearchAction}
                    isLoadingGeo={isLoadingGeo}
                    onExpandMap={() => setIsFullscreenMapOpen(true)}
                    // Step 3
                    subtotal={subtotal}
                    totalValue={totalValue}
                    deliveryFee={deliveryFee}
                    setDeliveryFee={setDeliveryFee}
                    discount={discount}
                    setDiscount={setDiscount}
                    discountType={discountType}
                    setDiscountType={setDiscountType}
                    usePoints={false} // Legacy prop
                    setUsePoints={() => {}} // Legacy prop
                    pointsToUse={pointsToUse} // New
                    setPointsToUse={setPointsToUse} // New
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    cashPaidAmount={cashPaidAmount}
                    setCashPaidAmount={setCashPaidAmount}
                    changeValue={changeValue}
                    calculatedDiscount={calculatedDiscount}
                    pointsDiscountValue={pointsDiscountValue}
                    showMoreOptions={showMoreOptions}
                    setShowMoreOptions={setShowMoreOptions}
                />
            </div>

            {/* FOOTER - BRANCO PURO COM DIVISÓRIA */}
            <div className="absolute bottom-0 left-0 w-full px-8 py-6 z-40 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
                {step > 1 && (
                    <button 
                        onClick={() => setStep(step - 1)}
                        className="px-6 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-gray-100 hover:text-slate-900 transition-all uppercase text-xs tracking-widest border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark shadow-sm mr-auto"
                    >
                        Voltar
                    </button>
                )}
                
                {step < 3 ? (
                    <button 
                        onClick={() => setStep(prev => prev + 1)}
                        disabled={step === 1 && !isStep1Valid}
                        className="px-10 bg-[#EA2831] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3.5 rounded-xl shadow-xl shadow-red-500/20 uppercase text-xs tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {isLoadingGeo ? 'Localizando...' : 'Avançar'}
                    </button>
                ) : (
                    <button 
                        onClick={handleFinalize}
                        className="px-10 bg-green-600 hover:bg-green-700 text-white font-black py-3.5 rounded-xl shadow-xl shadow-green-500/20 uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <CheckCircle className="w-5 h-5" /> Concluir Pedido
                    </button>
                )}
            </div>
        </div>
    </BaseModal>
  );
}