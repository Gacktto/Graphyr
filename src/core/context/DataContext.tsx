import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { produce } from 'immer';

export type TableRow = Record<string, string | number>;

export interface DataTable {
    id: string;
    name: string;
    data: TableRow[];
}

interface DataContextType {
    tables: DataTable[];
    addTable: (name: string) => string;
    deleteTable: (tableId: string) => void;
    updateTableName: (tableId: string, newName: string) => void;
    updateTableData: (tableId: string, newData: TableRow[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialTables: DataTable[] = [
    {
        id: 'sales-data-1',
        name: 'Vendas Trimestrais',
        data: [
            { Mes: 'Janeiro', Vendas: 2200 },
            { Mes: 'Fevereiro', Vendas: 3100 },
            { Mes: 'Março', Vendas: 2800 },
        ],
    },
];

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [tables, setTables] = useState<DataTable[]>(initialTables);

    const addTable = (name: string) => {
        const newTable: DataTable = {
            id: crypto.randomUUID(),
            name,
            data: [{ 'Coluna 1': '', 'Coluna 2': '' }],
        };
        setTables([...tables, newTable]);
        return newTable.id;
    };

    const deleteTable = (tableId: string) => {
        setTables(tables.filter((table) => table.id !== tableId));
    };
    
    const updateTableName = (tableId: string, newName: string) => {
        setTables(
            produce(tables, (draft) => {
                const table = draft.find((t) => t.id === tableId);
                if (table) {
                    table.name = newName;
                }
            })
        );
    };

    const updateTableData = (tableId: string, newData: TableRow[]) => {
        setTables(
            produce(tables, (draft) => {
                const table = draft.find((t) => t.id === tableId);
                if (table) {
                    table.data = newData;
                }
            })
        );
    };

    return (
        <DataContext.Provider
            value={{ tables, addTable, deleteTable, updateTableName, updateTableData }}
        >
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};