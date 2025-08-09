import { useMemo } from 'react';
import type { ChartOptions } from '../editor/TreeView/TreeView';

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
    valueKey: '',
    colorScheme: [
        'rgba(93, 222, 169, 1)',
        'rgba(255, 187, 80, 1)',
        'rgba(255, 117, 136, 1)',
        'rgba(80, 199, 255, 1)',
        'rgba(170, 131, 255, 1)',
    ],
    pieLabelPosition: 'outside',
    pieLabelColor: '#ffffff',
    axisLabelFontSize: 11,
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