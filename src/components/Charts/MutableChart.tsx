import React from 'react';
import type { ElementNode } from '../TreeView/TreeView';
import { BarChart } from './BarChart';
import { PieChart } from './PieChart';
import { LineChart } from './LineChart';

interface MutableChartProps {
    data: any[];
    chartProps: ElementNode['chartProps'];
}

export const MutableChart: React.FC<MutableChartProps> = ({ data, chartProps }) => {
    switch (chartProps?.variant) {
        case 'bar':
        case 'barHorizontal':
            return <BarChart data={data} options={chartProps?.options} />;
        case 'pie':
            return <PieChart data={data} isDonut={false} /* options={...} */ />;
        case 'donut':
            return <PieChart data={data} isDonut={true} /* options={...} */ />;
        case 'line':
            return <LineChart data={data} options={chartProps?.options} />;
        default:
            return <div>Selecione um tipo de gráfico.</div>;
    }
};