import React from 'react';
import { useCanvas } from '../../../../core/context/CanvasContext';
import type { ElementNode, ChartOptions } from '../../TreeView/TreeView';
import { ColorControl } from '../../../shared/ColorPicker/ColorControl';
import panelStyles from '../ChartToolbar.module.css';

interface DataStylePanelProps {
    selectedElement: ElementNode;
    onColorControlClick: (
        event: React.MouseEvent,
        property: string,
        onChange: (newColor: string) => void,
        currentValue?: string
    ) => void;
}

export const DataStylePanel: React.FC<DataStylePanelProps> = ({
    selectedElement,
    onColorControlClick,
}) => {
    const { updateElementChartProps } = useCanvas();
    const currentOptions = selectedElement.chartProps?.options;
    const currentVariant = selectedElement.chartProps?.variant;

    const handleOptionsChange = (newOptions: Partial<ChartOptions>) => {
        const mergedOptions = { ...currentOptions, ...newOptions };
        updateElementChartProps(selectedElement.id, { options: mergedOptions });
    };

    return (
        <div>
            <div className={panelStyles.panelTitle}>Data Colors</div>
            <div className={panelStyles.panelContent}>
                {(currentVariant === 'bar' ||
                    currentVariant === 'barHorizontal') && (
                    <ColorControl
                        label="Bar Color"
                        property={'barColor' as any}
                        value={currentOptions?.barColor}
                        onClick={(e) =>
                            onColorControlClick(
                                e,
                                'barColor',
                                (newColor) =>
                                    handleOptionsChange({ barColor: newColor }),
                                currentOptions?.barColor
                            )
                        }
                    />
                )}

                {currentVariant === 'line' && (
                    <>
                        <ColorControl
                            label="Line Color"
                            property={'lineColor' as any}
                            value={currentOptions?.lineColor}
                            onClick={(e) =>
                                onColorControlClick(
                                    e,
                                    'lineColor',
                                    (newColor) =>
                                        handleOptionsChange({
                                            lineColor: newColor,
                                        }),
                                    currentOptions?.lineColor
                                )
                            }
                        />
                        <ColorControl
                            label="Dot Color"
                            property={'dotColor' as any}
                            value={currentOptions?.dotColor}
                            onClick={(e) =>
                                onColorControlClick(
                                    e,
                                    'dotColor',
                                    (newColor) =>
                                        handleOptionsChange({
                                            dotColor: newColor,
                                        }),
                                    currentOptions?.dotColor
                                )
                            }
                        />
                    </>
                )}
            </div>
        </div>
    );
};