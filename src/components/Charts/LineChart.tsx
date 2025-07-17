import React from 'react';
import { Group } from '@visx/group';
import { LinePath, Circle } from '@visx/shape';
import { scalePoint, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { ParentSize } from '@visx/responsive';
import type { ChartOptions } from '../TreeView/TreeView';
import { useChartOptions } from '../../hooks/useChartOptions';

type DataPoint = {
    letter: string;
    value: number;
};

interface LineChartProps {
    data: DataPoint[];
    options?: ChartOptions;
}


export const LineChart: React.FC<LineChartProps> = ({ data, options }) => {

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

                const xScale = scalePoint<string>({
                    range: [0, xMax],
                    domain: data.map(getXValue),
                    padding: 0.5,
                });

                const yScale = scaleLinear<number>({
                    range: [yMax, 0],
                    domain: [0, Math.max(...data.map(getYValue)) * 1.1],
                    round: true,
                });

                return (
                    <svg width={width} height={height}>
                        <Group left={margin.left} top={margin.top}>

                            {finalOptions.showYAxis && <AxisLeft scale={yScale} stroke={finalOptions.yAxisColor} tickStroke={finalOptions.yTickStrokeColor} tickLabelProps={{fill: finalOptions.yTickLabelColor}}/>}
                            {finalOptions.showXAxis && <AxisBottom top={yMax} scale={xScale} stroke={finalOptions.xAxisColor} tickStroke={finalOptions.xTickStrokeColor} tickLabelProps={{fill: finalOptions.xTickLabelColor}}/>}
                            
                            <LinePath<DataPoint>
                                data={data}
                                x={(d) => xScale(getXValue(d)) ?? 0}
                                y={(d) => yScale(getYValue(d)) ?? 0}
                                stroke={finalOptions.lineColor}
                                strokeWidth={2}
                            />
                            
                            {data.map((d, i) => (
                                <Circle
                                    key={`point-${i}`}
                                    cx={xScale(getXValue(d))}
                                    cy={yScale(getYValue(d))}
                                    r={4}
                                    fill={finalOptions.dotColor}
                                />
                            ))}
                        </Group>
                    </svg>
                );
            }}
        </ParentSize>
    );
};