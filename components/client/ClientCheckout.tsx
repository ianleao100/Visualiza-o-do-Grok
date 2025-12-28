
import React from 'react';
import { Order } from '../../types';
import { AddressManager } from '../common/AddressManager';
import { useCartLogic } from '../../hooks/core/useCartLogic';
import { useCheckoutLogic } from '../../hooks/useCheckoutLogic';
import { CheckoutMap } from './checkout/CheckoutMap';
import { PaymentSelector } from './checkout/PaymentSelector';

interface ClientCheckoutProps {
    viewMode: 'CART' | 'CHECKOUT_DELIVERY' | 'CHECKOUT_PAYMENT';
    setViewMode: (mode: any) => void;
    cartLogic: ReturnType<typeof useCartLogic>;
    userProfile: any;
    savedAddresses: any[];
    setSavedAddresses: (addresses: any[]) => void;
    onCheckoutComplete: (order: Order) => void;
}

const Icon: React.FC<{ name: string, className?: string, style?: React.CSSProperties }> = ({ name, className = "", style }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{name}</span>
);

export const ClientCheckout: React.FC<ClientCheckoutProps> = ({
    viewMode,
    setViewMode,
    cartLogic,
    userProfile,
    savedAddresses,
    setSavedAddresses,
    onCheckoutComplete
}) => {
    const { 
        // State
        orderNotes, setOrderNotes,
        deliveryMethod, setDeliveryMethod,
        selectedAddressId,
        usePoints, setUsePoints,
        paymentSelections,
        activePaymentIdToUpdate, setActivePaymentIdToUpdate,
        coordinates,
        isAddingAddress, setIsAddingAddress,
        editingAddressData, 
        
        // Handlers
        handleSelectAddress,
        handleEditAddress,
        saveAddress,
        handleAddPaymentMethod,
        handleRemovePaymentMethod,
        updatePaymentMethod,
        handlePaymentValueUpdate,
        handlePaymentFieldChange,
        finalizeCheckout
    } = useCheckoutLogic({
        cartLogic,
        userProfile,
        savedAddresses,
        setSavedAddresses,
        onCheckoutComplete
    });

    const { cart, updateQuantity, removeFromCart, subtotal, deliveryFee, total, pointsDiscountValue } = cartLogic;

    // --- VIEWS ---

    if (viewMode === 'CART') {
        return (
            <div className="relative min-h-screen flex flex-col w-full overflow-x-hidden bg-[#f8f6f6] dark:bg-background-dark pb-32">
                <header className="sticky top-0 z-40 bg-[#f8f6f6]/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-black/5 dark:border-white/5 transition-colors">
                    <div className="flex items-center justify-between px-4 py-3">
                        <button onClick={() => setViewMode('MENU')} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-slate-900 dark:text-white">
                            <Icon name="arrow_back" className="text-2xl" />
                        </button>
                        <h1 className="text-lg font-bold tracking-tight flex-1 text-center pr-10 text-slate-900 dark:text-white">Revisar Pedido</h1>
                    </div>
                </header>
                <main className="flex-1 flex flex-col gap-6 p-4">
                    <section className="flex flex-col gap-4">
                        <h2 className="text-base font-semibold px-1 text-slate-900 dark:text-white">Itens do Pedido</h2>
                        {cart.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">Seu carrinho está vazio.</div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="flex gap-4 p-3 bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-black/5 dark:border-white/5 transition-colors">
                                    <div className="shrink-0"><div className="bg-center bg-no-repeat bg-cover rounded-xl w-20 h-20" style={{ backgroundImage: `url('${item.imageUrl}')` }}></div></div>
                                    <div className="flex flex-col flex-1 justify-between py-0.5">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-sm leading-tight text-slate-900 dark:text-white line-clamp-2">{item.name}</h3>
                                                <button onClick={() => removeFromCart(item.id)} className="text-gray-500 dark:text-gray-400 hover:text-[#ea2a33] transition-colors"><Icon name="delete" className="text-xl" /></button>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{item.description}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-[#ea2a33] font-bold text-sm">R$ {item.price.toFixed(2)}</span>
                                            <div className="flex items-center gap-3 bg-[#f8f6f6] dark:bg-background-dark rounded-lg px-2 py-1 border border-black/5 dark:border-white/5">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-[#ea2a33] hover:bg-[#ea2a33]/10 rounded-md transition-colors font-medium text-lg leading-none pb-0.5">-</button>
                                                <span className="text-sm font-semibold w-4 text-center text-slate-900 dark:text-white">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-[#ea2a33] hover:bg-[#ea2a33]/10 rounded-md transition-colors font-medium text-lg leading-none pb-0.5">+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </section>
                    {cart.length > 0 && (
                        <>
                            <section className="flex flex-col gap-2">
                                <h2 className="text-base font-semibold px-1 text-slate-900 dark:text-white">Observações</h2>
                                <div className="relative">
                                    <textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} className="w-full bg-white dark:bg-surface-dark rounded-xl border-none focus:ring-1 focus:ring-[#ea2a33] text-sm p-4 min-h-[80px] text-slate-900 dark:text-white placeholder:text-gray-400 resize-none shadow-sm transition-colors" placeholder="Ex: Tirar a cebola, caprichar no molho..."></textarea>
                                </div>
                            </section>
                            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 mt-2">
                                <h2 className="text-base font-bold mb-4 text-slate-900 dark:text-white">Resumo do Pedido</h2>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>Subtotal</span><span className="font-bold text-slate-900 dark:text-white">R$ {subtotal.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>Taxa de entrega</span><span className="font-bold text-slate-900 dark:text-white">R$ {deliveryFee.toFixed(2)}</span></div>
                                </div>
                                <div className="my-4 border-t border-gray-100 dark:border-gray-800"></div>
                                <div className="flex justify-between items-center"><span className="font-bold text-lg text-slate-900 dark:text-white">Total</span><span className="font-bold text-xl text-[#ea2a33]">R$ {total.toFixed(2)}</span></div>
                            </div>
                        </>
                    )}
                </main>
                <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a1a1a] border-t border-black/5 dark:border-white/5 px-4 pt-4 pb-8 z-50 rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] w-full lg:max-w-md mx-auto transition-colors">
                    <button onClick={() => setViewMode('CHECKOUT_DELIVERY')} disabled={cart.length === 0} className="w-full bg-[#ea2a33] hover:bg-red-600 text-white font-bold text-base py-4 rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all flex items-center justify-between px-6 group disabled:opacity-50 disabled:shadow-none">
                        <span>Continuar para Entrega</span>
                        <div className="flex items-center gap-2"><span>R$ {total.toFixed(2)}</span><span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span></div>
                    </button>
                </div>
            </div>
        );
    }

    if (viewMode === 'CHECKOUT_DELIVERY') {
        return (
            <div className="relative min-h-screen flex flex-col w-full overflow-x-hidden bg-[#f8f6f6] dark:bg-background-dark pb-32">
                <header className="sticky top-0 z-40 bg-[#f8f6f6]/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center justify-between px-4 py-3">
                        <button onClick={() => setViewMode('CART')} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-slate-900 dark:text-white">
                            <Icon name="arrow_back" className="text-2xl" />
                        </button>
                        <h1 className="text-lg font-bold tracking-tight flex-1 text-center pr-10 text-slate-900 dark:text-white">Entrega</h1>
                    </div>
                </header>
                <main className="flex-1 flex flex-col gap-6 p-4">
                    <section>
                        <div className="flex p-1 bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 rounded-xl">
                            <button onClick={() => setDeliveryMethod('DELIVERY')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${deliveryMethod === 'DELIVERY' ? 'bg-[#ea2a33]/10 text-[#ea2a33] shadow-sm' : 'text-gray-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'}`}>Entrega</button>
                            <button onClick={() => setDeliveryMethod('PICKUP')} className={`flex-1 py-2 text-sm font-medium transition-all rounded-lg ${deliveryMethod === 'PICKUP' ? 'bg-[#ea2a33]/10 text-[#ea2a33] shadow-sm' : 'text-gray-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'}`}>Retirada</button>
                        </div>
                    </section>
                    {deliveryMethod === 'DELIVERY' && (
                        <div className="flex flex-col md:grid md:grid-cols-3 gap-6 h-full">
                            <div className="md:col-span-2 order-1 md:order-2">
                                <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 h-full flex flex-col gap-3">
                                    <div className="flex items-center justify-between"><h2 className="text-base font-bold text-slate-900 dark:text-white">Localização no Mapa</h2></div>
                                    <CheckoutMap coordinates={coordinates} savedAddresses={savedAddresses} />
                                </div>
                            </div>
                            <div className="md:col-span-1 flex flex-col gap-4 order-2 md:order-1">
                                <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 flex flex-col gap-4">
                                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Endereço de Entrega</h2>
                                    <div className="flex flex-col gap-3">
                                        {savedAddresses.map(addr => (
                                            <div key={addr.id} onClick={() => handleSelectAddress(addr.id)} className={`flex items-center gap-4 p-4 rounded-xl shadow-sm cursor-pointer transition-all border ${selectedAddressId === addr.id ? 'bg-[#f8f6f6] dark:bg-background-dark border-[#ea2a33]/20' : 'bg-white dark:bg-surface-dark border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selectedAddressId === addr.id ? 'bg-[#ea2a33]/10' : 'bg-gray-100 dark:bg-gray-800'}`}><span className={`material-symbols-outlined ${selectedAddressId === addr.id ? 'text-[#ea2a33]' : 'text-gray-500'}`}>{addr.icon || 'home'}</span></div>
                                                <div className="flex-1 min-w-0">
                                                    {selectedAddressId === addr.id && (<p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-0.5">Selecionado<span className="material-symbols-outlined text-[12px] text-[#ea2a33] filled-icon">check_circle</span></p>)}
                                                    <p className={`text-sm font-bold truncate ${selectedAddressId === addr.id ? 'text-slate-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>{addr.label}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{addr.street}, {addr.number} - {addr.district}</p>
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); handleEditAddress(addr); }} className="shrink-0 p-2 text-gray-400 hover:text-[#ea2a33] hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><Icon name="edit" className="text-[18px]" /></button>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => { setIsAddingAddress(true); }} className="flex items-center justify-center gap-2 w-full p-3.5 rounded-xl border border-dashed border-[#ea2a33]/40 hover:bg-[#ea2a33]/5 text-[#ea2a33] font-bold text-sm transition-all group"><span className="material-symbols-outlined group-hover:scale-110 transition-transform">add_location_alt</span>Novo Endereço</button>
                                </div>
                                <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-black/5 dark:border-white/5">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-base">Resumo do Pedido</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>Subtotal</span><span className="font-bold text-slate-900 dark:text-white">R$ {subtotal.toFixed(2)}</span></div>
                                        <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>Taxa de entrega</span><span className="font-bold text-slate-900 dark:text-white">R$ {deliveryFee.toFixed(2)}</span></div>
                                    </div>
                                    <div className="my-4 border-t border-gray-100 dark:border-gray-800"></div>
                                    <div className="flex justify-between items-center"><span className="font-bold text-lg text-slate-900 dark:text-white">Total</span><span className="font-bold text-xl text-[#ea2a33]">R$ {total.toFixed(2)}</span></div>
                                </div>
                            </div>
                        </div>
                    )}
                    {deliveryMethod === 'PICKUP' && (
                        <div className="flex flex-col items-center justify-center py-10 text-center gap-4 animate-[fadeIn_0.3s]">
                            <div className="w-24 h-24 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-2"><Icon name="storefront" className="text-5xl text-orange-500" /></div>
                            <div><h3 className="font-bold text-xl text-slate-900 dark:text-white">Retirada na Loja</h3><p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">Dirija-se ao balcão para retirar seu pedido assim que estiver pronto.</p></div>
                            <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm w-full max-w-sm text-left mt-4">
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Endereço da Loja</p><p className="font-bold text-slate-900 dark:text-white">Dreamlícias - Centro</p><p className="text-sm text-gray-500 dark:text-gray-400">Rua Augusta, 1500 - Consolação, SP</p>
                            </div>
                        </div>
                    )}
                </main>
                <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a1a1a] border-t border-black/5 dark:border-white/5 px-4 pt-4 pb-8 z-50 rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] w-full lg:max-w-md mx-auto">
                    <button onClick={() => setViewMode('CHECKOUT_PAYMENT')} disabled={deliveryMethod === 'DELIVERY' && !selectedAddressId} className="w-full bg-[#ea2a33] hover:bg-red-600 text-white font-bold text-base py-4 rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all flex items-center justify-between px-6 group disabled:opacity-50 disabled:shadow-none">
                        <span>Ir para Pagamento</span>
                        <div className="flex items-center gap-2"><span>R$ {total.toFixed(2)}</span><span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span></div>
                    </button>
                </div>
                {isAddingAddress && (<AddressManager initialData={editingAddressData} onClose={() => setIsAddingAddress(false)} onSave={saveAddress} />)}
            </div>
        );
    }

    if (viewMode === 'CHECKOUT_PAYMENT') {
        return (
            <div className="relative min-h-screen flex flex-col w-full max-w-md mx-auto overflow-x-hidden bg-[#f8f6f6] dark:bg-background-dark pb-32">
                <header className="sticky top-0 z-40 bg-[#f8f6f6]/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center justify-between px-4 py-3">
                        <button onClick={() => setViewMode('CHECKOUT_DELIVERY')} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-slate-900 dark:text-white"><Icon name="arrow_back" className="text-2xl" /></button>
                        <h1 className="text-lg font-bold tracking-tight flex-1 text-center pr-10 text-slate-900 dark:text-white">Pagamento</h1>
                    </div>
                </header>
                <main className="flex-1 flex flex-col gap-6 p-4">
                    <PaymentSelector 
                        paymentSelections={paymentSelections}
                        activePaymentIdToUpdate={activePaymentIdToUpdate}
                        total={total}
                        onSetActivePaymentId={setActivePaymentIdToUpdate}
                        onAddPaymentMethod={handleAddPaymentMethod}
                        onRemovePaymentMethod={handleRemovePaymentMethod}
                        onUpdateMethod={updatePaymentMethod}
                        onUpdateValue={handlePaymentValueUpdate}
                        onUpdateField={handlePaymentFieldChange}
                    />
                    <section className="flex flex-col gap-3">
                        <h2 className="text-base font-semibold px-1 text-slate-900 dark:text-white">Ganhar Desconto</h2>
                        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-black/5 dark:border-white/5 p-4 flex flex-col gap-4">
                            <div className="flex gap-3"><div className="relative flex-1 group"><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Icon name="local_offer" className="text-gray-500 dark:text-gray-400 transition-colors group-focus-within:text-[#ea2a33]" /></div><input className="block w-full pl-11 p-3.5 text-sm rounded-xl bg-gray-50 dark:bg-background-dark text-slate-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-gray-700 focus:border-[#ea2a33] focus:ring-1 focus:ring-[#ea2a33] outline-none transition-all shadow-sm" placeholder="Adicionar cupom" type="text"/></div><button className="px-5 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-[#ea2a33] hover:bg-[#ea2a33] hover:text-white hover:border-[#ea2a33] transition-all shadow-sm">Aplicar</button></div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-xl">
                                <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0 text-yellow-600 dark:text-yellow-500"><Icon name="stars" /></div><div><p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Saldo de Pontos</p><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Você tem <span className="font-medium text-yellow-600 dark:text-yellow-500">{userProfile.points}</span> pontos</p></div></div>
                                <label className="relative inline-flex items-center cursor-pointer"><input className="sr-only peer" type="checkbox" checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)} /><div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ea2a33]"></div></label>
                            </div>
                        </div>
                    </section>
                    <section className="flex flex-col gap-3">
                        <h2 className="text-base font-semibold px-1 text-slate-900 dark:text-white">Resumo do Valor</h2>
                        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-black/5 dark:border-white/5 p-4 flex flex-col gap-3">
                            <div className="flex justify-between items-center text-sm"><span className="text-gray-500 dark:text-gray-400">Subtotal</span><span className="font-medium text-slate-900 dark:text-white">R$ {subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between items-center text-sm"><span className="text-gray-500 dark:text-gray-400">Taxa de entrega</span><span className="font-medium text-slate-900 dark:text-white">R$ {deliveryFee.toFixed(2)}</span></div>
                            {usePoints && (<div className="flex justify-between items-center text-sm"><span className="text-gray-500 dark:text-gray-400">Desconto Pontos</span><span className="font-medium text-green-600">- R$ {pointsDiscountValue.toFixed(2)}</span></div>)}
                            <div className="h-px bg-gray-100 dark:bg-gray-800 my-1"></div>
                            <div className="flex justify-between items-center text-lg"><span className="font-bold text-slate-900 dark:text-white">Total</span><span className="font-bold text-[#ea2a33]">R$ {total.toFixed(2)}</span></div>
                        </div>
                    </section>
                </main>
                <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a1a1a] border-t border-black/5 dark:border-white/5 px-4 pt-4 pb-8 z-50 rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] w-full max-w-md mx-auto">
                    <button onClick={finalizeCheckout} className="w-full bg-[#ea2a33] hover:bg-red-600 text-white font-bold text-base py-4 rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all flex items-center justify-between px-6 group">
                        <span>Fazer Pedido</span>
                        <div className="flex items-center gap-2"><span>R$ {total.toFixed(2)}</span><Icon name="arrow_forward" className="text-xl group-hover:translate-x-1 transition-transform" /></div>
                    </button>
                </div>
            </div>
        );
    }

    return null;
};
