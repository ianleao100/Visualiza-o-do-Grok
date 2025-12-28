
import { KEYS } from './keys';

export interface Coupon {
    id: string;
    code: string;
    type: 'PERCENT' | 'FIXED';
    value: number;
    active: boolean;
    usageCount: number;
}

export interface MarketingConfig {
    pointsPerCurrency: number; // Ex: 1 real = 1 ponto
    featuredProductId: string | null;
}

export const marketingService = {
    // --- CUPONS ---
    getCoupons: (): Coupon[] => {
        try {
            const data = localStorage.getItem(KEYS.MARKETING_COUPONS);
            return data ? JSON.parse(data) : [];
        } catch { return []; }
    },

    saveCoupon: (coupon: Coupon) => {
        const coupons = marketingService.getCoupons();
        const exists = coupons.findIndex(c => c.id === coupon.id);
        if (exists > -1) {
            coupons[exists] = coupon;
        } else {
            coupons.push(coupon);
        }
        localStorage.setItem(KEYS.MARKETING_COUPONS, JSON.stringify(coupons));
    },

    deleteCoupon: (id: string) => {
        const coupons = marketingService.getCoupons().filter(c => c.id !== id);
        localStorage.setItem(KEYS.MARKETING_COUPONS, JSON.stringify(coupons));
    },

    // --- CONFIGURAÇÕES GERAIS (Fidelidade/Destaque) ---
    getConfig: (): MarketingConfig => {
        try {
            const data = localStorage.getItem(KEYS.MARKETING_CONFIG);
            return data ? JSON.parse(data) : { pointsPerCurrency: 1, featuredProductId: null };
        } catch { return { pointsPerCurrency: 1, featuredProductId: null }; }
    },

    saveConfig: (config: MarketingConfig) => {
        localStorage.setItem(KEYS.MARKETING_CONFIG, JSON.stringify(config));
    }
};
