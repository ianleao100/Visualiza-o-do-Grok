
import React, { useState, useMemo } from 'react';
import { ShieldAlert } from 'lucide-react';
import { INITIAL_PRODUCTS, GLOBAL_EXTRAS } from '../../../constants';
import { Product, TableConfig, CartItem } from '../../../types';
import { useTableOrders } from '../../../hooks/useTableOrders';
import { useCheckoutPersistence } from '../../../hooks/useCheckoutPersistence';
import { usePosTransaction } from '../../../hooks/pro/usePosTransaction';
import { roundFinance } from '../../../shared/utils/mathEngine';

// Modular Components
import PosCart from './PosCart';
import PosHeader from './PosHeader';
import PosProductGrid from './PosProductGrid';
import TableGrid from './tables/TableGrid';
import TableManagementModal from './tables/TableManagementModal';
import TableTransferModal from './tables/TableTransferModal';
import PaymentModule from './PaymentModule';
import ProductSelectionModal from './ProductSelectionModal';
import DeliveryCheckoutModal from './DeliveryCheckoutModal';

interface PosSystemProps {
  onBack: () => void;
  cashierRegistry: any; 
  loyaltySystem: any;
}

const INITIAL_TABLES_MOCK: TableConfig[] = Array.from({ length: 10 }, (_, i) => ({
    id: (i + 1).toString(),
    number: (i + 1).toString(),
    description: i < 5 ? 'Salão Principal' : 'Área Externa'
}));

export default function PosSystem({ onBack, cashierRegistry, loyaltySystem }: PosSystemProps) {
  // --- CORE HOOKS ---
  const { 
    tablesConfig, tableSessions, saveSession, transferTableOrder, closeSession, updateTableConfig, removeTableConfig 
  } = useTableOrders(INITIAL_TABLES_MOCK);

  const { cart, setCart, customerData, updateCustomer, clearCheckout } = useCheckoutPersistence();

  // --- UI STATE ---
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [posMode, setPosMode] = useState<'QUICK' | 'TABLES' | 'DELIVERY'>('QUICK');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  
  // Modals Local State
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Partial<TableConfig> | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  // --- TRANSACTION LOGIC HOOK ---
  const transactionLogic = usePosTransaction({
      cashierRegistry,
      loyaltySystem,
      cart,
      customerData,
      selectedTableId,
      tablesConfig,
      saveSession,
      closeSession,
      clearCheckout,
      setCart,
      setSelectedIndices,
      setPosMode
  });

  // --- HELPERS ---
  const activeCustomerPoints = useMemo(() => {
      if (!customerData.whatsapp || customerData.whatsapp.length < 8) return undefined;
      const customer = loyaltySystem.customers.find((c: any) => c.whatsapp === customerData.whatsapp);
      return customer ? customer.points : undefined;
  }, [customerData.whatsapp, loyaltySystem.customers]);

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

  const handleAddToCartFromModal = (itemToAdd: CartItem) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.id === itemToAdd.id && JSON.stringify(item.selectedExtras) === JSON.stringify(itemToAdd.selectedExtras) && item.notes === itemToAdd.notes);
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
      {!cashierRegistry.session.isOpen && (
         <div className="absolute inset-0 z-[550] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-6">
            <div className="bg-white dark:bg-surface-dark p-12 rounded-[40px] shadow-2xl text-center max-w-lg flex flex-col items-center gap-6 border-4 border-primary">
               <div className="size-24 bg-red-50 dark:bg-red-900/20 text-primary rounded-[32px] flex items-center justify-center animate-bounce"><ShieldAlert className="w-12 h-12" /></div>
               <div className="space-y-2"><h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Caixa Fechado!</h2><p className="text-slate-500 font-medium leading-relaxed">Para iniciar vendas, primeiro abra o caixa no painel principal de tesouraria.</p></div>
               <button onClick={onBack} className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-black transition-all">VOLTAR PARA TESOURARIA</button>
            </div>
         </div>
      )}

      {/* LEFT COLUMN: NAVIGATION & CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200 dark:border-gray-800">
        <PosHeader 
            onBack={onBack}
            posMode={posMode}
            setPosMode={setPosMode}
            selectedTableId={selectedTableId}
            onTransferTable={() => setIsTransferModalOpen(true)}
            isTransferEnabled={!!(selectedTableId && tableSessions[selectedTableId])}
            search={search}
            setSearch={setSearch}
            onResetSelection={() => { setSelectedTableId(null); setSelectedIndices([]); updateCustomer({ name: '', whatsapp: '' }); }}
        />

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
            <PosProductGrid 
                products={INITIAL_PRODUCTS}
                search={search}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                onSelectProduct={setSelectedProduct}
            />
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: CART */}
      <PosCart 
        cart={cart}
        customerName={customerData.name} setCustomerName={(name) => updateCustomer({ name })}
        customerWhatsapp={customerData.whatsapp} setCustomerWhatsapp={(whatsapp) => updateCustomer({ whatsapp })}
        tableNumber={currentTableNumber} setTableNumber={() => {}}
        updateQty={updateQty}
        isTableView={selectedTableId !== null}
        posMode={posMode}
        selectedIndices={selectedIndices} setSelectedIndices={setSelectedIndices}
        onSaveToTable={(selectedTableId) ? () => { const tNum = tablesConfig.find(t => t.id === selectedTableId)?.number || ''; saveSession(selectedTableId, tNum, customerData.name, cart, customerData.whatsapp); setSelectedTableId(null); clearCheckout(); setPosMode('TABLES'); } : undefined}
        onOpenPayment={(data) => {
            if (posMode === 'DELIVERY') transactionLogic.setIsDeliveryModalOpen(true);
            else transactionLogic.setPaymentState({ subtotal: data.subtotal, serviceFee: data.serviceFee, coverCharge: data.coverCharge, indices: data.indices });
        }}
        onPrint={() => alert('Imprimindo...')}
        // Financial Props from Hook
        {...transactionLogic}
      />

      {/* MODALS */}
      {isTableModalOpen && editingTable && <TableManagementModal editingTable={editingTable} setEditingTable={setEditingTable} onClose={() => setIsTableModalOpen(false)} onSave={() => { updateTableConfig(editingTable as TableConfig); setIsTableModalOpen(false); }}/>}
      {isTransferModalOpen && selectedTableId && <TableTransferModal currentTableId={selectedTableId} tablesConfig={tablesConfig} tableSessions={tableSessions} onClose={() => setIsTransferModalOpen(false)} onTransfer={(toId) => { transferTableOrder(selectedTableId, toId); setIsTransferModalOpen(false); setSelectedTableId(null); clearCheckout(); }}/>}
      
      {transactionLogic.paymentState && (
        <PaymentModule 
            cart={transactionLogic.paymentState.indices ? cart.filter((_, i) => transactionLogic.paymentState!.indices!.includes(i)) : cart} 
            customerPoints={activeCustomerPoints}
            customerName={customerData.name} setCustomerName={(n) => updateCustomer({name: n})} 
            customerWhatsapp={customerData.whatsapp} setCustomerWhatsapp={(w) => updateCustomer({whatsapp: w})} 
            subtotal={transactionLogic.paymentState.subtotal} 
            initialServiceFee={transactionLogic.paymentState.serviceFee} 
            initialCoverCharge={transactionLogic.paymentState.coverCharge} 
            onClose={() => transactionLogic.setPaymentState(null)} 
            onConfirm={transactionLogic.processPaymentSuccess}
        />
      )}

      {transactionLogic.isDeliveryModalOpen && (
          <DeliveryCheckoutModal 
            onClose={() => transactionLogic.setIsDeliveryModalOpen(false)}
            cart={cart}
            subtotal={roundFinance(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
            onConfirm={transactionLogic.handleDeliveryComplete}
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
}
