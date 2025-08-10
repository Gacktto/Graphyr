import React from 'react';
import { useCanvas } from '../../../../core/context/CanvasContext';
import type { ElementNode, ChartOptions } from '../../TreeView/TreeView';
import { ColorControl } from '../../../shared/ColorPicker/ColorControl';
import panelStyles from '../ChartToolbar.module.css';

interface AxisPanelProps {
    selectedElement: ElementNode;
    onColorControlClick: (
        event: React.MouseEvent,
        property: string,
        onChange: (newColor: string) => void,
        currentValue?: string
    ) => void;
}

export const AxisPanel: React.FC<AxisPanelProps> = ({
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
            <div className={panelStyles.panelTitle}>Axis & Labels</div>
            <div className={panelStyles.panelContent}>
                <ColorControl
                    label="X Axis Color"
                    property={'xAxisColor' as any}
                    value={currentOptions?.xAxisColor}
                    onClick={(e) =>
                        onColorControlClick(
                            e,
                            'xAxisColor',
                            (newColor) =>
                                handleOptionsChange({ xAxisColor: newColor }),
                            currentOptions?.xAxisColor
                        )
                    }
                />
                <ColorControl
                    label="Y Axis Color"
                    property={'yAxisColor' as any}
                    value={currentOptions?.yAxisColor}
                    onClick={(e) =>
                        onColorControlClick(
                            e,
                            'yAxisColor',
                            (newColor) =>
                                handleOptionsChange({ yAxisColor: newColor }),
                            currentOptions?.yAxisColor
                        )
                    }
                />
                <ColorControl
                    label="X Tick Label Color"
                    property={'xTickLabelColor' as any}
                    value={currentOptions?.xTickLabelColor}
                    onClick={(e) =>
                        onColorControlClick(
                            e,
                            'xTickLabelColor',
                            (newColor) =>
                                handleOptionsChange({
                                    xTickLabelColor: newColor,
                                }),
                            currentOptions?.xTickLabelColor
                        )
                    }
                />
                <ColorControl
                    label="Y Tick Label Color"
                    property={'yTickLabelColor' as any}
                    value={currentOptions?.yTickLabelColor}
                    onClick={(e) =>
                        onColorControlClick(
                            e,
                            'yTickLabelColor',
                            (newColor) =>
                                handleOptionsChange({
                                    yTickLabelColor: newColor,
                                }),
                            currentOptions?.yTickLabelColor
                        )
                    }
                />
                <ColorControl
                    label="X Tick Stroke Color"
                    property={'xTickStrokeColor' as any}
                    value={currentOptions?.xTickStrokeColor}
                    onClick={(e) =>
                        onColorControlClick(
                            e,
                            'xTickStrokeColor',
                            (newColor) =>
                                handleOptionsChange({
                                    xTickStrokeColor: newColor,
                                }),
                            currentOptions?.xTickStrokeColor
                        )
                    }
                />
                <ColorControl
                    label="Y Tick Stroke Color"
                    property={'yTickStrokeColor' as any}
                    value={currentOptions?.yTickStrokeColor}
                    onClick={(e) =>
                        onColorControlClick(
                            e,
                            'yTickStrokeColor',
                            (newColor) =>
                                handleOptionsChange({
                                    yTickStrokeColor: newColor,
                                }),
                            currentOptions?.yTickStrokeColor
                        )
                    }
                />
                <div className={panelStyles.checkboxRow}>
                    <label>Show X Axis</label>
                    <input
                        type="checkbox"
                        checked={currentOptions?.showXAxis ?? true}
                        onChange={(e) =>
                            handleOptionsChange({ showXAxis: e.target.checked })
                        }
                    />
                </div>
                <div className={panelStyles.checkboxRow}>
                    <label>Show Y Axis</label>
                    <input
                        type="checkbox"
                        checked={currentOptions?.showYAxis ?? true}
                        onChange={(e) =>
                            handleOptionsChange({ showYAxis: e.target.checked })
                        }
                    />
                </div>
            </div>
        </div>
    );
};