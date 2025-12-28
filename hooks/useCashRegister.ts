
import { useState, useEffect, useCallback, useMemo } from 'react';
import { CashierSession, CashTransaction, PaymentMethodType, TransactionType, CashierHistoryRecord } from '../types';
import { cashierService } from '../services/storage/cashierService';
import { roundFinance } from '../shared/utils/mathEngine';

export const useCashRegister = () => {
  const [session, setSession] = useState<CashierSession>(() => cashierService.loadCashierSession());
  const [transactions, setTransactions] = useState<CashTransaction[]>(() => cashierService.loadCashierTransactions());

  // Sincronização com Storage
  useEffect(() => {
    cashierService.saveCashierSession(session);
  }, [session]);

  useEffect(() => {
    cashierService.saveCashierTransactions(transactions);
  }, [transactions]);

  const totals = useMemo(() => {
    const summary = {
      PIX: 0,
      CASH: 0,
      CREDIT: 0,
      DEBIT: 0,
      WITHDRAWALS: 0,
      DEPOSITS: 0,
      SALES_TOTAL: 0,
      NET_TOTAL: session.initialValue
    };

    transactions.forEach(t => {
      if (t.type === 'SALE') {
        summary.SALES_TOTAL = roundFinance(summary.SALES_TOTAL + t.total);
        t.methods.forEach(m => {
          // Ajuste de cálculo para dinheiro: se houve troco, apenas o líquido entra
          if (m.method === 'CASH' && t.changeAmount) {
             const netCash = roundFinance(m.amount - t.changeAmount);
             summary.CASH = roundFinance(summary.CASH + netCash);
          } else {
             summary[m.method] = roundFinance(summary[m.method] + m.amount);
          }
        });
        summary.NET_TOTAL = roundFinance(summary.NET_TOTAL + t.total);
      } else if (t.type === 'WITHDRAWAL') {
        summary.WITHDRAWALS = roundFinance(summary.WITHDRAWALS + t.total);
        summary.NET_TOTAL = roundFinance(summary.NET_TOTAL - t.total);
      } else if (t.type === 'DEPOSIT') {
        summary.DEPOSITS = roundFinance(summary.DEPOSITS + t.total);
        summary.NET_TOTAL = roundFinance(summary.NET_TOTAL + t.total);
      }
    });

    return summary;
  }, [transactions, session.initialValue]);

  const openCashier = useCallback((responsible: string, initial: number) => {
    const newSession = {
      isOpen: true,
      openedAt: new Date(),
      initialValue: roundFinance(initial),
      responsibleName: responsible
    };
    setSession(newSession);
    setTransactions([]); // Limpa histórico do turno anterior
  }, []);

  // Updated to receive Audit Data
  const closeCashier = useCallback((auditData?: { finalRealValue: number, difference: number, status: 'OK' | 'SHORTAGE' | 'SURPLUS' }) => {
    if (auditData && session.openedAt) {
        // Snapshot Creation
        const historyRecord: CashierHistoryRecord = {
            id: Math.random().toString(36).substr(2, 9),
            openedAt: session.openedAt,
            closedAt: new Date(),
            responsibleName: session.responsibleName,
            initialValue: session.initialValue,
            finalSystemValue: totals.NET_TOTAL,
            finalRealValue: auditData.finalRealValue,
            difference: auditData.difference,
            status: auditData.status,
            transactions: [...transactions], // Copy transactions
            summary: {
                sales: totals.SALES_TOTAL,
                deposits: totals.DEPOSITS,
                withdrawals: totals.WITHDRAWALS,
                pix: totals.PIX,
                card: totals.CREDIT + totals.DEBIT,
                cash: totals.CASH
            }
        };
        cashierService.saveCashierHistoryRecord(historyRecord);
    }

    setSession(prev => ({ ...prev, isOpen: false }));
  }, [session, totals, transactions]);

  const registerTransaction = useCallback((
    type: TransactionType, 
    methods: { method: PaymentMethodType, amount: number }[],
    description: string,
    meta?: { receivedAmount: number, changeAmount: number }
  ) => {
    // Para Vendas, o total real que entra no caixa é o recebido menos o troco
    const rawTotal = meta ? (meta.receivedAmount - meta.changeAmount) : methods.reduce((acc, m) => acc + m.amount, 0);
    const netTotal = roundFinance(rawTotal);

    const newTransaction: CashTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      methods: methods.map(m => ({ ...m, amount: roundFinance(m.amount) })),
      total: netTotal,
      receivedAmount: meta ? roundFinance(meta.receivedAmount) : undefined,
      changeAmount: meta ? roundFinance(meta.changeAmount) : undefined,
      timestamp: new Date(),
      description,
      responsible: session.responsibleName
    };
    setTransactions(prev => [newTransaction, ...prev]);
  }, [session.responsibleName]);

  return {
    session,
    transactions,
    totals,
    openCashier,
    closeCashier,
    registerTransaction
  };
};
