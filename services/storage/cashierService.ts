
import { CashierSession, CashTransaction, CashierHistoryRecord } from '../../types';
import { KEYS } from './keys';

// Helper Interno: Mocks para Auditoria de Caixa
const generateMockCashierHistory = (): CashierHistoryRecord[] => {
    // Transações detalhadas para o turno de teste
    const mockTransactions: CashTransaction[] = [
        // 2 Suprimentos (Entradas Manuais)
        { id: 't-sup-1', type: 'DEPOSIT', total: 100.00, methods: [{ method: 'CASH', amount: 100 }], description: 'Suprimento Inicial de Troco', timestamp: new Date(Date.now() - 25000000), responsible: 'Gerente' },
        { id: 't-sup-2', type: 'DEPOSIT', total: 50.00, methods: [{ method: 'CASH', amount: 50 }], description: 'Adição de Moedas', timestamp: new Date(Date.now() - 20000000), responsible: 'Gerente' },
        
        // 3 Sangrias (Saídas Manuais)
        { id: 't-sang-1', type: 'WITHDRAWAL', total: 150.00, methods: [{ method: 'CASH', amount: 150 }], description: 'Pagamento Fornecedor Gelo', timestamp: new Date(Date.now() - 15000000), responsible: 'Caixa 01' },
        { id: 't-sang-2', type: 'WITHDRAWAL', total: 80.00, methods: [{ method: 'CASH', amount: 80 }], description: 'Vale Transporte Extra', timestamp: new Date(Date.now() - 10000000), responsible: 'Caixa 01' },
        { id: 't-sang-3', type: 'WITHDRAWAL', total: 300.00, methods: [{ method: 'CASH', amount: 300 }], description: 'Sangria de Segurança', timestamp: new Date(Date.now() - 5000000), responsible: 'Gerente' },
        
        // Algumas vendas para compor
        { id: 't-venda-1', type: 'SALE', total: 150.00, methods: [{ method: 'PIX', amount: 150 }], description: 'Venda Mesa 05', timestamp: new Date(Date.now() - 4000000), responsible: 'Caixa 01' }
    ];

    return [
        {
            id: 'hist-mock-audit',
            openedAt: new Date(Date.now() - 28800000), // 8 horas atrás
            closedAt: new Date(),
            responsibleName: 'Operador Teste',
            initialValue: 200.00,
            finalSystemValue: 1250.00, // Valor simulado
            finalRealValue: 1250.00,   // Caixa batido
            difference: 0,
            status: 'OK',
            summary: { 
                sales: 1730.00, // Soma fictícia das vendas
                deposits: 150.00, // 100 + 50
                withdrawals: 530.00, // 150 + 80 + 300
                pix: 800.00, 
                card: 600.00, 
                cash: 330.00 
            },
            transactions: mockTransactions
        },
        {
            id: 'hist-mock-old',
            openedAt: new Date(Date.now() - 86400000 - 28800000),
            closedAt: new Date(Date.now() - 86400000),
            responsibleName: 'Maria Oliveira',
            initialValue: 200.00,
            finalSystemValue: 980.00,
            finalRealValue: 975.00,
            difference: -5.00,
            status: 'SHORTAGE',
            summary: { sales: 800, deposits: 50, withdrawals: 70, pix: 300, card: 400, cash: 100 },
            transactions: []
        }
    ];
};

export const cashierService = {
    saveCashierSession: (session: CashierSession) => {
        localStorage.setItem(KEYS.CASHIER_SESSION, JSON.stringify(session));
    },

    loadCashierSession: (): CashierSession => {
        const data = localStorage.getItem(KEYS.CASHIER_SESSION);
        if (!data) return { isOpen: false, initialValue: 0, responsibleName: '' };
        const parsed = JSON.parse(data);
        if (parsed.openedAt) parsed.openedAt = new Date(parsed.openedAt);
        return parsed;
    },

    saveCashierTransactions: (transactions: CashTransaction[]) => {
        localStorage.setItem(KEYS.CASHIER_TRANSACTIONS, JSON.stringify(transactions));
    },

    loadCashierTransactions: (): CashTransaction[] => {
        const data = localStorage.getItem(KEYS.CASHIER_TRANSACTIONS);
        if (!data) return [];
        const parsed = JSON.parse(data);
        return parsed.map((t: any) => ({ ...t, timestamp: new Date(t.timestamp) }));
    },

    // --- HISTÓRICO DE CAIXA ---
    saveCashierHistoryRecord: (record: CashierHistoryRecord) => {
        const history = cashierService.loadCashierHistory();
        history.unshift(record);
        localStorage.setItem(KEYS.CASHIER_HISTORY, JSON.stringify(history));
    },

    loadCashierHistory: (): CashierHistoryRecord[] => {
        const data = localStorage.getItem(KEYS.CASHIER_HISTORY);
        if (!data) {
            // Injeta Mocks se vazio
            const mocks = generateMockCashierHistory();
            localStorage.setItem(KEYS.CASHIER_HISTORY, JSON.stringify(mocks));
            return mocks;
        }
        const parsed = JSON.parse(data);
        return parsed.map((h: any) => ({
            ...h,
            openedAt: new Date(h.openedAt),
            closedAt: new Date(h.closedAt),
            transactions: h.transactions ? h.transactions.map((t: any) => ({...t, timestamp: new Date(t.timestamp)})) : []
        }));
    }
};
