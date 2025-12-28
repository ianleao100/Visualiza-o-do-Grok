
import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronLeft, Layers, Utensils, Zap, X, Plus, ArrowLeftRight, ShieldAlert, Bike } from 'lucide-react';
import { GLOBAL_EXTRAS } from '../../../constants';
import { Product, CartItem, TableConfig, PaymentMethodType, Order, OrderStatus } from '../../../types';
import { useTableOrders } from '../../../hooks/useTableOrders';
import { useCheckoutPersistence } from '../../../hooks/useCheckoutPersistence';
import { roundFinance } from '../../../shared/utils/mathEngine';
import { storageService } from '../../../services/storageService';

// Imports de componentes
import PosCart from '../../admin/pos/PosCart';
import TableGrid from '../../admin/pos/tables/TableGrid';
import TableManagementModal from '../../admin/pos/tables/TableManagementModal';
import TableTransferModal from '../../admin/pos/tables/TableTransferModal';
import PaymentModule from '../../admin/pos/PaymentModule';
import ProductSelectionModal from '../../admin/pos/ProductSelectionModal';
import DeliveryCheckoutModal from '../../admin/pos/DeliveryCheckoutModal';

interface ProPOSProps {
  onBack: () => void;
  cashierRegistry: any; 
  loyaltySystem: any;
}

const INITIAL_TABLES_MOCK: TableConfig[] = Array.from({ length: 10 }, (_, i) => ({
    id: (i + 1).toString(),
    number: (i + 1).toString(),
    description: i < 5 ? 'Salão Principal' : 'Área Externa'
}));

export const ProPOS: React.FC<ProPOSProps> = ({ onBack, cashierRegistry, loyaltySystem }) => {
  const { session, registerTransaction } = cashierRegistry;
  const { debitPoints, creditPoints, updateCustomerStats, customers } = loyaltySystem;
  
  // SOURCE OF TRUTH: Storage
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
      const loadData = () => {
          setProducts(storageService.getProducts());
          setCategories(storageService.getCategories());
      };
      
      loadData();

      // Listen for updates (e.g. Admin changes menu)
      const handleStorageChange = () => loadData();
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const { 
    tablesConfig, 
    tableSessions, 
    saveSession, 
    transferTableOrder,
    closeSession, 
    updateTableConfig, 
    removeTableConfig 
  } = useTableOrders(INITIAL_TABLES_MOCK);

  const { cart, setCart, customerData, updateCustomer, clearCheckout } = useCheckoutPersistence();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [posMode, setPosMode] = useState<'QUICK' | 'TABLES' | 'DELIVERY'>('QUICK');
  
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Partial<TableConfig> | null>(null);
  
  // Modals de Checkout
  const [paymentState, setPaymentState] = useState<{ subtotal: number, serviceFee: number, coverCharge: number, indices?: number[] } | null>(null);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);

  const [showExtraOptions, setShowExtraOptions] = useState(false);
  
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const [serviceFee, setServiceFee] = useState(0);
  const [serviceFeeType, setServiceFeeType] = useState<'BRL' | 'PERCENT'>('BRL');
  const [coverCharge, setCoverCharge] = useState(0);
  const [coverChargeType, setCoverChargeType] = useState<'BRL' | 'PERCENT'>('BRL');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'BRL' | 'PERCENT'>('BRL');
  const [splitCount, setSplitCount] = useState(1);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(p => 
    (activeCategory === 'ALL' || p.category === activeCategory) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
  );

  const renderCategories = [...categories];
  if (!renderCategories.includes('Geral') && products.some(p => p.category === 'Geral')) {
      renderCategories.push('Geral');
  }

  const activeCustomerPoints = useMemo(() => {
      if (!customerData.whatsapp || customerData.whatsapp.length < 8) return undefined;
      const customer = customers.find((c: any) => c.whatsapp === customerData.whatsapp);
      return customer ? customer.points : undefined;
  }, [customerData.whatsapp, customers]);

  const handleSelectTable = (table: TableConfig) => {
    const tableSession = tableSessions[table.id];
    setSelectedTableId(table.id);
    if (tableSession) {
      setCart(tableSession.items);
      updateCustomer({ name: tableSession.customerName, whatsapp: tableSession.customerWhatsapp || '' });
    } else {
      updateCustomer({ name: `Mesa ${table.number}`, whatsapp: '' });
    }
    setPosMode('TABLES'); 
  };

  const processPaymentSuccess = (payments: Record<string, number>, meta: { receivedAmount: number, changeAmount: number, customerName: string, customerWhatsapp: string, isDelivery: boolean, pointsUsed: number }) => {
    const methodsArray = Object.entries(payments).map(([method, amount]) => ({
      method: method as PaymentMethodType,
      amount
    }));
    
    const totalSaleValue = roundFinance(meta.receivedAmount - meta.changeAmount);
    
    let grossTotalForPoints = totalSaleValue; 
    if (paymentState) {
        grossTotalForPoints = paymentState.subtotal + paymentState.serviceFee + paymentState.coverCharge;
    }

    const description = selectedTableId 
      ? `Fechamento Mesa ${tablesConfig.find(t => t.id === selectedTableId)?.number}`
      : `Venda Rápida - ${meta.customerName || 'Geral'}`;

    registerTransaction('SALE', methodsArray, description, meta);
    
    if (meta.customerWhatsapp) {
        if (meta.pointsUsed > 0) debitPoints(meta.customerWhatsapp, meta.pointsUsed);
        if (grossTotalForPoints > 0) creditPoints(meta.customerWhatsapp, grossTotalForPoints);
        updateCustomerStats(meta.customerName, meta.customerWhatsapp, totalSaleValue);
    }

    if (paymentState?.indices) {
        const indicesToRemove = paymentState.indices;
        const newCart = cart.filter((_, idx) => !indicesToRemove.includes(idx));
        if (selectedTableId) {
            const tableNum = tablesConfig.find(t => t.id === selectedTableId)?.number || '';
            saveSession(selectedTableId, tableNum, meta.customerName, newCart, meta.customerWhatsapp);
        }
        setCart(newCart);
        setSelectedIndices([]);
    } else {
        if (selectedTableId) closeSession(selectedTableId);
        clearCheckout();
        setSelectedTableId(null);
        setSelectedIndices([]);
    }
    setPaymentState(null);
  };

  const handleDeliveryComplete = (orderData: any) => {
      const newOrder: Order = {
          id: `ORD-POS-DEL-${Math.floor(Math.random() * 100000)}`,
          customerName: `${orderData.customer.name} (PDV)`, 
          customerWhatsapp: orderData.customer.whatsapp,
          pointsUsed: orderData.customer.pointsUsed,
          items: [...cart],
          total: orderData.payment.total,
          subtotal: orderData.payment.subtotal,
          deliveryFee: orderData.delivery.fee,
          discount: orderData.payment.discount, 
          status: OrderStatus.PENDING,
          origin: 'DELIVERY',
          timestamp: new Date(),
          address: orderData.customer.address,
          isDelivery: true,
          driverName: orderData.delivery.driverName !== 'A definir' ? orderData.delivery.driverName : undefined,
          paymentMethod: orderData.payment.method
      };
      
      storageService.addOrder(newOrder);

      const methodsArray = [{ method: orderData.payment.method as PaymentMethodType, amount: orderData.payment.total }];
      registerTransaction('SALE', methodsArray, `Venda Delivery PDV - ${orderData.customer.name}`, { 
          receivedAmount: orderData.payment.total, 
          changeAmount: 0 
      });

      if (orderData.customer.whatsapp) {
          if (orderData.customer.pointsUsed > 0) debitPoints(orderData.customer.whatsapp, orderData.customer.pointsUsed);
          updateCustomerStats(orderData.customer.name, orderData.customer.whatsapp, orderData.payment.subtotal);
      }

      clearCheckout();
      setIsDeliveryModalOpen(false);
      setPosMode('QUICK');
  };

  const handleAddToCartFromModal = (itemToAdd: CartItem) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item => 
        item.id === itemToAdd.id && 
        JSON.stringify(item.selectedExtras) === JSON.stringify(itemToAdd.selectedExtras) &&
        item.notes === itemToAdd.notes
      );

      if (existingIdx > -1) {
        const newCart = [...prev];
        newCart[existingIdx].quantity += itemToAdd.quantity;
        return newCart;
      }
      return [...prev, itemToAdd];
    });
    setSelectedProduct(null);
  };

  const updateQty = (idx: number, delta: number) => {
    setCart(prev => prev.map((item, i) => i === idx ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(i => i.quantity > 0));
  };

  const currentTableNumber = tablesConfig.find(t => t.id === selectedTableId)?.number || '';

  return (
    <div className="fixed inset-0 z-[100] bg-[#f8f6f6] dark:bg-background-dark flex animate-[fadeIn_0.2s_ease-out] font-display">
      
      {!session.isOpen && (
         <div className="absolute inset-0 z-[550] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-6">
            <div className="bg-white dark:bg-surface-dark p-12 rounded-[40px] shadow-2xl text-center max-w-lg flex flex-col items-center gap-6 border-4 border-primary">
               <div className="size-24 bg-red-50 dark:bg-red-900/20 text-primary rounded-[32px] flex items-center justify-center animate-bounce">
                  <ShieldAlert className="w-12 h-12" />
               </div>
               <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Caixa Fechado!</h2>
                  <p className="text-slate-500 font-medium leading-relaxed">Para iniciar vendas, primeiro abra o caixa no painel principal de tesouraria.</p>
               </div>
               <button onClick={onBack} className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-black transition-all">VOLTAR PARA TESOURARIA</button>
            </div>
         </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200 dark:border-gray-800">
        <header className="h-24 bg-white dark:bg-surface-dark px-10 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-primary hover:text-white transition-all"><ChevronLeft /></button>
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-[20px] border dark:border-gray-700">
              <button 
                onClick={() => { setSelectedTableId(null); setPosMode('QUICK'); setSelectedIndices([]); updateCustomer({ name: '', whatsapp: '' }); }} 
                className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-xs transition-all ${posMode === 'QUICK' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-400'}`}
              >
                <Zap className="w-4 h-4" /> VENDA RÁPIDA
              </button>
              <button 
                onClick={() => setPosMode('TABLES')} 
                className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-xs transition-all ${posMode === 'TABLES' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-400'}`}
              >
                <Utensils className="w-4 h-4" /> MESAS
              </button>
              <button 
                onClick={() => { setSelectedTableId(null); setPosMode('DELIVERY'); setSelectedIndices([]); updateCustomer({ name: 'Delivery', whatsapp: '' }); }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-xs transition-all ${posMode === 'DELIVERY' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-400'}`}
              >
                <Bike className="w-4 h-4" /> DELIVERY
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
              {selectedTableId && (
                <button onClick={() => !!tableSessions[selectedTableId] && setIsTransferModalOpen(true)} disabled={!tableSessions[selectedTableId]} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase transition-all ${!tableSessions[selectedTableId] ? 'bg-gray-100 text-slate-400 cursor-not-allowed opacity-60' : 'bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-100'}`}>
                  <ArrowLeftRight className="w-4 h-4" /> Trocar Mesa
                </button>
              )}
              <div className="relative w-72 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary w-5 h-5" />
                <input type="text" placeholder="Pesquisar produto..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold shadow-sm"/>
              </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {posMode === 'TABLES' && !selectedTableId ? (
            <TableGrid 
              tablesConfig={tablesConfig} 
              tableSessions={tableSessions} 
              onSelectTable={handleSelectTable} 
              onEditTable={(e, t) => { e.stopPropagation(); setEditingTable(t); setIsTableModalOpen(true); }} 
              onDeleteTable={(e, id) => { e.stopPropagation(); removeTableConfig(id); }} 
              onAddTable={() => { setEditingTable({ id: Math.random().toString(36).substr(2,9), number: '', description: '' }); setIsTableModalOpen(true); }}
            />
          ) : (
            <div className="p-10">
                <div className="flex flex-col gap-10 max-w-4xl mx-auto pb-20">
                {renderCategories.map(cat => {
                    if (activeCategory !== 'ALL' && activeCategory !== cat) return null;
                    const catProducts = filteredProducts.filter(p => p.category === cat);
                    if (catProducts.length === 0) return null;
                    return (
                    <div key={cat} className="space-y-6 animate-[fadeIn_0.4s]">
                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-2"><Layers className="w-5 h-5 text-primary" /><h2 className="text-xl font-black uppercase">{cat}</h2></div>
                        <div className="flex flex-col gap-4">
                        {catProducts.map(p => (
                            <div key={p.id} onClick={() => setSelectedProduct(p)} className={`flex items-stretch justify-between gap-6 rounded-[24px] bg-white dark:bg-surface-dark p-4 shadow-sm transition-all group border dark:border-gray-800 ${p.available === false ? 'opacity-60 cursor-not-allowed grayscale' : 'hover:shadow-xl hover:scale-[1.01] cursor-pointer'}`}>
                                <div className="flex flex-col justify-between flex-1 py-1">
                                    <div>
                                        <h3 className="text-slate-900 dark:text-white text-lg font-black group-hover:text-primary transition-colors flex items-center gap-2">
                                            {p.name}
                                            {p.available === false && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Esgotado</span>}
                                        </h3>
                                        <p className="text-slate-500 dark:text-gray-400 text-sm font-medium line-clamp-2 mt-1">{p.description}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-4"><p className="text-xl font-black font-display">R$ {p.price.toFixed(2)}</p>{p.available !== false && <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"><Plus className="w-4 h-4" /> Customizar</div>}</div>
                                </div>
                                <div className="relative w-32 h-32 bg-center bg-cover rounded-2xl shadow-md group-hover:scale-105 transition-all" style={{backgroundImage: `url('${p.imageUrl}')`}}></div>
                            </div>
                        ))}
                        </div>
                    </div>
                    );
                })}
                </div>
            </div>
          )}
        </div>
      </div>

      <PosCart 
        cart={cart} customerName={customerData.name} setCustomerName={(name) => updateCustomer({ name })} customerWhatsapp={customerData.whatsapp} setCustomerWhatsapp={(whatsapp) => updateCustomer({ whatsapp })} tableNumber={currentTableNumber} setTableNumber={() => {}} updateQty={updateQty} showExtraOptions={showExtraOptions} setShowExtraOptions={setShowExtraOptions} serviceFee={serviceFee} setServiceFee={setServiceFee} serviceFeeType={serviceFeeType} setServiceFeeType={setServiceFeeType} coverCharge={coverCharge} setCoverCharge={setCoverCharge} coverChargeType={coverChargeType} setCoverChargeType={setCoverChargeType} discount={discount} setDiscount={setDiscount} discountType={discountType} setDiscountType={setDiscountType} splitCount={splitCount} setSplitCount={setSplitCount} 
        onSaveToTable={(selectedTableId) ? () => { const tNum = tablesConfig.find(t => t.id === selectedTableId)?.number || ''; saveSession(selectedTableId, tNum, customerData.name, cart, customerData.whatsapp); setSelectedTableId(null); clearCheckout(); setPosMode('TABLES'); } : undefined} 
        posMode={posMode}
        onOpenPayment={(data) => {
            if (posMode === 'DELIVERY') {
                setIsDeliveryModalOpen(true);
            } else {
                setPaymentState({ subtotal: data.subtotal, serviceFee: data.serviceFee, coverCharge: data.coverCharge, indices: data.indices });
            }
        }} 
        onPrint={() => alert('Imprimindo...')} isTableView={selectedTableId !== null}
        selectedIndices={selectedIndices} setSelectedIndices={setSelectedIndices}
      />

      {isTableModalOpen && editingTable && (<TableManagementModal editingTable={editingTable} setEditingTable={setEditingTable} onClose={() => setIsTableModalOpen(false)} onSave={() => { updateTableConfig(editingTable as TableConfig); setIsTableModalOpen(false); }}/>)}
      {isTransferModalOpen && selectedTableId && (<TableTransferModal currentTableId={selectedTableId} tablesConfig={tablesConfig} tableSessions={tableSessions} onClose={() => setIsTransferModalOpen(false)} onTransfer={(toId) => { transferTableOrder(selectedTableId, toId); setIsTransferModalOpen(false); setSelectedTableId(null); clearCheckout(); }}/>)}
      
      {paymentState && (
        <PaymentModule 
            cart={paymentState.indices ? cart.filter((_, i) => paymentState.indices!.includes(i)) : cart} 
            customerPoints={activeCustomerPoints}
            customerName={customerData.name} 
            setCustomerName={(n) => updateCustomer({name: n})} 
            customerWhatsapp={customerData.whatsapp} 
            setCustomerWhatsapp={(w) => updateCustomer({whatsapp: w})} 
            subtotal={paymentState.subtotal} 
            initialServiceFee={paymentState.serviceFee} 
            initialCoverCharge={paymentState.coverCharge} 
            onClose={() => setPaymentState(null)} 
            onConfirm={processPaymentSuccess}
        />
      )}

      {isDeliveryModalOpen && (
          <DeliveryCheckoutModal 
            onClose={() => setIsDeliveryModalOpen(false)}
            cart={cart}
            subtotal={roundFinance(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
            onConfirm={handleDeliveryComplete}
            loyaltySystem={loyaltySystem}
          />
      )}
      
      {selectedProduct && (
        <ProductSelectionModal 
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCartFromModal}
            extras={GLOBAL_EXTRAS}
        />
      )}
    </div>
  );
};
