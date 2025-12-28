import React from 'react';
import { PaymentMethodType } from '../../../../types';
import DeliveryStepCustomer from './steps/DeliveryStepCustomer';
import DeliveryStepMap from './steps/DeliveryStepMap';
import DeliveryStepPayment from './steps/DeliveryStepPayment';
import { DeliveryAddress } from './types';

interface DeliveryStepsProps {
    step: number;
    // Step 1 Props
    customerSearch: string;
    handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    showSuggestions: boolean;
    suggestions: any[];
    handleSelectSuggestion: (customer: any) => void;
    customerFound: boolean;
    customerName: string;
    setCustomerName: (val: string) => void;
    customerPhone: string;
    setCustomerPhone: (val: string) => void;
    customerPoints: number;
    savedAddresses: DeliveryAddress[];
    selectedAddressId: string;
    handleSelectAddress: (id: string) => void;
    addressForm: any;
    setAddressForm: (field: string, val: string) => void;
    // Step 2 Props
    geoCoords: { lat: number, lng: number };
    setGeoCoords: (coords: { lat: number, lng: number }) => void;
    manualMapSearch: string;
    setManualMapSearch: (val: string) => void;
    handleManualMapSearch: () => void;
    isLoadingGeo: boolean;
    onExpandMap: () => void;
    // Step 3 Props
    subtotal: number;
    totalValue: number;
    deliveryFee: number;
    setDeliveryFee: (val: number) => void;
    discount: number;
    setDiscount: (val: number) => void;
    discountType: 'BRL' | 'PERCENT';
    setDiscountType: (type: 'BRL' | 'PERCENT') => void;
    usePoints: boolean;
    setUsePoints: (val: boolean) => void;
    pointsToUse: number;
    setPointsToUse: (val: number) => void;
    paymentMethod: PaymentMethodType;
    setPaymentMethod: (method: PaymentMethodType) => void;
    cashPaidAmount: string;
    setCashPaidAmount: (val: string) => void;
    changeValue: number;
    calculatedDiscount: number;
    pointsDiscountValue: number;
    showMoreOptions: boolean;
    setShowMoreOptions: (val: boolean) => void;
}

export default function DeliverySteps(props: DeliveryStepsProps) {
    const { step } = props;

    // --- STEP 1: CLIENTE E ENDEREÇO ---
    if (step === 1) {
        return (
            <DeliveryStepCustomer 
                customerSearch={props.customerSearch}
                handleSearchChange={props.handleSearchChange}
                showSuggestions={props.showSuggestions}
                suggestions={props.suggestions}
                handleSelectSuggestion={props.handleSelectSuggestion}
                customerFound={props.customerFound}
                customerName={props.customerName}
                setCustomerName={props.setCustomerName}
                customerPhone={props.customerPhone}
                setCustomerPhone={props.setCustomerPhone}
                customerPoints={props.customerPoints}
                savedAddresses={props.savedAddresses}
                selectedAddressId={props.selectedAddressId}
                handleSelectAddress={props.handleSelectAddress}
                addressForm={props.addressForm}
                setAddressForm={props.setAddressForm}
            />
        );
    }

    // --- STEP 2: MAPA ---
    if (step === 2) {
        return (
            <DeliveryStepMap 
                geoCoords={props.geoCoords}
                setGeoCoords={props.setGeoCoords}
                manualMapSearch={props.manualMapSearch}
                setManualMapSearch={props.setManualMapSearch}
                handleManualMapSearch={props.handleManualMapSearch}
                isLoadingGeo={props.isLoadingGeo}
                onExpandMap={props.onExpandMap}
            />
        );
    }

    // --- STEP 3: PAGAMENTO ---
    if (step === 3) {
        return (
            <DeliveryStepPayment 
                subtotal={props.subtotal}
                totalValue={props.totalValue}
                deliveryFee={props.deliveryFee}
                setDeliveryFee={props.setDeliveryFee}
                discount={props.discount}
                setDiscount={props.setDiscount}
                discountType={props.discountType}
                setDiscountType={props.setDiscountType}
                usePoints={props.usePoints}
                setUsePoints={props.setUsePoints}
                pointsToUse={props.pointsToUse}
                setPointsToUse={props.setPointsToUse}
                paymentMethod={props.paymentMethod}
                setPaymentMethod={props.setPaymentMethod}
                cashPaidAmount={props.cashPaidAmount}
                setCashPaidAmount={props.setCashPaidAmount}
                changeValue={props.changeValue}
                calculatedDiscount={props.calculatedDiscount}
                pointsDiscountValue={props.pointsDiscountValue}
                showMoreOptions={props.showMoreOptions}
                setShowMoreOptions={props.setShowMoreOptions}
                customerPoints={props.customerPoints}
            />
        );
    }

    return null;
}