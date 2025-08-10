import { SidebarIcon, Table as TableIcon } from '@phosphor-icons/react';
import styles from '../../shared/styles/Sidebar.module.css';
import ActionBar from '../Actionbar/Actionbar';
import TreeView from '../TreeView/TreeView';
import { useCanvas } from '../../../core/context/CanvasContext';
import type { AppView } from '../../../layout/layout';

interface LeftbarProps {
    currentView: AppView;
    setCurrentView: (view: AppView) => void;
}

export default function Leftbar({ setCurrentView, currentView }: LeftbarProps) {
    const { elements, selectedId, setSelectedId } = useCanvas();

    const sidebarStyle: React.CSSProperties = {
        position: currentView === 'editor' ? 'absolute' : 'relative',
        left: 0,
        flexDirection: currentView === 'data' ? 'column' : 'row',
        flexShrink: 0,
    };

    return (
        <div className={styles.sidebar} style={sidebarStyle}>
            <div
                className={styles.menu}
                style={{ borderRight: '1px solid #3c3c3c', height: '100%' }}
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
                        <div style={{display: 'flex', gap: '10px'}}>
                            <TableIcon
                                size={20}
                                className={`${styles.icon} ${styles.button}`}
                                weight={currentView === 'data' ? 'fill' : 'regular'}
                                onClick={() => setCurrentView('data')}
                            />
                            <SidebarIcon
                                size={20}
                                className={`${styles.icon} ${styles.button}`}
                                weight={currentView === 'editor' ? 'fill' : 'regular'}
                                onClick={() => setCurrentView('editor')}
                            />
                        </div>
                    </div>
                </div>

                {currentView === 'editor' && (
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
                )}
            </div>
            
            {currentView === 'editor' && <ActionBar />}
        </div>
    );
}