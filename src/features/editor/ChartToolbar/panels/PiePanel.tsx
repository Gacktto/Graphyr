import React from 'react';
import { useCanvas } from '../../../../core/context/CanvasContext';
import type { ElementNode, ChartOptions } from '../../TreeView/TreeView';
import { ColorControl } from '../../../shared/ColorPicker/ColorControl';
import styles from '../../../shared/styles/Sidebar.module.css';
import panelStyles from '../ChartToolbar.module.css';

interface PiePanelProps {
    selectedElement: ElementNode;
    onColorControlClick: (
        event: React.MouseEvent,
        property: string,
        onChange: (newColor: string) => void,
        currentValue?: string
    ) => void;
}

export const PiePanel: React.FC<PiePanelProps> = ({
    selectedElement,
    onColorControlClick,
}) => {
    const { updateElementChartProps } = useCanvas();
    const currentOptions = selectedElement.chartProps?.options;

    const handleOptionsChange = (newOptions: Partial<ChartOptions>) => {
        const mergedOptions = { ...currentOptions, ...newOptions };
        updateElementChartProps(selectedElement.id, { options: mergedOptions });
    };

    return (
        <div>
            <div className={panelStyles.panelTitle}>Pie / Donut Options</div>
            <div className={panelStyles.panelContent}>
                <div className={styles.group}>
                    <div className={styles.groupTitle}>Label Position</div>
                    <select
                        className={styles.input}
                        value={currentOptions?.pieLabelPosition || 'outside'}
                        onChange={(e) =>
                            handleOptionsChange({
                                pieLabelPosition: e.target.value as
                                    | 'inside'
                                    | 'outside',
                            })
                        }
                    >
                        <option value="outside">Outside</option>
                        <option value="inside">Inside</option>
                    </select>
                </div>

                {currentOptions?.pieLabelPosition === 'inside' && (
                    <ColorControl
                        label="Label Color"
                        property={'pieLabelColor' as any}
                        value={currentOptions?.pieLabelColor}
                        onClick={(e) =>
                            onColorControlClick(
                                e,
                                'pieLabelColor',
                                (newColor) =>
                                    handleOptionsChange({
                                        pieLabelColor: newColor,
                                    }),
                                currentOptions?.pieLabelColor
                            )
                        }
                    />
                )}
            </div>
        </div>
    );
};