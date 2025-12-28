
import React, { useState, useRef } from 'react';
import { AddressManager } from '../common/AddressManager';
import { maskDate } from '../../shared/utils/mathEngine';

interface ClientProfileProps {
  onBack: () => void;
  userProfile: any;
  setUserProfile: (profile: any) => void;
  savedAddresses: any[];
  setSavedAddresses: (addresses: any[]) => void;
  savedCards: any[];
  setSavedCards: (cards: any[]) => void;
}

const Icon: React.FC<{ name: string, className?: string, style?: React.CSSProperties }> = ({ name, className = "", style }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{name}</span>
);

// Mock Data for Points History
const mockPointsHistory = [
    { id: 1, type: 'EARN', amount: 50, description: 'Pedido #ORD-90882', date: '17/12/2025' },
    { id: 2, type: 'SPEND', amount: -150, description: 'Resgate de Cupom R$ 5,00', date: '15/12/2025' },
    { id: 3, type: 'EARN', amount: 120, description: 'Pedido #ORD-HIST-001', date: '10/12/2025' },
    { id: 4, type: 'EARN', amount: 30, description: 'Avaliação de Pedido', date: '08/12/2025' },
    { id: 5, type: 'EARN', amount: 300, description: 'Bônus de Boas Vindas', date: '01/12/2025' },
];

export const ClientProfile: React.FC<ClientProfileProps> = ({
  onBack,
  userProfile,
  setUserProfile,
  savedAddresses,
  setSavedAddresses,
  savedCards,
  setSavedCards
}) => {
  const [profileSubView, setProfileSubView] = useState<'MAIN' | 'DATA' | 'ACCOUNT' | 'ADDRESSES' | 'PAYMENTS' | 'POINTS'>('MAIN');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Payment Editing State
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardForm, setNewCardForm] = useState({ number: '', holder: '', expiry: '', cvv: '' });

  // Address State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  // Staging state for address being edited (passed to AddressManager)
  const [editingAddressData, setEditingAddressData] = useState<any>(undefined);

  const inputClasses = "w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#ea2a33] focus:border-[#ea2a33] outline-none transition-all placeholder:text-gray-400";
  const labelClasses = "block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2";

  // --- LOGIC ---

  const handleProfileBack = () => {
      if (profileSubView === 'MAIN') onBack();
      else setProfileSubView('MAIN');
  };

  const getProfileTitle = () => {
      switch(profileSubView) {
          case 'DATA': return 'Meus Dados';
          case 'ACCOUNT': return 'Minha Conta';
          case 'ADDRESSES': return 'Endereços';
          case 'PAYMENTS': return 'Pagamento';
          case 'POINTS': return 'Meus Pontos';
          default: return 'Meu Perfil';
      }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUserProfile({ ...userProfile, photo: event.target!.result as string });
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  // Card Logic
  const saveCard = () => {
      if (newCardForm.number) {
          setSavedCards([...savedCards, {
              id: Date.now().toString(),
              type: 'Cartão',
              last4: newCardForm.number.slice(-4) || '0000',
              holder: newCardForm.holder.toUpperCase() || 'TITULAR'
          }]);
          setNewCardForm({ number: '', holder: '', expiry: '', cvv: '' });
          setIsAddingCard(false);
      }
  };

  const removeCard = (id: string) => {
      setSavedCards(savedCards.filter(c => c.id !== id));
  };

  // Address Logic
  const deleteAddress = (id: string) => {
      setSavedAddresses(savedAddresses.filter(a => a.id !== id));
  };

  const handleSaveAddress = (addressData: any) => {
      const newId = addressData.id || Date.now().toString();
      const newAddress = { ...addressData, id: newId };

      if (addressData.id) {
          setSavedAddresses(savedAddresses.map(a => a.id === addressData.id ? newAddress : a));
      } else {
          setSavedAddresses([...savedAddresses, newAddress]);
      }
      setIsAddingAddress(false);
      setEditingAddressData(undefined);
  };

  return (
      <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#f8f6f6] dark:bg-background-dark text-slate-900 dark:text-white font-display">
        <header className="sticky top-0 z-50 flex items-center bg-[#f8f6f6] dark:bg-background-dark p-4 pb-2 justify-between border-b border-gray-200/50 dark:border-gray-800/50 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90 transition-colors">
            <button onClick={handleProfileBack} className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer text-slate-900 dark:text-white"><Icon name="arrow_back_ios_new" /></button>
            <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">{getProfileTitle()}</h2>
        </header>

        {profileSubView === 'MAIN' && (
            <div className="flex flex-col animate-[slideIn_0.2s_ease-out]">
                <section className="flex flex-col items-center pt-6 pb-8 px-4">
                    <div className="relative group cursor-pointer">
                        <div className="bg-center bg-no-repeat bg-cover rounded-full h-28 w-28 shadow-sm border-4 border-white dark:border-surface-dark" style={{ backgroundImage: `url("${userProfile.photo || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB29XorHVcwJGwRRGWOrz0DhVlWLKH13UCVeoUvBUQYVtfi4Sg8t4D7QPUBbEgAwcMQloRHoTRah8N_ACWg7ba0jVE7lsIJ0_51WjlWuwvC3OGDsFwhokZwKGgHTuVmihk_blPwTJl-U06y1UN7b1-jyTFhnwvPz7jYh7NbxksRuGevLFUeU7Otnn-i7PO80wp8S4npqCD4HX3VA7etXTlNaEVPpV5ArHaB1yd6SCMA_lwf8yYzh3nPNZTfOESDMxm2Tw9RAJtfzAk'}")` }}></div>
                        <button onClick={triggerPhotoUpload} className="absolute bottom-0 right-0 bg-[#ea2a33] text-white rounded-full p-1.5 border-4 border-[#f8f6f6] dark:border-background-dark flex items-center justify-center shadow-sm"><Icon name="photo_camera" className="text-[18px]" /></button>
                        <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                    </div>
                    <div className="flex flex-col items-center justify-center mt-4">
                        <p className="text-neutral-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] text-center">{userProfile.fullName || 'Maria Silva'}</p>
                        <div className="flex items-center gap-2 mt-2 bg-[#ea2a33]/10 px-4 py-1.5 rounded-full">
                            <Icon name="loyalty" className="text-[#ea2a33] text-sm" />
                            <p className="text-[#ea2a33] font-bold text-sm leading-normal">{userProfile.points} Pontos</p>
                        </div>
                    </div>
                </section>
                <div className="px-4 mb-6">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2 ml-2">Conta</h3>
                    <div className="bg-white dark:bg-surface-dark rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                        <button onClick={() => setProfileSubView('DATA')} className="w-full flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800/50">
                            <div className="flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-slate-900 dark:text-white shrink-0 size-10"><Icon name="person" /></div>
                            <div className="flex-1 min-w-0 text-left"><p className="text-slate-900 dark:text-white text-base font-medium truncate">Meus Dados</p></div>
                            <Icon name="chevron_right" className="text-gray-400" />
                        </button>
                         <button onClick={() => setProfileSubView('POINTS')} className="w-full flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800/50">
                            <div className="flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-slate-900 dark:text-white shrink-0 size-10"><Icon name="loyalty" /></div>
                            <div className="flex-1 min-w-0 text-left flex justify-between items-center pr-2">
                                <p className="text-slate-900 dark:text-white text-base font-medium truncate">Meus Pontos</p>
                                <span className="bg-[#ea2a33]/10 text-[#ea2a33] text-xs font-bold px-2 py-0.5 rounded-full">{userProfile.points}</span>
                            </div>
                            <Icon name="chevron_right" className="text-gray-400" />
                        </button>
                        <button onClick={() => setProfileSubView('ACCOUNT')} className="w-full flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800/50">
                            <div className="flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-slate-900 dark:text-white shrink-0 size-10"><Icon name="lock" /></div>
                            <div className="flex-1 min-w-0 text-left"><p className="text-slate-900 dark:text-white text-base font-medium truncate">Minha Conta</p></div>
                            <Icon name="chevron_right" className="text-gray-400" />
                        </button>
                        <button onClick={() => setProfileSubView('ADDRESSES')} className="w-full flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800/50">
                            <div className="flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-slate-900 dark:text-white shrink-0 size-10"><Icon name="location_on" /></div>
                            <div className="flex-1 min-w-0 flex justify-between items-center pr-2"><p className="text-slate-900 dark:text-white text-base font-medium truncate">Endereços Salvos</p><span className="bg-[#ea2a33]/10 text-[#ea2a33] text-xs font-bold px-2 py-0.5 rounded-full">{savedAddresses.length}</span></div>
                            <Icon name="chevron_right" className="text-gray-400" />
                        </button>
                        <button onClick={() => setProfileSubView('PAYMENTS')} className="w-full flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800/50">
                            <div className="flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-slate-900 dark:text-white shrink-0 size-10"><Icon name="credit_card" /></div>
                            <div className="flex-1 min-w-0 text-left"><p className="text-slate-900 dark:text-white text-base font-medium truncate">Formas de Pagamento</p></div>
                            <Icon name="chevron_right" className="text-gray-400" />
                        </button>
                         <div className="flex items-center gap-4 p-4 transition-colors">
                            <div className="flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-slate-900 dark:text-white shrink-0 size-10"><Icon name="notifications" /></div>
                            <div className="flex-1 min-w-0"><p className="text-slate-900 dark:text-white text-base font-medium truncate">Notificações</p></div>
                            <div className="relative inline-block w-12 h-7 align-middle select-none transition duration-200 ease-in cursor-pointer" onClick={() => setNotificationsEnabled(!notificationsEnabled)}>
                                <div className={`block overflow-hidden h-7 rounded-full cursor-pointer transition-colors duration-300 border-2 ${notificationsEnabled ? 'bg-[#ea2a33] border-[#ea2a33]' : 'bg-transparent border-gray-300 dark:border-gray-600'}`}></div>
                                <div className={`absolute block w-5 h-5 rounded-full bg-white shadow-sm appearance-none cursor-pointer transition-all duration-300 top-1 ${notificationsEnabled ? 'right-1' : 'left-1 bg-gray-300'}`}></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-4 pb-8 flex justify-center"><button onClick={onBack} className="text-[#ea2a33] text-base font-medium px-6 py-3 hover:bg-[#ea2a33]/5 rounded-lg transition-colors w-full text-center">Sair da conta</button></div>
            </div>
        )}

        {profileSubView === 'POINTS' && (
             <div className="p-4 space-y-6 animate-[slideIn_0.2s_ease-out]">
                 {/* Top Badge Card */}
                 <div className="flex justify-center">
                    <div className="bg-[#ea2a33]/10 rounded-full px-6 py-2 flex items-center gap-2 border border-[#ea2a33]/20 shadow-sm">
                        <Icon name="loyalty" className="text-[#ea2a33] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }} />
                        <span className="text-2xl font-bold text-[#ea2a33]">{userProfile.points} Pontos</span>
                    </div>
                 </div>

                 {/* History Section */}
                 <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 ml-1">Histórico de Pontos</h3>
                    <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        {mockPointsHistory.map((item, index) => (
                            <div key={item.id} className={`flex items-center justify-between p-4 ${index !== mockPointsHistory.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${item.type === 'EARN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                                        <Icon name={item.type === 'EARN' ? 'arrow_upward' : 'arrow_downward'} className="text-lg font-bold" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 dark:text-white text-sm">{item.description}</span>
                                        <span className="text-xs text-gray-500">{item.date}</span>
                                    </div>
                                </div>
                                <span className={`font-bold ${item.type === 'EARN' ? 'text-green-600' : 'text-red-500'}`}>
                                    {item.type === 'EARN' ? '+' : ''}{item.amount}
                                </span>
                            </div>
                        ))}
                    </div>
                 </div>
             </div>
        )}

        {profileSubView === 'DATA' && (
            <div className="p-4 space-y-4 animate-[slideIn_0.2s_ease-out]">
                <div>
                    <label className={labelClasses}>Nome Completo</label>
                    <input className={inputClasses} value={userProfile.fullName} onChange={(e) => setUserProfile({...userProfile, fullName: e.target.value})} />
                </div>
                <div>
                    <label className={labelClasses}>WhatsApp</label>
                    <input className={inputClasses} value={userProfile.whatsapp} onChange={(e) => setUserProfile({...userProfile, whatsapp: e.target.value})} />
                </div>
                <div>
                    <label className={labelClasses}>Data de Nascimento</label>
                    <div className="relative">
                        <input 
                            className={inputClasses} 
                            value={userProfile.birthDate || ''} 
                            onChange={(e) => setUserProfile({...userProfile, birthDate: maskDate(e.target.value)})} 
                            placeholder="DD/MM/AAAA"
                            maxLength={10}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Icon name="calendar_month" />
                        </span>
                    </div>
                </div>
                <div>
                    <label className={labelClasses}>Observações / Alergias</label>
                    <textarea 
                        className={inputClasses} 
                        value={userProfile.observations || ''} 
                        onChange={(e) => setUserProfile({...userProfile, observations: e.target.value})}
                        placeholder="Alguma observação ou alergia alimentar?"
                        rows={3}
                    />
                </div>
                <div className="pt-4">
                    <button className="w-full bg-[#ea2a33] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#ea2a33]/30 hover:bg-[#d6252d] transition-colors">Salvar Alterações</button>
                </div>
            </div>
        )}

        {profileSubView === 'ACCOUNT' && (
            <div className="p-4 space-y-4 animate-[slideIn_0.2s_ease-out]">
                <div>
                    <label className={labelClasses}>E-mail</label>
                    <input className={`${inputClasses} bg-gray-50 text-gray-500`} value={userProfile.email} readOnly />
                </div>
                
                <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">Alterar Senha</h3>
                
                <div>
                    <input type="password" placeholder="Senha Atual" className={inputClasses} />
                </div>
                <div>
                    <input type="password" placeholder="Nova Senha" className={inputClasses} />
                </div>
                <div>
                    <input type="password" placeholder="Confirmar Nova Senha" className={inputClasses} />
                </div>

                <div className="flex gap-3 pt-2">
                    <button className="flex-1 bg-white border border-gray-200 text-slate-600 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-colors">Cancelar</button>
                    <button className="flex-1 bg-[#ea2a33] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#ea2a33]/30 hover:bg-[#d6252d] transition-colors">Salvar</button>
                </div>
            </div>
        )}

        {profileSubView === 'ADDRESSES' && (
            <div className="p-4 space-y-4 animate-[slideIn_0.2s_ease-out]">
                {savedAddresses.map(addr => (
                    <div key={addr.id} className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-gray-600 dark:text-gray-300">
                                <Icon name={addr.icon || 'home'} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-base">{addr.label}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{addr.street}, {addr.number}</p>
                            </div>
                        </div>
                        <button onClick={() => deleteAddress(addr.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                            <Icon name="delete" className="text-xl" />
                        </button>
                    </div>
                ))}
                
                <button 
                    onClick={() => { setEditingAddressData(undefined); setIsAddingAddress(true); }} 
                    className="w-full bg-[#ea2a33] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#ea2a33]/30 hover:bg-[#d6252d] transition-colors flex items-center justify-center gap-2 mt-4"
                >
                    Novo Endereço
                </button>
            </div>
        )}

        {profileSubView === 'PAYMENTS' && (
            <div className="p-4 space-y-4 animate-[slideIn_0.2s_ease-out]">
                {savedCards.map(card => (
                    <div key={card.id} className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-gray-600 dark:text-gray-300">
                                <Icon name="credit_card" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-base">{card.type} •••• {card.last4}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{card.holder}</p>
                            </div>
                        </div>
                        <button onClick={() => removeCard(card.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                            <Icon name="delete" className="text-xl" />
                        </button>
                    </div>
                ))}
                
                {!isAddingCard ? (
                    <button onClick={() => setIsAddingCard(true)} className="w-full bg-[#ea2a33] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#ea2a33]/30 hover:bg-[#d6252d] transition-colors flex items-center justify-center gap-2 mt-4">
                        Adicionar Cartão
                    </button>
                ) : (
                    <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3 animate-[fadeIn_0.3s]">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-2">Novo Cartão</h4>
                        <input placeholder="Número do Cartão" className={inputClasses} maxLength={16} value={newCardForm.number} onChange={e => setNewCardForm({...newCardForm, number: e.target.value})} />
                        <input placeholder="Nome do Titular" className={inputClasses} value={newCardForm.holder} onChange={e => setNewCardForm({...newCardForm, holder: e.target.value})} />
                        <div className="flex gap-3">
                            <input placeholder="MM/AA" className={inputClasses} maxLength={5} value={newCardForm.expiry} onChange={e => setNewCardForm({...newCardForm, expiry: e.target.value})} />
                            <input placeholder="CVV" className={inputClasses} maxLength={3} value={newCardForm.cvv} onChange={e => setNewCardForm({...newCardForm, cvv: e.target.value})} />
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button onClick={() => setIsAddingCard(false)} className="flex-1 bg-white border border-gray-200 text-slate-600 font-bold py-3 rounded-lg hover:bg-gray-50">Cancelar</button>
                            <button onClick={saveCard} className="flex-1 bg-[#ea2a33] text-white font-bold py-3 rounded-lg hover:bg-[#d6252d]">Salvar</button>
                        </div>
                    </div>
                )}
            </div>
        )}
        
        {/* Address Modal - Integrated Here for Profile */}
        {isAddingAddress && (
            <AddressManager 
                initialData={editingAddressData}
                onClose={() => setIsAddingAddress(false)}
                onSave={handleSaveAddress}
            />
        )}
      </div>
  );
};