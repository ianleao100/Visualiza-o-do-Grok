
import React from 'react';

export default function ProOrders() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Gestão de Pedidos</h3>
          <p className="text-slate-500">Monitore e processe as vendas em tempo real.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-orange-500">
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Pendentes</p>
          <p className="text-3xl font-black text-slate-900 mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500">
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Em Preparo</p>
          <p className="text-3xl font-black text-slate-900 mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-green-500">
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Entregues</p>
          <p className="text-3xl font-black text-slate-900 mt-2">0</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-20 flex flex-col items-center justify-center border border-dashed border-slate-300">
        <p className="text-slate-400 font-medium">Os novos pedidos aparecerão aqui...</p>
      </div>
    </div>
  );
}
