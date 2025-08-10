import React, { useMemo } from 'react';
import { useCanvas } from '../../../../core/context/CanvasContext';
import { useData } from '../../../../core/context/DataContext';
import type { ElementNode } from '../../TreeView/TreeView';
import styles from '../../../shared/styles/Sidebar.module.css';
import panelStyles from '../ChartToolbar.module.css';

interface DataPanelProps {
    selectedElement: ElementNode;
}

export const DataPanel: React.FC<DataPanelProps> = ({ selectedElement }) => {
    const { updateElementProps, updateElementChartProps } = useCanvas();
    const { tables } = useData();

    const connectedTable = useMemo(
        () => tables.find((t) => t.id === selectedElement.dataSourceId),
        [tables, selectedElement.dataSourceId]
    );

    const headers = useMemo(() => {
        if (!connectedTable || !connectedTable.data || connectedTable.data.length === 0) {
            return [];
        }
        return Object.keys(connectedTable.data[0]);
    }, [connectedTable]);

    const handleTableSelection = (tableId: string) => {
        const selectedTable = tables.find((t) => t.id === tableId);
        if (selectedTable) {
            updateElementProps(selectedElement.id, {
                dataSourceId: tableId,
                data: selectedTable.data,
                chartProps: {
                    ...selectedElement.chartProps,
                    options: {
                        ...selectedElement.chartProps?.options,
                        labelKey: '',
                        valueKey: '',
                    },
                } as ElementNode['chartProps'], 
            });
        }
    };

    const handleMappingChange = (
        axis: 'labelKey' | 'valueKey',
        key: string
    ) => {
        updateElementChartProps(selectedElement.id, {
            options: { ...selectedElement.chartProps?.options, [axis]: key },
        });
    };

    return (
        <div>
            <div className={panelStyles.panelTitle}>Data Source</div>
            <div className={panelStyles.panelContent}>
                <div className={styles.group}>
                    <div className={styles.groupTitle}>Connect Table</div>
                    <select
                        className={styles.input}
                        value={selectedElement.dataSourceId || ''}
                        onChange={(e) => handleTableSelection(e.target.value)}
                    >
                        <option value="" disabled>
                            Select a table
                        </option>
                        {tables.map((table) => (
                            <option key={table.id} value={table.id}>
                                {table.name}
                            </option>
                        ))}
                    </select>
                </div>

                {headers.length > 0 && (
                    <>
                        <div className={styles.group}>
                            <div className={styles.groupTitle}>
                                Label / X-Axis
                            </div>
                            <select
                                className={styles.input}
                                value={
                                    selectedElement.chartProps?.options
                                        ?.labelKey || ''
                                }
                                onChange={(e) =>
                                    handleMappingChange(
                                        'labelKey',
                                        e.target.value
                                    )
                                }
                            >
                                <option value="" disabled>
                                    Select a column
                                </option>
                                {headers.map((h) => (
                                    <option key={h} value={h}>
                                        {h}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.group}>
                            <div className={styles.groupTitle}>
                                Value / Y-Axis
                            </div>
                            <select
                                className={styles.input}
                                value={
                                    selectedElement.chartProps?.options
                                        ?.valueKey || ''
                                }
                                onChange={(e) =>
                                    handleMappingChange(
                                        'valueKey',
                                        e.target.value
                                    )
                                }
                            >
                                <option value="" disabled>
                                    Select a column
                                </option>
                                {headers.map((h) => (
                                    <option key={h} value={h}>
                                        {h}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};