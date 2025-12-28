
import React, { useState, useRef, useEffect } from 'react';
import { Search, User, Phone, Star, ShoppingBag, Plus, MapPin, Trash2, Save, X, ChevronLeft, Navigation, Map as MapIcon, CheckCircle, Maximize2, Minimize2, Repeat, Cake, FileText } from 'lucide-react';
import { BaseModal } from '../ui/BaseModal';
import { maskPhone } from '../../shared/utils/mathEngine';
import { CustomerDetailsModal } from './CustomerDetailsModal';
import { useFinancialCalculations } from '../../hooks/useFinancialCalculations';

// Global definition for Leaflet
declare const L: any;

interface ProCustomersProps {
    loyaltySystem: any;
}

export default function ProCustomers({ loyaltySystem }: ProCustomersProps) {
  const { customers, addCustomer } = loyaltySystem;
  const [search, setSearch] = useState('');

  // States for New Customer Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalView, setModalView] = useState<'MAIN' | 'ADDRESS'>('MAIN');
  
  // State for Customer Details Modal
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  // Map Fullscreen State
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  
  // Hook de Cálculo Especialista (Recorrência)
  const { recurrenceDays } = useFinancialCalculations();

  const [newCustomer, setNewCustomer] = useState({
      name: '',
      whatsapp: '',
      points: 0,
      addresses: [] as any[]
  });

  const [addressForm, setAddressForm] = useState({
      label: '', street: '', number: '', district: '', complement: '', reference: '', 
      lat: -14.2233, lng: -42.7766
  });
  const [mapSearch, setMapSearch] = useState('');

  // --- MAP COMPONENT LOGIC ---
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
      if (mapInstanceRef.current) {
          setTimeout(() => { mapInstanceRef.current.invalidateSize(); }, 300);
      }
  }, [isMapFullscreen]);

  useEffect(() => {
      // Initialize Map logic (Condensed for brevity - same logic as before)
      if (isAddModalOpen && modalView === 'ADDRESS' && mapContainerRef.current && !mapInstanceRef.current) {
          const map = L.map(mapContainerRef.current, { center: [addressForm.lat, addressForm.lng], zoom: 16, zoomControl: false, attributionControl: false });
          L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
          const icon = L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
          const marker = L.marker([addressForm.lat, addressForm.lng], { draggable: true, icon: icon }).addTo(map);

          marker.on('dragend', (e: any) => { const { lat, lng } = e.target.getLatLng(); setAddressForm(prev => ({ ...prev, lat, lng })); });
          map.on('click', (e: any) => { marker.setLatLng(e.latlng); setAddressForm(prev => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng })); });

          mapInstanceRef.current = map;
          markerRef.current = marker;
          setTimeout(() => { map.invalidateSize(); }, 100);
      }
      
      if ((!isAddModalOpen || modalView !== 'ADDRESS') && mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          markerRef.current = null;
          setIsMapFullscreen(false);
      }
  }, [isAddModalOpen, modalView]);

  const handleMapSearch = async () => {
      if (!mapSearch) return;
      try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearch)}`);
          const data = await response.json();
          if (data && data.length > 0) {
              const lat = parseFloat(data[0].lat);
              const lng = parseFloat(data[0].lon);
              setAddressForm(prev => ({ ...prev, lat, lng }));
              if (mapInstanceRef.current && markerRef.current) {
                  const newLatLng = new L.LatLng(lat, lng);
                  markerRef.current.setLatLng(newLatLng);
                  mapInstanceRef.current.setView(newLatLng, 16);
              }
          } else { alert("Local não encontrado."); }
      } catch (e) { console.error(e); }
  };

  const filteredCustomers = (customers || []).filter((c: any) => 
    (c?.name && c.name.toLowerCase().includes(search.toLowerCase())) || 
    (c?.whatsapp && c.whatsapp.includes(search))
  );

  const totalPoints = (customers || []).reduce((acc: number, c: any) => acc + (c?.points || 0), 0);
  
  const handleSaveInternalAddress = () => {
      if (!addressForm.street || !addressForm.label) { alert("Preencha o Nome do endereço e a Rua."); return; }
      const newAddr = { ...addressForm, id: Date.now().toString() };
      setNewCustomer(prev => ({ ...prev, addresses: [...prev.addresses, newAddr] }));
      setModalView('MAIN');
      setAddressForm({ label: '', street: '', number: '', district: '', complement: '', reference: '', lat: -14.2233, lng: -42.7766 });
  };

  const removeAddress = (id: string) => {
      setNewCustomer(prev => ({ ...prev, addresses: prev.addresses.filter(a => a.id !== id) }));
  };

  const handleRegisterCustomer = () => {
      if (!newCustomer.name || !newCustomer.whatsapp) { alert('Preencha pelo menos Nome e WhatsApp.'); return; }
      addCustomer(newCustomer);
      setNewCustomer({ name: '', whatsapp: '', points: 0, addresses: [] });
      setIsAddModalOpen(false);
      setModalView('MAIN');
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Clientes</h3>
          <p className="text-slate-500 font-medium">Base de Clientes & CRM</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative group flex-1 md:w-[320px]">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="Pesquisar cliente..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-[24px] focus:outline-none focus:border-[#EA2831] focus:ring-1 focus:ring-[#EA2831] font-bold text-slate-900 dark:text-white shadow-sm transition-all"
                />
            </div>
            
            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-[#EA2831] hover:bg-red-700 text-white px-6 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20 transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap"
            >
                <Plus className="w-4 h-4 stroke-[3]" /> Adicionar Cliente
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Pontos */}
        <div className="bg-[#EA2831] text-white p-8 rounded-[32px] shadow-xl shadow-red-500/20 flex items-center gap-6 overflow-hidden">
            <div className="size-14 flex items-center justify-center">
                <Star className="fill-current w-12 h-12 text-white" />
            </div>
            <div>
               <p className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] mb-1">Pontos Distribuídos</p>
               <p className="text-3xl font-black tracking-tight">{totalPoints.toLocaleString()} <span className="text-xs text-white/60">pts</span></p>
            </div>
         </div>

         {/* Card 2: Recorrência (Cálculo via Hook) */}
         <div className="bg-white dark:bg-surface-dark p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-6">
            <div className="size-14 flex items-center justify-center">
                <Repeat className="w-8 h-8 text-[#EA2831]" />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Recorrência de Pedidos</p>
               <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                   {recurrenceDays > 0 ? recurrenceDays : '--'} dias 
               </p>
            </div>
         </div>

         {/* Card 3: Clientes */}
         <div className="bg-white dark:bg-surface-dark p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-6">
            <div className="size-14 flex items-center justify-center">
                <User className="w-8 h-8 text-[#EA2831]" />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Clientes na Base</p>
               <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{customers?.length || 0}</p>
            </div>
         </div>
      </div>
      
      {/* Tabela de Clientes */}
      <div className="bg-white dark:bg-surface-dark rounded-[40px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <tr>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Cliente</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Contato</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Nascimento</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Observações</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Fidelidade</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ação</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {filteredCustomers.length > 0 ? filteredCustomers.map((customer: any) => {
                    if (!customer) return null; // Safe Rendering

                    return (
                        <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 bg-slate-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">{customer.name}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                            <ShoppingBag className="w-3 h-3" /> {customer.orderCount || 0} pedidos
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-6 text-sm font-bold text-slate-600 dark:text-gray-300">
                                <div className="flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-green-500" />
                                    {customer.whatsapp || 'Não informado'}
                                </div>
                            </td>
                            <td className="px-8 py-6 text-sm font-bold text-slate-600 dark:text-gray-300">
                                {customer.birthDate ? (
                                    <div className="flex items-center gap-2">
                                        <Cake className="w-3.5 h-3.5 text-pink-400" />
                                        {customer.birthDate}
                                    </div>
                                ) : '-'}
                            </td>
                            <td className="px-8 py-6">
                                {customer.observations ? (
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 max-w-[150px] truncate" title={customer.observations}>
                                        <FileText className="w-3.5 h-3.5 text-[#EA2831]" />
                                        {customer.observations}
                                    </div>
                                ) : (
                                    <span className="text-slate-300 text-xs">-</span>
                                )}
                            </td>
                            <td className="px-8 py-6 text-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-2xl border border-primary/10 text-primary font-black text-xs">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    {customer.points || 0}
                                </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                                <button 
                                    onClick={() => setSelectedCustomer(customer)}
                                    className="text-[#EA2831] font-bold text-xs uppercase tracking-widest hover:underline"
                                >
                                    Ver Mais
                                </button>
                            </td>
                        </tr>
                    );
                }) : (
                    <tr>
                        <td colSpan={6} className="px-10 py-20 text-center">
                            <div className="flex flex-col items-center gap-4 text-slate-300">
                                <User className="w-16 h-16 opacity-10" />
                                <p className="font-black text-sm uppercase tracking-[0.2em] opacity-30">Nenhum cliente encontrado</p>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>

      {selectedCustomer && (
          <CustomerDetailsModal 
              customer={selectedCustomer} 
              onClose={() => setSelectedCustomer(null)} 
          />
      )}

      {/* Modal de Cadastro simplificado para brevidade (Manter lógica existente do modal) */}
      {isAddModalOpen && (
          <BaseModal onClose={() => setIsAddModalOpen(false)} className="max-w-6xl w-[95vw] h-[90vh]" hideCloseButton={true}>
              <div className="bg-white dark:bg-surface-dark rounded-[40px] shadow-2xl relative flex flex-col h-full overflow-hidden">
                  <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-surface-dark z-20">
                      {modalView === 'ADDRESS' ? (
                          <div className="flex items-center gap-4">
                              <button onClick={() => setModalView('MAIN')} className="flex items-center gap-2 text-slate-500 hover:text-primary font-bold text-sm transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                                  <ChevronLeft className="w-5 h-5" /> Voltar
                              </button>
                              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
                              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3"><MapPin className="w-6 h-6 text-[#EA2831]" /> Novo Endereço</h2>
                          </div>
                      ) : (
                          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3"><User className="w-6 h-6 text-[#EA2831]" /> Novo Cadastro</h2>
                      )}
                      <button onClick={() => setIsAddModalOpen(false)} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:text-red-500 transition-colors"><X className="w-6 h-6" /></button>
                  </div>

                  <div className="flex-1 overflow-hidden relative">
                      {modalView === 'MAIN' && (
                          <div className="h-full overflow-y-auto no-scrollbar p-8 space-y-8 animate-[fadeIn_0.3s]">
                              <div className="space-y-4">
                                  <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-2">
                                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><span className="w-6 h-6 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-slate-500 text-[10px]">1</span> Dados Pessoais</h3>
                                  </div>
                                  <div className="grid grid-cols-2 gap-6 px-1">
                                      <div className="space-y-2">
                                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nome Completo</label>
                                          <input type="text" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-[#EA2831] font-bold text-base text-slate-900 dark:text-white" placeholder="Ex: João Silva" />
                                      </div>
                                      <div className="space-y-2">
                                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">WhatsApp</label>
                                          <input type="text" value={newCustomer.whatsapp} onChange={e => setNewCustomer({...newCustomer, whatsapp: maskPhone(e.target.value)})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-[#EA2831] font-bold text-base text-slate-900 dark:text-white" placeholder="(00) 00000-0000" />
                                      </div>
                                  </div>
                              </div>
                              <div className="space-y-4">
                                  <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-2">
                                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><span className="w-6 h-6 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-slate-500 text-[10px]">2</span> Fidelidade Inicial</h3>
                                  </div>
                                  <div className="p-6 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-3xl flex items-center justify-between mx-1">
                                      <div className="flex items-center gap-4">
                                          <div className="size-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center text-yellow-600"><Star className="w-6 h-6 fill-current" /></div>
                                          <div><p className="text-base font-black text-slate-900 dark:text-white">Saldo de Pontos</p><p className="text-xs font-bold text-slate-500">Defina o saldo inicial para este cliente</p></div>
                                      </div>
                                      <div className="relative w-40">
                                          <input type="number" value={newCustomer.points} onChange={e => setNewCustomer({...newCustomer, points: parseInt(e.target.value) || 0})} className="w-full pl-4 pr-10 py-3 bg-white dark:bg-surface-dark border-2 border-yellow-200 rounded-2xl font-black text-xl text-right text-yellow-600 focus:ring-0" />
                                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-yellow-400">pts</span>
                                      </div>
                                  </div>
                              </div>
                              <div className="space-y-4 pb-24">
                                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-2">
                                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><span className="w-6 h-6 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-slate-500 text-[10px]">3</span> Endereços Cadastrados</h3>
                                      <button onClick={() => setModalView('ADDRESS')} disabled={newCustomer.addresses.length >= 2} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-slate-200/50 dark:shadow-none"><Plus className="w-3 h-3" /> Novo Endereço</button>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
                                      {newCustomer.addresses.length === 0 ? (
                                          <div className="col-span-full p-10 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-3"><MapPin className="w-8 h-8 opacity-30" /><span className="text-sm font-bold opacity-60">Nenhum endereço cadastrado</span></div>
                                      ) : (
                                          newCustomer.addresses.map((addr, idx) => (
                                              <div key={addr.id || idx} className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 animate-[fadeIn_0.3s]">
                                                  <div className="flex items-center gap-4">
                                                      <div className="size-10 bg-white dark:bg-surface-dark rounded-xl flex items-center justify-center text-[#EA2831] shadow-sm"><MapPin className="w-5 h-5" /></div>
                                                      <div><p className="text-sm font-black text-slate-900 dark:text-white">{addr.label}</p><p className="text-xs font-bold text-slate-500">{addr.street}, {addr.number}</p></div>
                                                  </div>
                                                  <button onClick={() => removeAddress(addr.id)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-surface-dark rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                                              </div>
                                          ))
                                      )}
                                  </div>
                              </div>
                          </div>
                      )}
                      {modalView === 'ADDRESS' && (
                          <div className="h-full flex flex-col animate-[slideIn_0.3s] p-8 pb-0">
                              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                                  <div className="size-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-slate-500"><User className="w-5 h-5" /></div>
                                  <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Adicionando para</span><span className="text-sm font-black text-slate-900 dark:text-white">{newCustomer.name || 'Novo Cliente'} <span className="text-slate-400 font-normal">| {newCustomer.whatsapp}</span></span></div>
                              </div>
                              <div className="flex flex-col lg:flex-row gap-8 h-full min-h-0">
                                  <div className={isMapFullscreen ? "fixed inset-0 z-[9999] bg-white dark:bg-zinc-900 p-0" : "w-full lg:w-1/2 flex flex-col gap-4"}>
                                      <div className={`relative w-full ${isMapFullscreen ? 'h-full' : 'h-[400px] lg:h-full rounded-3xl border border-gray-300 dark:border-gray-700'} bg-slate-200 overflow-hidden shadow-inner group transition-all duration-300`}>
                                          <div className="absolute top-4 left-4 right-4 z-[400] flex gap-2">
                                              <div className="relative flex-1 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-black/5"><MapIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#EA2831]" /><input type="text" placeholder="Pesquisar rua, bairro..." value={mapSearch} onChange={(e) => setMapSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleMapSearch()} className="w-full pl-12 pr-4 py-3.5 bg-transparent border-none text-sm font-bold text-slate-900 focus:ring-0 placeholder:text-slate-400" /></div>
                                              <button onClick={handleMapSearch} className="px-5 bg-[#EA2831] text-white rounded-2xl shadow-xl hover:bg-red-700 font-bold transition-all flex items-center justify-center"><Search className="w-5 h-5" /></button>
                                          </div>
                                          <div ref={mapContainerRef} className="w-full h-full z-0" />
                                          <div className="absolute bottom-4 left-4 z-[400] pointer-events-none"><div className="bg-white/90 px-4 py-2 rounded-xl shadow-lg border border-black/5 text-xs font-bold text-slate-700 flex items-center gap-2 backdrop-blur-sm"><Navigation className="w-4 h-4 text-[#EA2831]" /> Arraste o pino para ajustar</div></div>
                                          <button onClick={() => setIsMapFullscreen(!isMapFullscreen)} className="absolute bottom-4 right-4 z-[400] p-3 bg-white hover:bg-gray-50 text-slate-700 rounded-xl shadow-lg border border-gray-200 transition-transform active:scale-95" title={isMapFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}>{isMapFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}</button>
                                      </div>
                                  </div>
                                  <div className="w-full lg:w-1/2 flex flex-col h-full overflow-hidden">
                                      <div className="flex-1 overflow-y-auto no-scrollbar px-1 pb-10 space-y-5">
                                          <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identificador</label><input value={addressForm.label} onChange={e => setAddressForm({...addressForm, label: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#EA2831] text-sm transition-all" placeholder="Ex: Casa, Trabalho, Sítio" /></div>
                                          <div className="grid grid-cols-12 gap-4">
                                              <div className="col-span-9 space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rua</label><input value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#EA2831] text-sm" placeholder="Ex: Av. Centenário" /></div>
                                              <div className="col-span-3 space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Número</label><input value={addressForm.number} onChange={e => setAddressForm({...addressForm, number: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#EA2831] text-sm" placeholder="Ex: 100" /></div>
                                          </div>
                                          <div className="grid grid-cols-2 gap-4">
                                              <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bairro</label><input value={addressForm.district} onChange={e => setAddressForm({...addressForm, district: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#EA2831] text-sm" placeholder="Ex: Centro" /></div>
                                              <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Complemento</label><input value={addressForm.complement} onChange={e => setAddressForm({...addressForm, complement: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#EA2831] text-sm" placeholder="Ex: Apartamento 102, Bloco B" /></div>
                                          </div>
                                          <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ponto de Referência</label><input value={addressForm.reference} onChange={e => setAddressForm({...addressForm, reference: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#EA2831] text-sm" placeholder="Ex: Próximo à padaria, portão azul" /></div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>
                  <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark z-20">
                      {modalView === 'MAIN' ? (
                          <button onClick={handleRegisterCustomer} className="w-full bg-[#EA2831] hover:bg-red-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-red-500/20 uppercase text-sm tracking-[0.2em] transition-all active:scale-[0.98] flex items-center justify-center gap-3"><Save className="w-5 h-5" /> Salvar Cadastro Completo</button>
                      ) : (
                          <button onClick={handleSaveInternalAddress} className="w-full bg-[#EA2831] hover:bg-red-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-red-500/30 uppercase text-sm tracking-[0.2em] transition-all active:scale-[0.98] flex items-center justify-center gap-3"><CheckCircle className="w-5 h-5" /> Confirmar e Adicionar Endereço</button>
                      )}
                  </div>
              </div>
          </BaseModal>
      )}
    </div>
  );
}
