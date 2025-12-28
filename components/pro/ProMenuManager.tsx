
import React from 'react';

export default function ProMenuManager() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Gerenciar Cardápio</h3>
          <p className="text-slate-500">Edite produtos, preços e disponibilidade.</p>
        </div>
        <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all">
          + Novo Produto
        </button>
      </div>
      
      <div className="bg-white rounded-2xl p-20 flex flex-col items-center justify-center border border-dashed border-slate-300 text-slate-400">
        O carregamento do cardápio será implementado na próxima etapa.
      </div>
    </div>
  );
}
