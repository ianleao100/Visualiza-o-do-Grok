
import React from 'react';
import { X, Clock, User, DollarSign, AlertCircle, CheckCircle, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { CashierHistoryRecord } from '../../../types';
import { BaseModal } from '../../ui/BaseModal';
import { formatCurrency } from '../../../shared/utils/mathEngine';

interface CashierDetailModalProps {
    record: CashierHistoryRecord;
    onClose: () => void;
}

export default function CashierDetailModal({ record, onClose }: CashierDetailModalProps) {
    
    // Group transactions
    const supplies = record.transactions.filter(t => t.type === 'DEPOSIT');
    const bleeds = record.transactions.filter(t => t.type === 'WITHDRAWAL');
    const sales = record.transactions.filter(t => t.type === 'SALE');

    const statusConfig = {
        'OK': { color: 'text-green-500', bg: 'bg-green-50', icon: CheckCircle, label: 'Caixa Batido' },
        'SHORTAGE': { color: 'text-red-500', bg: 'bg-red-50', icon: AlertCircle, label: 'Quebra de Caixa' },
        'SURPLUS': { color: 'text-blue-500', bg: 'bg-blue-50', icon: TrendingUp, label: 'Sobra de Caixa' }
    }[record.status];

    const StatusIcon = statusConfig.icon;

    return (
        <BaseModal onClose={onClose} className="max-w-4xl w-full h-[85vh]" hideCloseButton={true}>
            <div className="flex flex-col h-full bg-[#f8f6f6] dark:bg-background-dark rounded-[32px] overflow-hidden relative">
                
                {/* Header */}
                <div className="bg-white dark:bg-surface-dark px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Dossiê do Turno</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-slate-400">{record.openedAt.toLocaleDateString()}</span>
                            <span className="text-xs font-bold text-slate-300">•</span>
                            <span className="text-xs font-bold text-slate-400">Resp: {record.responsibleName}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl hover:text-red-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-8">
                    
                    {/* 1. Cronologia e Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-surface-dark p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Cronologia
                            </h3>
                            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Abertura</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{record.openedAt.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300" />
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Fechamento</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{record.closedAt.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                                </div>
                            </div>
                        </div>

                        <div className={`p-6 rounded-[24px] border shadow-sm flex flex-col gap-4 ${statusConfig.bg} border-${statusConfig.color.split('-')[1]}-200`}>
                            <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${statusConfig.color}`}>
                                <StatusIcon className="w-4 h-4" /> Resultado da Auditoria
                            </h3>
                            <div className="flex items-end justify-between">
                                <span className={`text-lg font-black ${statusConfig.color}`}>{statusConfig.label}</span>
                                <span className={`text-3xl font-black ${statusConfig.color}`}>{formatCurrency(Math.abs(record.difference))}</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Conferência de Valores (Grid 3 cols) */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Conferência Financeira</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-surface-dark p-5 rounded-[24px] border border-gray-100 dark:border-gray-800 flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Saldo Inicial</span>
                                <span className="text-xl font-black text-slate-700 dark:text-gray-300">{formatCurrency(record.initialValue)}</span>
                            </div>
                            <div className="bg-white dark:bg-surface-dark p-5 rounded-[24px] border border-gray-100 dark:border-gray-800 flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Entradas (Vendas)</span>
                                <span className="text-xl font-black text-green-600">+{formatCurrency(record.summary.sales)}</span>
                            </div>
                            <div className="bg-white dark:bg-surface-dark p-5 rounded-[24px] border border-gray-100 dark:border-gray-800 flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Saídas (Sangrias)</span>
                                <span className="text-xl font-black text-red-500">-{formatCurrency(record.summary.withdrawals)}</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Fechamento Cego (Comparativo) */}
                    <div className="bg-slate-900 text-white p-6 rounded-[24px] shadow-lg flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor Esperado (Sistema)</span>
                            <span className="text-2xl font-black">{formatCurrency(record.finalSystemValue)}</span>
                        </div>
                        <div className="h-10 w-px bg-white/10"></div>
                        <div className="flex flex-col gap-1 text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor Informado (Operador)</span>
                            <span className="text-2xl font-black text-yellow-400">{formatCurrency(record.finalRealValue)}</span>
                        </div>
                    </div>

                    {/* 4. Detalhamento de Movimentações */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Movimentações Manuais */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Movimentações Manuais</h3>
                            <div className="bg-white dark:bg-surface-dark rounded-[24px] border border-gray-100 dark:border-gray-800 overflow-hidden">
                                {supplies.length === 0 && bleeds.length === 0 ? (
                                    <div className="p-6 text-center text-slate-400 text-xs font-bold">Nenhuma movimentação manual.</div>
                                ) : (
                                    <div className="divide-y divide-gray-50 dark:divide-gray-800">
                                        {[...supplies, ...bleeds].map(t => (
                                            <div key={t.id} className="p-4 flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-700 dark:text-gray-300">{t.description}</span>
                                                    <span className="text-[10px] text-slate-400">{t.timestamp.toLocaleTimeString()}</span>
                                                </div>
                                                <span className={`text-sm font-black ${t.type === 'DEPOSIT' ? 'text-green-500' : 'text-red-500'}`}>
                                                    {t.type === 'DEPOSIT' ? '+' : '-'} {formatCurrency(t.total)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Breakdown Vendas */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Composição das Vendas</h3>
                            <div className="bg-white dark:bg-surface-dark rounded-[24px] border border-gray-100 dark:border-gray-800 p-6 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-600 dark:text-gray-300">Dinheiro</span>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(record.summary.cash)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-600 dark:text-gray-300">PIX</span>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(record.summary.pix)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-600 dark:text-gray-300">Cartões</span>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(record.summary.card)}</span>
                                </div>
                                <div className="pt-3 border-t border-dashed border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                    <span className="text-xs font-black text-slate-400 uppercase">Total Bruto</span>
                                    <span className="text-base font-black text-primary">{formatCurrency(record.summary.sales)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </BaseModal>
    );
}
