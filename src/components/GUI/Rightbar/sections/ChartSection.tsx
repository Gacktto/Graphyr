// Em src/components/Sidebar/ChartSection.tsx

import React from 'react';
import { useCanvas } from '../../../../context/CanvasContext';
import type { ElementNode, ChartVariant } from '../../../TreeView/TreeView';
import styles from '../../../../styles/Sidebar.module.css';
import { ColorControl } from '../../../ColorPicker/ColorControl';

interface ChartSectionProps {
    selectedElement: ElementNode;
    onColorControlClick: (
        event: React.MouseEvent,
        property: string,
        onChange: (newColor: string) => void,
        currentValue?: string
    ) => void;
}

export const ChartSection: React.FC<ChartSectionProps> = ({ selectedElement, onColorControlClick }) => {
    const { updateElementChartProps } = useCanvas();

    const handleVariantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateElementChartProps(selectedElement.id, {
            variant: e.target.value as ChartVariant,
        });
    };

    const handleOptionsChange = (newOptions: Partial<ElementNode['chartProps']['options']>) => {
        updateElementChartProps(selectedElement.id, { options: newOptions });
    };

    const currentOptions = selectedElement.chartProps?.options;
    const currentVariant = selectedElement.chartProps?.variant;

    return (
        <div className={styles.section}>
            <div className={`${styles.container} ${styles.fill}`} style={{ flexDirection: 'column', gap: '16px' }}>
                Chart
                
                <div className={styles.row}>
                    <div className={styles.group}>
                        <div className={styles.groupTitle}>Type</div>
                        <select
                            className={styles.select}
                            value={currentVariant || 'bar'}
                            onChange={handleVariantChange}
                        >
                            <option value="bar">Bar</option>
                            <option value="line">Line</option>
                            <option value="pie">Pie</option>
                            <option value="donut">Donut</option>
                        </select>
                    </div>
                </div>

                <div className={styles.row}>
                    {(currentVariant === 'bar' || currentVariant === 'barHorizontal') && (
                        <div className={`${styles.group} ${styles.fill}`}>
                            <ColorControl
                                label="Bar Color"
                                property="barColor"
                                value={currentOptions?.barColor}
                                onClick={(e, _,) => onColorControlClick(
                                    e, 
                                    "barColor", 
                                    (newColor) => handleOptionsChange({ barColor: newColor }),
                                    currentOptions?.barColor
                                )}
                            />
                        </div>
                    )}

                    {currentVariant === 'line' && (
                        <div className={`${styles.group} ${styles.fill}`} style={{flexDirection: "row"}}>
                            <ColorControl
                                label="Line Color"
                                property="lineColor"
                                value={currentOptions?.lineColor}
                                onClick={(e, _,) => onColorControlClick(
                                    e, 
                                    "lineColor", 
                                    (newColor) => handleOptionsChange({ lineColor: newColor }),
                                    currentOptions?.lineColor
                                )}
                            />

                            <ColorControl
                                label="Dot Color"
                                property="dotColor"
                                value={currentOptions?.dotColor}
                                onClick={(e, _,) => onColorControlClick(
                                    e, 
                                    "dotColor", 
                                    (newColor) => handleOptionsChange({ dotColor: newColor }),
                                    currentOptions?.dotColor
                                )}
                            />
                        </div>
                    )}
                </div>

                {(currentVariant === 'bar' || currentVariant === 'line') && (
                    <div className={styles.row}>
                        <div className={`${styles.group} ${styles.fill}`}>
                            <div className={`${styles.group} ${styles.fill}`} style={{flexDirection: "row"}}>
                                <ColorControl
                                    label="X Axis Color"
                                    property="xAxisColor"
                                    value={currentOptions?.xAxisColor}
                                    onClick={(e, _,) => onColorControlClick(
                                        e, 
                                        "xAxisColor", 
                                        (newColor) => handleOptionsChange({ xAxisColor: newColor }),
                                        currentOptions?.xAxisColor
                                    )}
                                />
                                <ColorControl
                                    label="Y Axis Color"
                                    property="yAxisColor"
                                    value={currentOptions?.yAxisColor}
                                    onClick={(e, _,) => onColorControlClick(
                                        e, 
                                        "yAxisColor", 
                                        (newColor) => handleOptionsChange({ yAxisColor: newColor }),
                                        currentOptions?.yAxisColor
                                    )}
                                />
                                
                            </div>
                            <div className={`${styles.group} ${styles.fill}`} style={{flexDirection: "row"}}>
                                <ColorControl
                                    label="X Tick Label Color"
                                    property="xTickLabelColor"
                                    value={currentOptions?.xTickLabelColor}
                                    onClick={(e, _,) => onColorControlClick(
                                        e, 
                                        "xTickLabelColor", 
                                        (newColor) => handleOptionsChange({ xTickLabelColor: newColor }),
                                        currentOptions?.xTickLabelColor
                                    )}
                                />
                                <ColorControl
                                    label="Y Tick Label Color"
                                    property="yTickLabelColor"
                                    value={currentOptions?.yTickLabelColor}
                                    onClick={(e, _,) => onColorControlClick(
                                        e, 
                                        "yTickLabelColor", 
                                        (newColor) => handleOptionsChange({ yTickLabelColor: newColor }),
                                        currentOptions?.yTickLabelColor
                                    )}
                                />
                            </div>
                            <div className={`${styles.group} ${styles.fill}`} style={{flexDirection: "row"}}>
                                <ColorControl
                                    label="X Tick Stroke Color"
                                    property="xTickStrokeColor"
                                    value={currentOptions?.xTickStrokeColor}
                                    onClick={(e, _,) => onColorControlClick(
                                        e, 
                                        "xTickStrokeColor", 
                                        (newColor) => handleOptionsChange({ xTickStrokeColor: newColor }),
                                        currentOptions?.xTickStrokeColor
                                    )}
                                />
                                <ColorControl
                                    label="Y Tick Stroke Color"
                                    property="yTickStrokeColor"
                                    value={currentOptions?.yTickStrokeColor}
                                    onClick={(e, _,) => onColorControlClick(
                                        e, 
                                        "yTickStrokeColor", 
                                        (newColor) => handleOptionsChange({ yTickStrokeColor: newColor }),
                                        currentOptions?.yTickStrokeColor
                                    )}
                                />
                            </div>
                            <div className={`${styles.group} ${styles.fill}`} style={{flexDirection: "row"}}>
                                <div className={styles.checkboxRow}>
                                    <label>Show X Axis</label>
                                    <input
                                        type="checkbox"
                                        checked={currentOptions?.showXAxis ?? true}
                                        onChange={(e) => handleOptionsChange({ showXAxis: e.target.checked })}
                                    />
                                </div>
                                <div className={styles.checkboxRow}>
                                    <label>Show Y Axis</label>
                                    <input
                                        type="checkbox"
                                        checked={currentOptions?.showYAxis ?? true}
                                        onChange={(e) => handleOptionsChange({ showYAxis: e.target.checked })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};