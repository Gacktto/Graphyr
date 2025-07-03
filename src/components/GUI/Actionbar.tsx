import {
    BoundingBoxIcon,
    CursorIcon,
    TextTIcon,
    ChartBarHorizontalIcon,
    ChartPieIcon,
    ChartLineIcon,
    ChartDonutIcon,
    ChartBarIcon,
    TableIcon,
} from '@phosphor-icons/react';
import styles from '../../styles/Actionbar.module.css';
import { useCanvas } from '../../context/CanvasContext';

export default function ActionBar() {
    const { activeTool, setActiveTool } = useCanvas();

    const tools = [
        { name: 'Cursor', icon: CursorIcon, type: 'cursor' as const },
        { name: 'Text', icon: TextTIcon, type: 'text' as const },
        { name: 'Frame', icon: BoundingBoxIcon, type: 'div' as const },
        { name: 'Chart Bar Horizontal', icon: ChartBarHorizontalIcon, type: 'div' as const },
        { name: 'Chart Pie', icon: ChartPieIcon, type: 'div' as const },
        { name: 'Chart Line', icon: ChartLineIcon, type: 'div' as const },
        { name: 'Chart Donut', icon: ChartDonutIcon, type: 'div' as const },
        { name: 'Chart Bar', icon: ChartBarIcon, type: 'div' as const },
        { name: 'Table', icon: TableIcon, type: 'div' as const },
    ];

    return (
         <div className={styles.actionbar}>
            {tools.map(({ name, icon: Icon, type }) => (
                <div title={name} key={name}>
                    <Icon
                        className={`${styles.icon} ${styles.button} ${activeTool === type ? styles.active : ''}`}
                        onClick={() => setActiveTool(type)}
                    />
                </div>
            ))}
        </div>
    );
}
