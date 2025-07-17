import React from 'react';
import { Pie } from '@visx/shape';
import { Group } from '@visx/group';
import { Text } from '@visx/text';
import { scaleOrdinal } from '@visx/scale';
import { ParentSize } from '@visx/responsive';

type DataPoint = {
    letter: string;
    value: number;
};

interface PieChartProps {
    data: DataPoint[];
    isDonut?: boolean;
}

const getValue = (d: DataPoint) => d.value;
const getLabel = (d: DataPoint) => d.letter;

export const PieChart: React.FC<PieChartProps> = ({ data, isDonut = false }) => {
    const getColor = scaleOrdinal({
        domain: data.map(getLabel),
        range: [
            'rgba(93, 222, 169, 1)',
            'rgba(255, 187, 80, 1)',
            'rgba(255, 117, 136, 1)',
            'rgba(80, 199, 255, 1)',
            'rgba(170, 131, 255, 1)',
        ],
    });

    return (
        <ParentSize>
            {({ width, height }) => {
                const centerX = width / 2;
                const centerY = height / 2;
                const radius = Math.min(width, height) / 2;
                const donutThickness = 40;
                const outerRadius = radius * 0.7; 

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
                                        const { letter } = arc.data;
                                        const arcFill = getColor(letter);
                                        const [centroidX, centroidY] = pie.path.centroid(arc);
                                        
                                        const midAngle = (arc.startAngle + arc.endAngle) / 2;
                                        const correctedAngle = midAngle - Math.PI / 2;

                                        const lineBreakPointX = Math.cos(correctedAngle) * (outerRadius + 10);
                                        const lineBreakPointY = Math.sin(correctedAngle) * (outerRadius + 10);
                                        
                                        const isRightSide = midAngle < Math.PI;

                                        const lineEndX = (isRightSide ? 1 : -1) * (outerRadius + 30);
                                        
                                        return (
                                            <g key={`arc-group-${letter}-${index}`}>
                                                <path d={pie.path(arc) || ''} fill={arcFill} />

                                                <polyline
                                                    points={`${centroidX}, ${centroidY}, ${lineBreakPointX}, ${lineBreakPointY}, ${lineEndX}, ${lineBreakPointY}`}
                                                    fill="none"
                                                    stroke="#666"
                                                    strokeWidth={1}
                                                />

                                                <Text
                                                    x={lineEndX}
                                                    y={lineBreakPointY}
                                                    dx={isRightSide ? 5 : -5}
                                                    dy={4}
                                                    fill="#333"
                                                    textAnchor={isRightSide ? 'start' : 'end'}
                                                    fontSize={12}
                                                    fontWeight="bold"
                                                >
                                                    {letter}
                                                </Text>
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