import { useState } from 'react';
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

export default function ActionBar() {
    const [selected, setSelected] = useState<string | null>(null);

    const icons = [
        { name: 'Cursor', icon: CursorIcon },
        { name: 'Text', icon: TextTIcon },
        { name: 'Frame', icon: BoundingBoxIcon },
        { name: 'Chart Bar Horizontal', icon: ChartBarHorizontalIcon },
        { name: 'Chart Pie', icon: ChartPieIcon },
        { name: 'Chart Line', icon: ChartLineIcon },
        { name: 'Chart Donut', icon: ChartDonutIcon },
        { name: 'Chart Bar', icon: ChartBarIcon },
        { name: 'Table', icon: TableIcon },
    ];

    return (
        <div className={styles.actionbar}>
            {icons.map(({ name, icon: Icon }) => (
                <div title={name} key={name}>
                    <Icon
                        className={`${styles.icon} ${styles.button} ${selected === name ? styles.active : ''}`}
                        onClick={() => setSelected(name)}
                    />
                </div>
            ))}
        </div>
    );
}
