import {
    BoundingBoxIcon,
    CursorIcon,
    TextTIcon,
    ChartBarIcon,
} from '@phosphor-icons/react';
import styles from '../../styles/Actionbar.module.css';
import { useCanvas } from '../../context/CanvasContext';

export default function ActionBar() {
    const { activeTool, setActiveTool } = useCanvas();

    const tools = [
        { name: 'Cursor', icon: CursorIcon, type: 'cursor' as const },
        { name: 'Text', icon: TextTIcon, type: 'text' as const },
        { name: 'Frame', icon: BoundingBoxIcon, type: 'div' as const },
        { name: 'Chart', icon: ChartBarIcon, type: 'chart' as const },
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
