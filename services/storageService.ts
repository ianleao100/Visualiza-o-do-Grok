
import { menuService } from './storage/menuService';
import { orderService } from './storage/orderService';
import { riderStorageService } from './storage/riderStorageService';
import { customerService } from './storage/customerService';
import { cashierService } from './storage/cashierService';
import { marketingService } from './storage/marketingService';
import { settingsService } from './storage/settingsService';

// Facade Unificada - Delega para os serviços especializados
export const storageService = {
    // --- MENU & PRODUTOS ---
    getProducts: menuService.getProducts,
    saveProducts: menuService.saveProducts,
    deleteProduct: menuService.deleteProduct, // Delegação direta
    duplicateProduct: menuService.duplicateProduct,
    toggleProductAvailability: menuService.toggleProductAvailability,
    
    // --- CATEGORIAS ---
    getCategories: menuService.getCategories,
    saveCategories: menuService.saveCategories,
    addCategory: menuService.addCategory,       
    updateCategory: menuService.updateCategory, 
    renameCategory: menuService.updateCategory, 
    deleteCategory: menuService.deleteCategory, // Delegação direta (Lógica centralizada no menuService)

    // --- EXTRAS ---
    getExtras: menuService.getExtras,
    isExtraAvailableForProduct: menuService.isExtraAvailableForProduct,
    toggleProductExtraAvailability: menuService.toggleProductExtraAvailability,
    toggleExtraAvailability: menuService.toggleExtraAvailability,

    // --- PEDIDOS ---
    saveOrders: orderService.saveOrders,
    loadOrders: orderService.loadOrders,
    addOrder: orderService.addOrder,
    updateOrder: orderService.updateOrder,
    saveActiveOrders: orderService.saveActiveOrders,
    loadActiveOrders: orderService.loadActiveOrders,
    savePosDraft: orderService.savePosDraft,
    loadPosDraft: orderService.loadPosDraft,

    // --- ENTREGADORES ---
    loadDrivers: riderStorageService.loadDrivers,
    incrementDriverCount: riderStorageService.incrementDriverCount,
    resetDriverCounts: riderStorageService.resetDriverCounts,

    // --- CLIENTES ---
    saveCustomers: customerService.saveCustomers,
    loadCustomers: customerService.loadCustomers,
    updateCustomer: customerService.updateCustomer,
    deleteCustomer: customerService.deleteCustomer, // Delegação direta

    // --- CAIXA ---
    saveCashierSession: cashierService.saveCashierSession,
    loadCashierSession: cashierService.loadCashierSession,
    saveCashierTransactions: cashierService.saveCashierTransactions,
    loadCashierTransactions: cashierService.loadCashierTransactions,
    saveCashierHistoryRecord: cashierService.saveCashierHistoryRecord,
    loadCashierHistory: cashierService.loadCashierHistory,

    // --- MARKETING ---
    getCoupons: marketingService.getCoupons,
    saveCoupon: marketingService.saveCoupon,
    deleteCoupon: marketingService.deleteCoupon,
    getMarketingConfig: marketingService.getConfig,
    saveMarketingConfig: marketingService.saveConfig,

    // --- CONFIGURAÇÕES ---
    getStoreProfile: settingsService.getStoreProfile,
    saveStoreProfile: settingsService.saveStoreProfile,
    getStoreHours: settingsService.getHours,
    saveStoreHours: settingsService.saveHours,

    // --- UTILITÁRIOS ---
    clearAll: () => {
        localStorage.clear();
        window.dispatchEvent(new Event('storage-update'));
        window.dispatchEvent(new Event('storage'));
    }
};
