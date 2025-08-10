import React, { useState, useEffect } from 'react';
import { useData, DataTable, TableRow } from '../../core/context/DataContext';
import { produce } from 'immer';
import styles from './DataView.module.css';

interface DataTableGridProps {
    table: DataTable;
}

export const DataTableGrid: React.FC<DataTableGridProps> = ({ table }) => {
    const { updateTableData, updateTableName } = useData();
    const [gridData, setGridData] = useState<TableRow[]>(table.data);
    const [tableName, setTableName] = useState(table.name);

    useEffect(() => {
        setGridData(table.data);
        setTableName(table.name);
    }, [table]);

    const headers = React.useMemo(() => {
        if (gridData.length === 0) return [];
        return Object.keys(gridData[0]);
    }, [gridData]);

    const handleCellChange = (rowIndex: number, column: string, value: string) => {
        const updatedData = produce(gridData, draft => {
            draft[rowIndex][column] = value;
        });
        setGridData(updatedData);
    };
    
    const handleBlur = () => {
        updateTableData(table.id, gridData);
    };

    const handleAddRow = () => {
        const newRow = headers.reduce((acc, header) => ({ ...acc, [header]: '' }), {});
        setGridData([...gridData, newRow]);
    };

    return (
        <div className={styles.gridContainer}>
            <input 
                className={styles.titleInput} 
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                onBlur={() => updateTableName(table.id, tableName)}
            />
            <div className={styles.tableWrapper}>
                <table className={styles.gridTable}>
                    <thead>
                        <tr>
                            {headers.map(header => <th key={header}>{header}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {gridData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {headers.map(header => (
                                    <td key={`${rowIndex}-${header}`}>
                                        <input
                                            type="text"
                                            value={row[header]}
                                            onChange={(e) => handleCellChange(rowIndex, header, e.target.value)}
                                            onBlur={handleBlur}
                                            className={styles.cellInput}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={handleAddRow} className={styles.addRowButton}>+ Adicionar Linha</button>
        </div>
    );
};