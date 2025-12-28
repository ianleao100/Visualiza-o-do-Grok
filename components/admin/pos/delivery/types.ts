import { PaymentMethodType } from '../../../../types';

export interface DeliveryAddress {
    id: string;
    label: string;
    street: string;
    number: string;
    district: string;
    complement?: string;
    reference?: string;
    lat: number;
    lng: number;
}

export interface DeliveryCustomer {
    name: string;
    whatsapp: string;
    points: number;
    addresses?: DeliveryAddress[];
    address?: DeliveryAddress; // Legacy support
}

export interface DeliveryOrderData {
    customer: {
        name: string;
        whatsapp: string;
        address: string;
        pointsUsed: number;
    };
    delivery: {
        fee: number;
        coordinates: { lat: number; lng: number };
        waived: boolean;
    };
    payment: {
        method: PaymentMethodType;
        total: number;
        subtotal: number;
        discount: number;
        changeFor?: string;
    };
}
