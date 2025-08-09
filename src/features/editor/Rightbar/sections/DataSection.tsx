import React, { useRef, useMemo } from 'react';
import Papa from 'papaparse';
import { useCanvas } from '../../../../core/context/CanvasContext';
import type { ElementNode } from '../../TreeView/TreeView';
import styles from '../../../shared/styles/Sidebar.module.css';

interface DataSectionProps {
    selectedElement: ElementNode;
}

export const DataSection: React.FC<DataSectionProps> = ({ selectedElement }) => {
    const { updateElementData, updateElementChartProps } = useCanvas();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const headers = useMemo(() => {
        if (!selectedElement.data || selectedElement.data.length === 0) {
            return [];
        }
        return Object.keys(selectedElement.data[0]);
    }, [selectedElement.data]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (file.name.endsWith('.csv')) {
                Papa.parse(content, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        updateElementData(selectedElement.id, results.data);
                    },
                });
            } else if (file.name.endsWith('.json')) {
                try {
                    const jsonData = JSON.parse(content);
                    updateElementData(selectedElement.id, jsonData);
                } catch (error) {
                    console.error("Error parsing JSON file:", error);
                    alert("Invalid JSON file.");
                }
            }
        };
        reader.readAsText(file);
    };
    
    const handleMappingChange = (axis: 'labelKey' | 'valueKey', key: string) => {
        updateElementChartProps(selectedElement.id, {
            options: { [axis]: key },
        });
    };

    return (
        <div className={styles.section}>
            <div className={styles.groupTitle}>Data Source</div>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".csv, .json"
                onChange={handleFileChange}
            />
            <button className={styles.button} onClick={() => fileInputRef.current?.click()}>
                Upload Data
            </button>

            {headers.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                    <div className={styles.group}>
                        <div className={styles.groupTitle}>Label / X-Axis</div>
                        <select
                            className={styles.select}
                            value={selectedElement.chartProps?.options?.labelKey || ''}
                            onChange={(e) => handleMappingChange('labelKey', e.target.value)}
                        >
                            <option value="" disabled>Select a column</option>
                            {headers.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>
                     <div className={styles.group}>
                        <div className={styles.groupTitle}>Value / Y-Axis</div>
                        <select
                            className={styles.select}
                            value={selectedElement.chartProps?.options?.valueKey || ''}
                             onChange={(e) => handleMappingChange('valueKey', e.target.value)}
                        >
                            <option value="" disabled>Select a column</option>
                            {headers.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};