import React from 'react';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { ParentSize } from '@visx/responsive';
import type { ChartOptions } from '../TreeView/TreeView';
import { useChartOptions } from '../../hooks/useChartOptions';

type DataPoint = {
    letter: string;
    value: number;
};

interface BarChartProps {
    data: any[];
    options?: ChartOptions;
}

export const BarChart: React.FC<BarChartProps> = ({ data, options }) => {

    const getXValue = (d: any) => d[labelKey || ''];
    const getYValue = (d: any) => d[valueKey || ''] ?? 0;
    const finalOptions = useChartOptions(options);
    const { labelKey, valueKey } = finalOptions;


    return (
        <ParentSize>
            {({ width, height }) => {
                const margin = { top: 20, bottom: 40, left: 40, right: 20 };
                
                const xMax = width - margin.left - margin.right;
                const yMax = height - margin.top - margin.bottom;

                const xScale = scaleBand<string>({
                    range: [0, xMax],
                    round: true,
                    domain: data.map(getXValue),
                    padding: 0.5,
                });

                const yScale = scaleLinear<number>({
                    range: [yMax, 0],
                    round: true,
                    domain: [0, Math.max(...data.map(getYValue))],
                });
                
                return (
                    <svg width={width} height={height}>
                        <Group left={margin.left} top={margin.top}>

                            {finalOptions.showYAxis && <AxisLeft scale={yScale} stroke={finalOptions.yAxisColor} tickStroke={finalOptions.yTickStrokeColor} tickLabelProps={{fill: finalOptions.yTickLabelColor, fontSize: "small"}} />}
                            {finalOptions.showXAxis && <AxisBottom top={yMax} scale={xScale} stroke={finalOptions.xAxisColor} tickStroke={finalOptions.xTickStrokeColor} tickLabelProps={{fill: finalOptions.xTickLabelColor, fontSize: "small"}} />}
                            
                            {data.map((d) => {
                                const letter = getXValue(d);
                                const barWidth = xScale.bandwidth();
                                const barHeight = yMax - (yScale(getYValue(d)) ?? 0);
                                const barX = xScale(letter);
                                const barY = yMax - barHeight;
                                return (
                                    <Bar
                                        key={`bar-${letter}`}
                                        x={barX}
                                        y={barY}
                                        width={barWidth}
                                        height={barHeight}
                                        fill={finalOptions.barColor}
                                    />
                                );
                            })}
                        </Group>
                    </svg>
                );
            }}
        </ParentSize>
    );
};