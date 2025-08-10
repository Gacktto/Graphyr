import React, { useState, useMemo } from 'react';
import { useData } from '../../core/context/DataContext';
import { DataTableGrid } from './DataTableGrid';
import styles from './DataView.module.css';

export const DataView: React.FC = () => {
    const { tables, addTable, deleteTable } = useData();
    const [selectedTableId, setSelectedTableId] = useState<string | null>(
        tables[0]?.id || null
    );

    const handleCreateTable = () => {
        const newTableName = `Nova Tabela ${tables.length + 1}`;
        const newTableId = addTable(newTableName);
        setSelectedTableId(newTableId);
    };

    const selectedTable = useMemo(
        () => tables.find((t) => t.id === selectedTableId),
        [tables, selectedTableId]
    );

    return (
        <div className={styles.dataViewContainer}>
            <aside className={styles.sidebar}>
                <button className={styles.createButton} onClick={handleCreateTable}>
                    Criar Nova Tabela
                </button>
                <nav className={styles.tableList}>
                    {tables.map((table) => (
                        <div
                            key={table.id}
                            className={`${styles.tableListItem} ${selectedTableId === table.id ? styles.active : ''}`}
                            onClick={() => setSelectedTableId(table.id)}
                        >
                            {table.name}
                        </div>
                    ))}
                </nav>
            </aside>
            <main className={styles.mainContent}>
                {selectedTable ? (
                    <DataTableGrid key={selectedTable.id} table={selectedTable} />
                ) : (
                    <div className={styles.noTableSelected}>
                        <p>Selecione uma tabela ou crie uma nova.</p>
                    </div>
                )}
            </main>
        </div>
    );
};