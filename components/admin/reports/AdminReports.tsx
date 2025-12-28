
import React from 'react';
import { FileText, Download, TrendingUp, Calendar } from 'lucide-react';

export const AdminReports: React.FC = () => {
  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
        <div className="flex justify-end gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                <Calendar className="w-4 h-4" /> Últimos 30 dias
            </button>
            <button className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-colors">
                <Download className="w-4 h-4" /> Exportar CSV
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center gap-4 min-h-[250px]">
                <div className="size-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <FileText className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 text-lg">Vendas por Produto</h3>
                    <p className="text-sm text-slate-500">Ranking de itens mais vendidos</p>
                </div>
            </div>
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center gap-4 min-h-[250px]">
                <div className="size-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                    <TrendingUp className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 text-lg">Performance Financeira</h3>
                    <p className="text-sm text-slate-500">DRE e Lucratividade</p>
                </div>
            </div>
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center gap-4 min-h-[250px] opacity-60 border-dashed">
                <p className="font-black text-slate-300 uppercase tracking-widest text-sm">Mais relatórios em breve</p>
            </div>
        </div>
    </div>
  );
};
