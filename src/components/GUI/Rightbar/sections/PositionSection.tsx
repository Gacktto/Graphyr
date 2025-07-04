import React from 'react';
import styles from '../../../../styles/Sidebar.module.css';
import {
    AlignBottomIcon,
    AlignLeftIcon,
    AlignRightIcon,
    AlignTopIcon,
    AlignCenterHorizontalIcon,
    AlignCenterVerticalIcon,
    FlipHorizontalIcon,
    FlipVerticalIcon,
    AngleIcon,
    NetworkIcon,
    NetworkSlashIcon,
} from '@phosphor-icons/react';
import type { ElementNode } from '../../../TreeView/TreeView';

interface PositionSectionProps {
    selectedElement: ElementNode | null;
    computedStyles: CSSStyleDeclaration | null;
    onStyleChange: (style: React.CSSProperties) => void;
}

export const PositionSection: React.FC<PositionSectionProps> = React.memo(
    ({ selectedElement, computedStyles, onStyleChange }) => {
        return (
            <div className={styles.section}>
                <div
                    className={styles.container}
                    style={{ flexDirection: 'column' }}
                >
                    Position
                    {/* Row Start */}
                    <div className={styles.row}>
                        <div className={styles.group}>
                            <div className={styles.groupTitle}>
                                Vertical Align
                            </div>
                            <div className={styles.groupContent}>
                                <AlignBottomIcon
                                    className={`${styles.icon} ${styles.button}`}
                                />
                                <AlignCenterVerticalIcon
                                    className={`${styles.icon} ${styles.button}`}
                                />
                                <AlignTopIcon
                                    className={`${styles.icon} ${styles.button}`}
                                />
                            </div>
                        </div>
                        <div className={styles.group}>
                            <div className={styles.groupTitle}>
                                Horizontal Align
                            </div>
                            <div className={styles.groupContent}>
                                <AlignLeftIcon
                                    className={`${styles.icon} ${styles.button}`}
                                />
                                <AlignCenterHorizontalIcon
                                    className={`${styles.icon} ${styles.button}`}
                                />
                                <AlignRightIcon
                                    className={`${styles.icon} ${styles.button}`}
                                />
                            </div>
                        </div>
                        <div className={styles.group}>
                            <div className={styles.groupTitle}>Flip</div>
                            <div className={styles.groupContent}>
                                <FlipHorizontalIcon
                                    className={`${styles.icon} ${styles.button}`}
                                />
                                <FlipVerticalIcon
                                    className={`${styles.icon} ${styles.button}`}
                                />
                            </div>
                        </div>
                    </div>
                    {/* Row Start */}
                    <div className={styles.row}>
                        <div className={styles.group}>
                            <div className={styles.groupTitle}>Position</div>
                            <div
                                className={styles.group}
                                style={{ flexDirection: 'row', gap: '10px' }}
                            >
                                <div className={styles.groupInput}>
                                    <div className={styles.inputLabel}>X</div>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={
                                            selectedElement?.style?.left !==
                                            undefined
                                                ? String(
                                                      selectedElement.style.left
                                                  ).replace('px', '')
                                                : ''
                                        }
                                        placeholder={computedStyles?.left?.replace(
                                            'px',
                                            ''
                                        )}
                                        onChange={(e) =>
                                            onStyleChange({
                                                left: e.target.value
                                                    ? `${e.target.value}px`
                                                    : undefined,
                                            })
                                        }
                                    />
                                </div>
                                <div className={styles.groupInput}>
                                    <div className={styles.inputLabel}>Y</div>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={
                                            selectedElement?.style?.top !==
                                            undefined
                                                ? String(
                                                      selectedElement.style.top
                                                  ).replace('px', '')
                                                : ''
                                        }
                                        placeholder={computedStyles?.top?.replace(
                                            'px',
                                            ''
                                        )}
                                        onChange={(e) =>
                                            onStyleChange({
                                                top: e.target.value
                                                    ? `${e.target.value}px`
                                                    : undefined,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.group}>
                            <div className={styles.groupTitle}>Rotation</div>
                            <div
                                className={styles.group}
                                style={{ flexDirection: 'row' }}
                            >
                                <div className={styles.groupInput}>
                                    <div className={styles.inputLabel}>
                                        <AngleIcon />
                                    </div>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={
                                            selectedElement?.style?.rotate !==
                                            undefined
                                                ? String(
                                                      selectedElement.style
                                                          .rotate
                                                  ).replace('deg', '')
                                                : ''
                                        }
                                        placeholder={computedStyles?.rotate?.replace(
                                            'deg',
                                            ''
                                        )}
                                        onChange={(e) =>
                                            onStyleChange({
                                                rotate: e.target.value
                                                    ? `${e.target.value}deg`
                                                    : undefined,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Row Start */}
                    <div className={styles.row}>
                        <div className={styles.group}>
                            <div className={styles.groupTitle}>Type</div>
                            <div className={styles.groupContent}>
                                <NetworkIcon
                                    className={`${styles.icon} ${styles.button}`}
                                    onClick={() => {
                                        const currentType =
                                            selectedElement?.style?.position;
                                        console.log(currentType);

                                        onStyleChange({
                                            position:
                                                currentType === 'relative'
                                                    ? currentType
                                                    : 'relative',
                                        });
                                    }}
                                />
                                <NetworkSlashIcon
                                    className={`${styles.icon} ${styles.button}`}
                                    onClick={() => {
                                        const currentType =
                                            selectedElement?.style?.position;
                                        console.log(currentType);

                                        onStyleChange({
                                            position:
                                                currentType === 'absolute'
                                                    ? currentType
                                                    : 'absolute',
                                        });
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);
