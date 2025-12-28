
import React, { useState, useRef, useEffect } from 'react';
import { X, User, Phone, MapPin, Mail, Camera, Star, Save, Calendar, FileText, ChevronLeft, Search, Navigation, Maximize2, Minimize2, Plus, Trash2, CheckCircle, Map as MapIcon } from 'lucide-react';
import { BaseModal } from '../../ui/BaseModal';
import { maskPhone, maskDate } from '../../../shared/utils/mathEngine';
import { CustomerProfile, Address } from '../../../types';

// Global definition for Leaflet
declare const L: any;

interface NewCustomerModalProps {
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: CustomerProfile | null;
}

export const NewCustomerModal: React.FC<NewCustomerModalProps> = ({ onClose, onSave, initialData }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [view, setView] = useState<'MAIN' | 'ADDRESS'>('MAIN');
    
    // Form States
    const [formData, setFormData] = useState({
        name: '',
        whatsapp: '',
        email: '',
        points: 0,
        photo: '',
        birthDate: '',
        observations: '',
        addresses: [] as Address[]
    });

    // Address View State
    const [addressForm, setAddressForm] = useState<Partial<Address>>({
        label: '', street: '', number: '', district: '', complement: '', reference: '', city: '', cep: '',
        lat: -14.2233, lng: -42.7766, icon: 'home'
    });
    const [mapSearch, setMapSearch] = useState('');
    const [isMapFullscreen, setIsMapFullscreen] = useState(false);

    // Map Refs
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                whatsapp: initialData.whatsapp || '',
                email: initialData.email || '',
                points: initialData.points || 0,
                photo: initialData.photo || '',
                birthDate: initialData.birthDate || '',
                observations: initialData.observations || '',
                addresses: initialData.addresses || []
            });
        }
    }, [initialData]);

    // Map Logic - Consistent with ProCustomers
    useEffect(() => {
        if (mapInstanceRef.current) {
            setTimeout(() => { mapInstanceRef.current.invalidateSize(); }, 300);
        }
    }, [isMapFullscreen]);

    useEffect(() => {
        if (view === 'ADDRESS' && mapContainerRef.current && !mapInstanceRef.current) {
            const lat = addressForm.lat || -14.2233;
            const lng = addressForm.lng || -42.7766;

            const map = L.map(mapContainerRef.current, { center: [lat, lng], zoom: 16, zoomControl: false, attributionControl: false });
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
            const icon = L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
            const marker = L.marker([lat, lng], { draggable: true, icon: icon }).addTo(map);

            marker.on('dragend', (e: any) => { const { lat, lng } = e.target.getLatLng(); setAddressForm(prev => ({ ...prev, lat, lng })); });
            map.on('click', (e: any) => { marker.setLatLng(e.latlng); setAddressForm(prev => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng })); });

            mapInstanceRef.current = map;
            markerRef.current = marker;
            setTimeout(() => { map.invalidateSize(); }, 100);
        }
        
        if (view !== 'ADDRESS' && mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
            markerRef.current = null;
            setIsMapFullscreen(false);
        }
    }, [view]);

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

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setFormData(prev => ({ ...prev, photo: event.target!.result as string }));
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSaveAddress = () => {
        if (!addressForm.street || !addressForm.label) {
            alert("Nome do endereço (Identificador) e Rua são obrigatórios.");
            return;
        }
        const newAddr = { ...addressForm, id: Date.now().toString() } as Address;
        setFormData(prev => ({ ...prev, addresses: [...prev.addresses, newAddr] }));
        setView('MAIN');
        setAddressForm({ label: '', street: '', number: '', district: '', complement: '', reference: '', city: '', cep: '', lat: -14.2233, lng: -42.7766, icon: 'home' });
    };

    const handleRemoveAddress = (id: string) => {
        setFormData(prev => ({ ...prev, addresses: prev.addresses.filter(a => a.id !== id) }));
    };

    const handleFinalSave = () => {
        if (!formData.name || !formData.whatsapp) {
            alert("Nome e WhatsApp são obrigatórios.");
            return;
        }
        onSave(formData);
        onClose();
    };

    return (
        <BaseModal onClose={onClose} className="max-w-6xl w-[95vw] h-[90vh]" hideCloseButton={true}>
            <div className="bg-white dark:bg-surface-dark rounded-[40px] shadow-2xl relative flex flex-col h-full overflow-hidden">
                
                {/* Header */}
                <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-surface-dark z-20">
                    {view === 'ADDRESS' ? (
                        <div className="flex items-center gap-4">
                            <button onClick={() => setView('MAIN')} className="flex items-center gap-2 text-slate-500 hover:text-[#EA2831] font-bold text-sm transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                                <ChevronLeft className="w-5 h-5" /> Voltar
                            </button>
                            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3"><MapPin className="w-6 h-6 text-[#EA2831]" /> Novo Endereço</h2>
                        </div>
                    ) : (
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            <User className="w-6 h-6 text-[#EA2831]" /> {initialData ? 'Editar Cliente' : 'Novo Cliente'}
                        </h2>
                    )}
                    <button onClick={onClose} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:text-red-500 transition-colors"><X className="w-6 h-6" /></button>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    {view === 'MAIN' && (
                        <div className="h-full overflow-y-auto no-scrollbar p-8 space-y-8 animate-[fadeIn_0.3s]">
                            
                            {/* Seção 1: Dados Pessoais */}
                            <div className="space-y-6">
                                <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-2 flex items-center justify-between">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-6 h-6 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-slate-500 text-[10px]">1</span> Dados Pessoais
                                    </h3>
                                </div>
                                <div className="flex flex-col lg:flex-row gap-8">
                                    {/* Photo Upload */}
                                    <div className="flex flex-col items-center gap-3 shrink-0">
                                        <div 
                                            className="relative size-32 rounded-full bg-gray-50 dark:bg-gray-800 border-4 border-white dark:border-gray-700 shadow-lg cursor-pointer group hover:border-[#EA2831] transition-all flex items-center justify-center overflow-hidden"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {formData.photo ? (
                                                <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-12 h-12 text-gray-300 group-hover:text-[#EA2831]" />
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <Camera className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Foto do Perfil</span>
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                    </div>

                                    {/* Fields Grid */}
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nome Completo *</label>
                                            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-[#EA2831] font-bold text-slate-900 dark:text-white" placeholder="Ex: João Silva" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">WhatsApp *</label>
                                            <input value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: maskPhone(e.target.value)})} className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-[#EA2831] font-bold text-slate-900 dark:text-white" placeholder="(00) 00000-0000" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">E-mail (Opcional)</label>
                                            <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-[#EA2831] font-bold text-slate-900 dark:text-white" placeholder="cliente@email.com" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nascimento (Opcional)</label>
                                            <input value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: maskDate(e.target.value)})} className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-[#EA2831] font-bold text-slate-900 dark:text-white" placeholder="DD/MM/AAAA" maxLength={10} />
                                        </div>
                                        <div className="space-y-1 col-span-full">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Observações / Alergias</label>
                                            <textarea value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})} className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-[#EA2831] font-medium text-slate-900 dark:text-white min-h-[80px]" placeholder="Preferências, alergias ou notas importantes..." />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Seção 2: Fidelidade */}
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
                                        <input type="number" value={formData.points} onChange={e => setFormData({...formData, points: parseInt(e.target.value) || 0})} className="w-full pl-4 pr-10 py-3 bg-white dark:bg-surface-dark border-2 border-yellow-200 rounded-2xl font-black text-xl text-right text-yellow-600 focus:ring-0" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-yellow-400">pts</span>
                                    </div>
                                </div>
                            </div>

                            {/* Seção 3: Endereços */}
                            <div className="space-y-4 pb-24">
                                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-2">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><span className="w-6 h-6 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-slate-500 text-[10px]">3</span> Endereços Cadastrados</h3>
                                    <button onClick={() => setView('ADDRESS')} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black flex items-center gap-2 shadow-lg shadow-slate-200/50 dark:shadow-none"><Plus className="w-3 h-3" /> Novo Endereço</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
                                    {formData.addresses.length === 0 ? (
                                        <div className="col-span-full p-10 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-3"><MapPin className="w-8 h-8 opacity-30" /><span className="text-sm font-bold opacity-60">Nenhum endereço cadastrado</span></div>
                                    ) : (
                                        formData.addresses.map((addr, idx) => (
                                            <div key={addr.id || idx} className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 animate-[fadeIn_0.3s]">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 bg-white dark:bg-surface-dark rounded-xl flex items-center justify-center text-[#EA2831] shadow-sm"><MapPin className="w-5 h-5" /></div>
                                                    <div><p className="text-sm font-black text-slate-900 dark:text-white">{addr.label}</p><p className="text-xs font-bold text-slate-500">{addr.street}, {addr.number}</p></div>
                                                </div>
                                                <button onClick={() => handleRemoveAddress(addr.id)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-surface-dark rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VIEW: ADDRESS */}
                    {view === 'ADDRESS' && (
                        <div className="h-full flex flex-col animate-[slideIn_0.3s] p-8 pb-0">
                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                                <div className="size-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-slate-500"><User className="w-5 h-5" /></div>
                                <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Adicionando para</span><span className="text-sm font-black text-slate-900 dark:text-white">{formData.name || 'Novo Cliente'} <span className="text-slate-400 font-normal">| {formData.whatsapp}</span></span></div>
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
                                            <div className="col-span-4 space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CEP</label><input value={addressForm.cep} onChange={e => setAddressForm({...addressForm, cep: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#EA2831] text-sm" placeholder="00000-000" /></div>
                                            <div className="col-span-8 space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cidade</label><input value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#EA2831] text-sm" placeholder="Ex: São Paulo" /></div>
                                        </div>
                                        <div className="grid grid-cols-12 gap-4">
                                            <div className="col-span-9 space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rua</label><input value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#EA2831] text-sm" placeholder="Ex: Av. Centenário" /></div>
                                            <div className="col-span-3 space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Número</label><input value={addressForm.number} onChange={e => setAddressForm({...addressForm, number: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#EA2831] text-sm" placeholder="Ex: 100" /></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bairro</label><input value={addressForm.district} onChange={e => setAddressForm({...addressForm, district: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#EA2831] text-sm" placeholder="Ex: Centro" /></div>
                                            <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Complemento</label><input value={addressForm.complement} onChange={e => setAddressForm({...addressForm, complement: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#EA2831] text-sm" placeholder="Ex: Apto 102" /></div>
                                        </div>
                                        <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ponto de Referência</label><input value={addressForm.reference} onChange={e => setAddressForm({...addressForm, reference: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#EA2831] text-sm" placeholder="Ex: Próximo à padaria" /></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark z-20">
                    {view === 'MAIN' ? (
                        <button onClick={handleFinalSave} className="w-full bg-[#EA2831] hover:bg-red-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-red-500/20 uppercase text-sm tracking-[0.2em] transition-all active:scale-[0.98] flex items-center justify-center gap-3"><Save className="w-5 h-5" /> Salvar Cadastro Completo</button>
                    ) : (
                        <button onClick={handleSaveAddress} className="w-full bg-[#EA2831] hover:bg-red-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-red-500/30 uppercase text-sm tracking-[0.2em] transition-all active:scale-[0.98] flex items-center justify-center gap-3"><CheckCircle className="w-5 h-5" /> Confirmar e Adicionar Endereço</button>
                    )}
                </div>
            </div>
        </BaseModal>
    );
};
