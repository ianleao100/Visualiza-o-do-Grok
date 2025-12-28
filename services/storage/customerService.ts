
import { CustomerProfile } from '../../types';
import { KEYS } from './keys';

const dispatchEvents = () => {
    window.dispatchEvent(new Event('storage-update'));
    window.dispatchEvent(new Event('storage'));
};

export const customerService = {
    saveCustomers: (customers: CustomerProfile[]) => {
        localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
        dispatchEvents();
    },

    loadCustomers: (): CustomerProfile[] => {
        try {
            const data = localStorage.getItem(KEYS.CUSTOMERS);
            if (!data) return [];
            const parsed = JSON.parse(data);
            return parsed.map((c: any) => ({ ...c, lastOrderAt: new Date(c.lastOrderAt) }));
        } catch (e) {
            console.error("Erro ao carregar clientes", e);
            return [];
        }
    },

    updateCustomer: (updatedCustomer: CustomerProfile) => {
        const customers = customerService.loadCustomers();
        const index = customers.findIndex(c => c.id === updatedCustomer.id);
        if (index > -1) {
            customers[index] = updatedCustomer;
            customerService.saveCustomers(customers); // Já dispara eventos
        }
    },

    deleteCustomer: (customerId: string) => {
        try {
            const data = localStorage.getItem(KEYS.CUSTOMERS);
            if (!data) return;
            
            const customers: any[] = JSON.parse(data);
            const newCustomers = customers.filter(c => c.id !== customerId);
            
            localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(newCustomers));
            dispatchEvents();
        } catch (e) {
            console.error("[CUSTOMER SERVICE] Erro ao deletar cliente:", e);
        }
    }
};
