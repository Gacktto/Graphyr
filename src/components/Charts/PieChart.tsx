import React from 'react';
import { Pie } from '@visx/shape';
import { Group } from '@visx/group';
import { Text } from '@visx/text';
import { scaleOrdinal } from '@visx/scale';
import { ParentSize } from '@visx/responsive';
import type { ChartOptions } from '../TreeView/TreeView';
import { useChartOptions } from '../../hooks/useChartOptions';

interface PieChartProps {
    data: any[];
    options?: ChartOptions;
    isDonut?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({ data, options, isDonut = false }) => {
    const finalOptions = useChartOptions(options);
    const { labelKey, valueKey, colorScheme, axisLabelFontSize, pieLabelPosition, pieLabelColor } = finalOptions;

    const getValue = (d: any): number => Number(d[valueKey || '']) || 0;
    const getLabel = (d: any): string => d[labelKey || ''];

    const getColor = scaleOrdinal({
        domain: data.map(getLabel),
        range: colorScheme,
    });

    return (
        <ParentSize>
            {({ width, height }) => {
                const centerX = width / 2;
                const centerY = height / 2;
                const radius = Math.min(width, height) / 2;
                const donutThickness = 40;
                const outerRadius = pieLabelPosition === 'outside' ? radius * 0.7 : radius;

                return (
                    <svg width={width} height={height}>
                        <Group top={centerY} left={centerX}>
                            <Pie
                                data={data}
                                pieValue={getValue}
                                outerRadius={outerRadius}
                                innerRadius={isDonut ? outerRadius - donutThickness : 0}
                                cornerRadius={3}
                                padAngle={0.01}
                            >
                                {(pie) => {
                                    return pie.arcs.map((arc, index) => {
                                        const label = getLabel(arc.data);
                                        const arcFill = getColor(label);
                                        const [centroidX, centroidY] = pie.path.centroid(arc);

                                        return (
                                            <g key={`arc-group-${label}-${index}`}>
                                                <path d={pie.path(arc) || ''} fill={arcFill} />

                                                {pieLabelPosition === 'inside' && (
                                                    (() => {
                                                        const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.2;
                                                        if (!hasSpaceForLabel) return null;

                                                        return (
                                                            <Text
                                                                x={centroidX}
                                                                y={centroidY}
                                                                fill={pieLabelColor}
                                                                textAnchor="middle"
                                                                dy=".33em" // Ajuste vertical
                                                                fontSize={axisLabelFontSize}
                                                                fontWeight="bold"
                                                                pointerEvents="none"
                                                            >
                                                                {label}
                                                            </Text>
                                                        );
                                                    })()
                                                )}

                                                {pieLabelPosition === 'outside' && (
                                                    (() => {
                                                        const midAngle = (arc.startAngle + arc.endAngle) / 2;
                                                        const correctedAngle = midAngle - Math.PI / 2;
                                                        const lineBreakPointX = Math.cos(correctedAngle) * (outerRadius + 10);
                                                        const lineBreakPointY = Math.sin(correctedAngle) * (outerRadius + 10);
                                                        const isRightSide = midAngle < Math.PI;
                                                        const lineEndX = (isRightSide ? 1 : -1) * (outerRadius + 30);
                                                        
                                                        return (
                                                            <>
                                                                <polyline
                                                                    points={`${centroidX}, ${centroidY}, ${lineBreakPointX}, ${lineBreakPointY}, ${lineEndX}, ${lineBreakPointY}`}
                                                                    fill="none"
                                                                    stroke={finalOptions.barColor}
                                                                    strokeWidth={1}
                                                                />
                                                                <Text
                                                                    x={lineEndX}
                                                                    y={lineBreakPointY}
                                                                    dx={isRightSide ? 5 : -5}
                                                                    dy={4}
                                                                    fill={finalOptions.barColor}
                                                                    textAnchor={isRightSide ? 'start' : 'end'}
                                                                    fontSize={axisLabelFontSize}
                                                                    fontWeight="bold"
                                                                >
                                                                    {label}
                                                                </Text>
                                                            </>
                                                        );
                                                    })()
                                                )}
                                            </g>
                                        );
                                    });
                                }}
                            </Pie>
                        </Group>
                    </svg>
                );
            }}
        </ParentSize>
    );
};