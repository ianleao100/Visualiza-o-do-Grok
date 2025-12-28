
import React, { useState, useEffect } from 'react';
import { Product, CartItem, OrderStatus, Order, UserProfile, Address, SavedCard, Review, ClientViewMode } from '../types';
import { storageService } from '../services/storageService'; 
import { ClientProfile } from './client/ClientProfile';
import { ClientCheckout } from './client/ClientCheckout';
import { ClientOrderHistory } from './client/ClientOrderHistory';
import { ClientReviews } from './client/ClientReviews';
import { ClientMenu } from './client/ClientMenu';
import { OrderTracking } from './client/OrderTracking';

interface ClientViewProps {
  onBack: () => void;
}

export const ClientView: React.FC<ClientViewProps> = ({ onBack }) => {
  // SOURCE OF TRUTH: Load from Storage with Event Listener
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [viewMode, setViewMode] = useState<ClientViewMode>('MENU');
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);
  
  // Carrega dados iniciais e configura o listener de sincronização
  useEffect(() => {
      const loadData = () => {
          setProducts(storageService.getProducts());
      };

      loadData();

      // Escuta eventos de "storage" (disparados pelo Admin ao salvar)
      // e eventos customizados na mesma janela
      const handleStorageChange = () => loadData();
      
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
          window.removeEventListener('storage', handleStorageChange);
      };
  }, []);

  // Profile Data
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: 'Maria Silva',
    whatsapp: '(11) 99999-9999',
    email: 'maria.silva@email.com',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB29XorHVcwJGwRRGWOrz0DhVlWLKH13UCVeoUvBUQYVtfi4Sg8t4D7QPUBbEgAwcMQloRHoTRah8N_ACWg7ba0jVE7lsIJ0_51WjlWuwvC3OGDsFwhokZwKGgHTuVmihk_blPwTJl-U06y1UN7b1-jyTFhnwvPz7jYh7NbxksRuGevLFUeU7Otnn-i7PO80wp8S4npqCD4HX3VA7etXTlNaEVPpV5ArHaB1yd6SCMA_lwf8yYzh3nPNZTfOESDMxm2Tw9RAJtfzAk',
    points: 350
  });

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([
    { id: '1', label: 'Casa', icon: 'home', street: 'Rua das Flores', number: '123', district: 'Jardim', complement: 'Apt 401', reference: '', lat: -14.2233, lng: -42.7766 },
    { id: '2', label: 'Trabalho', icon: 'work', street: 'Av. Paulista', number: '1000', district: 'Bela Vista', complement: '10º Andar', reference: 'Prédio comercial', lat: -14.2233, lng: -42.7766 },
  ]);

  const [savedCards, setSavedCards] = useState<SavedCard[]>([
    { id: '1', type: 'Mastercard', last4: '4455', holder: 'MARIA SILVA' },
    { id: '2', type: 'Visa', last4: '1234', holder: 'MARIA SILVA' }
  ]);

  const [myOrders, setMyOrders] = useState<Order[]>([
     {
        id: 'ORD-HIST-001',
        customerName: 'Maria Silva',
        items: [
            { ...products[0] || {id:'1', name:'Item Mock', price: 10, description:'', category:'', imageUrl:'', quantity: 1}, quantity: 2 }
        ],
        subtotal: 62.00,
        deliveryFee: 5.00,
        discount: 0,
        total: 67.00,
        status: OrderStatus.DELIVERED,
        timestamp: new Date(Date.now() - 86400000),
        address: 'Rua das Flores, 123 - Jardim',
        paymentMethod: 'Cartão de Crédito •••• 4455'
     }
  ]);

  const [reviews] = useState<Review[]>([
      {
          id: '1',
          userName: 'Mariana Silva',
          userImage: 'https://i.pravatar.cc/150?u=mariana',
          rating: 5,
          date: 'Há 2 horas',
          comment: 'O lanche estava delicioso e chegou super rápido.',
          hasPhoto: true
      }
  ]);

  const handleCheckoutComplete = (newOrder: Order) => {
      const completeOrder: Order = {
          ...newOrder,
          code: Math.floor(100000 + Math.random() * 900000).toString(),
          subtotal: newOrder.total - 5.00 + (newOrder.discount || 0),
          deliveryFee: 5.00,
          paymentMethod: 'Cartão de Crédito'
      };
      setMyOrders(prev => [completeOrder, ...prev]);
      setCart([]);
      setActiveTrackingOrder(completeOrder);
      setViewMode('ORDER_TRACKING');
  };

  const handleTrackOrder = (order: Order) => {
      setActiveTrackingOrder(order);
      setViewMode('ORDER_TRACKING');
  };

  const handleAddToCart = (itemToAdd: CartItem) => {
      setCart(prev => {
        const existing = prev.find(item => item.id === itemToAdd.id);
        if (existing) {
          return prev.map(item => item.id === itemToAdd.id ? { ...item, quantity: item.quantity + itemToAdd.quantity } : item);
        }
        return [...prev, itemToAdd];
      });
  };

  const handleRepeatOrder = (order: Order) => {
      setCart(prev => [...prev, ...order.items]);
      setViewMode('CART');
  };

  // --- RENDERING LOGIC ---

  if (viewMode === 'ORDER_TRACKING' && activeTrackingOrder) {
      return (
          <OrderTracking 
            order={activeTrackingOrder} 
            onClose={() => setViewMode('MENU')} 
          />
      );
  }

  if (viewMode === 'PROFILE') {
    return (
        <ClientProfile 
            onBack={() => setViewMode('MENU')}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            savedAddresses={savedAddresses}
            setSavedAddresses={setSavedAddresses}
            savedCards={savedCards}
            setSavedCards={setSavedCards}
        />
    );
  }

  if (viewMode === 'CART' || viewMode === 'CHECKOUT_DELIVERY' || viewMode === 'CHECKOUT_PAYMENT') {
      return (
          <ClientCheckout 
              viewMode={viewMode}
              setViewMode={setViewMode}
              cartLogic={{
                  cart,
                  setCart,
                  addToCart: handleAddToCart,
                  removeFromCart: (id) => setCart(prev => prev.filter(i => i.id !== id)),
                  updateQuantity: (id, delta) => setCart(prev => prev.map(i => i.id === id ? {...i, quantity: i.quantity + delta} : i).filter(i => i.quantity > 0)),
                  clearCart: () => setCart([]),
                  subtotal: cart.reduce((acc, item) => acc + (item.price * item.quantity), 0),
                  deliveryFee: 5,
                  setDeliveryFee: () => {},
                  discount: 0,
                  setDiscount: () => {},
                  pointsToUse: 0,
                  setPointsToUse: () => {},
                  pointsDiscountValue: 0,
                  total: cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) + 5,
                  itemsCount: cart.reduce((acc, item) => acc + item.quantity, 0)
              }}
              userProfile={userProfile}
              savedAddresses={savedAddresses}
              setSavedAddresses={setSavedAddresses}
              onCheckoutComplete={handleCheckoutComplete}
          />
      );
  }

  if (viewMode === 'ORDERS') {
    return (
      <ClientOrderHistory 
        onBack={() => setViewMode('MENU')}
        myOrders={myOrders}
        onRepeatOrder={handleRepeatOrder}
        onTrackOrder={handleTrackOrder}
      />
    );
  }

  if (viewMode === 'REVIEWS') {
    return (
        <ClientReviews 
            onBack={() => setViewMode('MENU')}
            reviews={reviews}
        />
    );
  }

  return (
    <ClientMenu 
        products={products}
        userProfile={userProfile}
        cart={cart}
        onAddToCart={handleAddToCart}
        onNavigate={setViewMode}
        onBack={onBack}
    />
  );
};
