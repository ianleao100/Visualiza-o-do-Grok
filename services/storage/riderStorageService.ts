
import { RiderProfile } from '../../types';
import { MOCK_DRIVERS } from '../../constants';
import { KEYS } from './keys';

export const riderStorageService = {
    loadDrivers: (): RiderProfile[] => {
        try {
            const data = localStorage.getItem(KEYS.DRIVERS);
            if (!data) {
                // Initialize with Mock Data if empty
                localStorage.setItem(KEYS.DRIVERS, JSON.stringify(MOCK_DRIVERS));
                return MOCK_DRIVERS;
            }
            return JSON.parse(data);
        } catch (e) { return MOCK_DRIVERS; }
    },

    incrementDriverCount: (driverId: string, amount: number = 1) => {
        const drivers = riderStorageService.loadDrivers();
        const idx = drivers.findIndex(d => d.id === driverId);
        if (idx > -1) {
            drivers[idx].dailyOrdersCount += amount;
            if (amount > 3) drivers[idx].status = 'BUSY'; 
            localStorage.setItem(KEYS.DRIVERS, JSON.stringify(drivers));
        }
    },

    resetDriverCounts: () => {
        const drivers = riderStorageService.loadDrivers();
        const resetDrivers = drivers.map(d => ({ ...d, dailyOrdersCount: 0, status: 'AVAILABLE' }));
        localStorage.setItem(KEYS.DRIVERS, JSON.stringify(resetDrivers));
    }
};
