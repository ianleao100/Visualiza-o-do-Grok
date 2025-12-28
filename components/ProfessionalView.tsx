import React, { useState } from 'react';
import { MOCK_ORDERS } from '../constants';
import { Order, OrderStatus } from '../types';
import { Button } from './Button';
import { Clock, CheckCircle, Truck, Package, LogOut } from 'lucide-react';

interface ProfessionalViewProps {
  onLogout: () => void;
}

export const ProfessionalView: React.FC<ProfessionalViewProps> = ({ onLogout }) => {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'ALL'>('ALL');

  const updateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case OrderStatus.CONFIRMED: return 'bg-blue-50 text-blue-800 border-blue-200';
      case OrderStatus.PREPARING: return 'bg-orange-100 text-orange-800 border-orange-200';
      case OrderStatus.READY: return 'bg-purple-100 text-purple-800 border-purple-200';
      case OrderStatus.DELIVERED: return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = activeTab === 'ALL' ? orders : orders.filter(o => o.status === activeTab);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded">
             <Package className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Professional Portal</h1>
        </div>
        <Button variant="ghost" onClick={onLogout} className="text-slate-300 hover:text-white">
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </Button>
      </header>

      <main className="flex-1 p-6 flex flex-col md:flex-row gap-6 overflow-hidden">
        
        {/* Sidebar / Filters */}
        <div className="w-full md:w-64 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('ALL')}
            className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'ALL' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            All Orders ({orders.length})
          </button>
          <button 
             onClick={() => setActiveTab(OrderStatus.PENDING)}
             className={`text-left px-4 py-3 rounded-lg font-medium transition-colors flex justify-between ${activeTab === OrderStatus.PENDING ? 'bg-white shadow text-yellow-600' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            Pending <span>{orders.filter(o => o.status === OrderStatus.PENDING).length}</span>
          </button>
          <button 
             onClick={() => setActiveTab(OrderStatus.CONFIRMED)}
             className={`text-left px-4 py-3 rounded-lg font-medium transition-colors flex justify-between ${activeTab === OrderStatus.CONFIRMED ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            Confirmed <span>{orders.filter(o => o.status === OrderStatus.CONFIRMED).length}</span>
          </button>
          <button 
             onClick={() => setActiveTab(OrderStatus.PREPARING)}
             className={`text-left px-4 py-3 rounded-lg font-medium transition-colors flex justify-between ${activeTab === OrderStatus.PREPARING ? 'bg-white shadow text-orange-600' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            Preparing <span>{orders.filter(o => o.status === OrderStatus.PREPARING).length}</span>
          </button>
          <button 
             onClick={() => setActiveTab(OrderStatus.READY)}
             className={`text-left px-4 py-3 rounded-lg font-medium transition-colors flex justify-between ${activeTab === OrderStatus.READY ? 'bg-white shadow text-purple-600' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            Ready (Dispatch) <span>{orders.filter(o => o.status === OrderStatus.READY).length}</span>
          </button>
        </div>

        {/* Orders List - Kanban Style List */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {filteredOrders.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-400">
               <Package className="w-16 h-16 mb-4 opacity-20" />
               <p>No orders found in this category.</p>
             </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow border border-slate-200 p-6 flex flex-col lg:flex-row gap-6">
                
                {/* Order Details */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-500 text-sm">#{order.id}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center text-slate-500 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      {order.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{order.customerName}</h3>
                  <p className="text-slate-500 text-sm mb-4">{order.address}</p>

                  <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="font-medium text-slate-800">{item.quantity}x {item.name}</span>
                        <span className="text-slate-500">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900 mt-2">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row lg:flex-col justify-center gap-2 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                   {order.status === OrderStatus.PENDING && (
                     <Button onClick={() => updateStatus(order.id, OrderStatus.CONFIRMED)} className="w-full bg-blue-600 hover:bg-blue-700">
                       Accept Order
                     </Button>
                   )}
                   {order.status === OrderStatus.CONFIRMED && (
                     <Button onClick={() => updateStatus(order.id, OrderStatus.PREPARING)} className="w-full bg-orange-500 hover:bg-orange-600">
                       Start Preparing
                     </Button>
                   )}
                   {order.status === OrderStatus.PREPARING && (
                     <Button onClick={() => updateStatus(order.id, OrderStatus.READY)} className="w-full bg-purple-600 hover:bg-purple-700">
                       Mark Ready
                     </Button>
                   )}
                   {order.status === OrderStatus.READY && (
                     <Button onClick={() => updateStatus(order.id, OrderStatus.DELIVERED)} className="w-full bg-green-600 hover:bg-green-700">
                       <Truck className="w-4 h-4 mr-2" />
                       Dispatch & Deliver
                     </Button>
                   )}
                   {order.status === OrderStatus.DELIVERED && (
                     <div className="text-center text-green-600 font-bold flex items-center justify-center">
                       <CheckCircle className="w-5 h-5 mr-2" />
                       Completed
                     </div>
                   )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};