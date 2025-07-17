import { useMemo } from 'react';
import type { ChartOptions } from '../components/TreeView/TreeView';

const defaultChartOptions: Required<ChartOptions> = {
    showXAxis: true,
    showYAxis: true,
    barColor: 'rgba(0, 0, 0, 1)',
    lineColor: 'rgba(0, 0, 0, 1)',
    dotColor: 'rgba(0, 0, 0, 1)',
    xAxisColor: 'rgba(0, 0, 0, 1)',
    yAxisColor: 'rgba(0, 0, 0, 1)',
    xTickStrokeColor: 'rgba(0, 0, 0, 1)',
    yTickStrokeColor: 'rgba(0, 0, 0, 1)',
    xTickLabelColor: 'rgba(0, 0, 0, 1)',
    yTickLabelColor: 'rgba(0, 0, 0, 1)',
    labelKey: '',
    valueKey: ''
};

export const useChartOptions = (options?: ChartOptions): Required<ChartOptions> => {
    const chartOptions = useMemo(() => {
        return {
            ...defaultChartOptions,
            ...options,
        };
    }, [options]);

    return chartOptions;
};