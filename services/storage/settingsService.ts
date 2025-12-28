
import { KEYS } from './keys';

export interface StoreProfile {
    name: string;
    cnpj: string;
    address: string;
    phone: string;
    deliveryBaseFee: number;
    freeShippingThreshold: number; // Valor mínimo para frete grátis
}

export interface DaySchedule {
    day: string; // 'Segunda', 'Terça'...
    isOpen: boolean;
    openTime: string;
    closeTime: string;
}

const DEFAULT_HOURS: DaySchedule[] = [
    { day: 'Segunda', isOpen: true, openTime: '18:00', closeTime: '23:00' },
    { day: 'Terça', isOpen: true, openTime: '18:00', closeTime: '23:00' },
    { day: 'Quarta', isOpen: true, openTime: '18:00', closeTime: '23:00' },
    { day: 'Quinta', isOpen: true, openTime: '18:00', closeTime: '23:00' },
    { day: 'Sexta', isOpen: true, openTime: '18:00', closeTime: '00:00' },
    { day: 'Sábado', isOpen: true, openTime: '18:00', closeTime: '00:00' },
    { day: 'Domingo', isOpen: true, openTime: '18:00', closeTime: '23:00' },
];

export const settingsService = {
    getStoreProfile: (): StoreProfile => {
        try {
            const data = localStorage.getItem(KEYS.STORE_SETTINGS);
            return data ? JSON.parse(data) : {
                name: 'Dreamlícias',
                cnpj: '',
                address: '',
                phone: '',
                deliveryBaseFee: 5.00,
                freeShippingThreshold: 100.00
            };
        } catch { 
            return { name: 'Dreamlícias', cnpj: '', address: '', phone: '', deliveryBaseFee: 5.00, freeShippingThreshold: 100.00 }; 
        }
    },

    saveStoreProfile: (profile: StoreProfile) => {
        localStorage.setItem(KEYS.STORE_SETTINGS, JSON.stringify(profile));
    },

    getHours: (): DaySchedule[] => {
        try {
            const data = localStorage.getItem(KEYS.STORE_HOURS);
            return data ? JSON.parse(data) : DEFAULT_HOURS;
        } catch { return DEFAULT_HOURS; }
    },

    saveHours: (schedule: DaySchedule[]) => {
        localStorage.setItem(KEYS.STORE_HOURS, JSON.stringify(schedule));
    }
};
