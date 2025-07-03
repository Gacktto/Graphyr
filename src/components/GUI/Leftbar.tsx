import { SidebarIcon } from '@phosphor-icons/react';
import styles from '../../styles/Sidebar.module.css';
import ActionBar from './Actionbar';
import TreeView from '../TreeView/TreeView';
import { useCanvas } from '../../context/CanvasContext';

export default function Leftbar() {
    const { elements, selectedId, setSelectedId } = useCanvas();

    return (
        <div className={styles.sidebar} style={{ left: 0 }}>
            <div
                className={styles.menu}
                style={{ borderRight: '1px solid #3c3c3c' }}
            >
                <div className={styles.section}>
                    <div
                        className={styles.container}
                        style={{
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <p className={styles.title}>Graphyr</p>
                        <SidebarIcon
                            size={20}
                            className={`${styles.icon} ${styles.button}`}
                        />
                    </div>
                </div>

                <div
                    className={styles.section}
                    style={{
                        padding: '0 12px',
                        overflowY: 'auto',
                        maxHeight: 'calc(100vh - 160px)',
                    }}
                >
                    <TreeView
                        elements={elements}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                    />
                </div>
            </div>

            <ActionBar />
        </div>
    );
}
