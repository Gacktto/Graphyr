import React, { useMemo, useState } from 'react';
import styles from '../../../../styles/Sidebar.module.css';
import {
    ArrowsLeftRightIcon,
    ArrowsDownUpIcon,
    AngleIcon,
} from '@phosphor-icons/react';
import type { ElementNode } from '../../../TreeView/TreeView';

interface PositionSectionProps {
    selectedElement: ElementNode | null;
    computedStyles: CSSStyleDeclaration | null;
    onStyleChange: (style: React.CSSProperties) => void;
}

const positionConfigs = [
    {
        id: 'topLeft',
        style: { top: 0, left: 0, right: '', bottom: '', margin: 'auto' },
    },
    {
        id: 'top',
        style: { top: 0, left: 0, right: 0, bottom: '', margin: 'auto' },
    },
    {
        id: 'topRight',
        style: { top: 0, left: '', right: 0, bottom: '', margin: 'auto' },
    },
    {
        id: 'left',
        style: { top: 0, left: 0, right: '', bottom: 0, margin: 'auto' },
    },
    {
        id: 'center',
        style: { top: 0, left: 0, right: 0, bottom: 0, margin: 'auto' },
    },
    {
        id: 'right',
        style: { top: 0, left: '', right: 0, bottom: 0, margin: 'auto' },
    },
    {
        id: 'bottomLeft',
        style: { top: '', left: 0, right: '', bottom: 0, margin: 'auto' },
    },
    {
        id: 'bottom',
        style: { top: '', left: 0, right: 0, bottom: 0, margin: 'auto' },
    },
    {
        id: 'bottomRight',
        style: { top: '', left: '', right: 0, bottom: 0, margin: 'auto' },
    },
];

export const PositionSection: React.FC<PositionSectionProps> = React.memo(
    ({ selectedElement, computedStyles, onStyleChange }) => {
        const handlePositionClick = (
            config: (typeof positionConfigs)[number]
        ) => {
            onStyleChange(config.style);
        };

        const activeId = useMemo(() => {
            const elementStyle = selectedElement?.style;

            if (!elementStyle) {
                return null;
            }

            const foundConfig = positionConfigs.find((config) =>
                Object.entries(config.style).every(
                    ([key, value]) =>
                        elementStyle[key as keyof React.CSSProperties] === value
                )
            );

            return foundConfig ? foundConfig.id : null;
        }, [selectedElement]);

        return (
            <div className={styles.section}>
                <div
                    className={styles.container}
                    style={{ flexDirection: 'column' }}
                >
                    Position
                    {/* Row Start */}
                    <div className={styles.row}>
                        <div
                            className={`${styles.group}`}
                            style={{ height: '100%' }}
                        >
                            <div className={styles.groupTitle}>Align</div>
                            <div className={`${styles.groupContent}`}>
                                <div className={styles.handlePosition}>
                                    {positionConfigs.map((config) => (
                                        <div
                                            key={config.id}
                                            className={`${styles.buttonPosition} ${
                                                activeId === config.id
                                                    ? styles.active
                                                    : ''
                                            }`}
                                            onClick={() =>
                                                handlePositionClick(config)
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={`${styles.group} ${styles.fill}`}>
                            <div className={styles.groupTitle}>Type</div>
                            <div className={styles.groupChoices}>
                                <div
                                    className={`${styles.choice} ${selectedElement?.style?.position === 'absolute' ? styles.active : styles.inactive}`}
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
                                >
                                    Absolute
                                </div>
                                <div
                                    className={`${styles.choice} ${selectedElement?.style?.position === 'relative' ? styles.active : styles.inactive}`}
                                    onClick={() => {
                                        const currentType =
                                            selectedElement?.style?.position;

                                        onStyleChange({
                                            position:
                                                currentType === 'relative'
                                                    ? currentType
                                                    : 'relative',
                                            top: '',
                                            left: '',
                                        });
                                    }}
                                >
                                    Relative
                                </div>
                            </div>

                            <div className={`${styles.group} ${styles.fill}`}>
                                <div className={styles.groupTitle}>Flip</div>
                                <div className={styles.groupChoices}>
                                    <div
                                        className={`${styles.choice} ${selectedElement?.style?.transform?.includes('scaleX(-1)') ? `${styles.active} ${styles.toggled}` : styles.inactive}`}
                                        onClick={() => {
                                            const transform =
                                                selectedElement?.style
                                                    ?.transform || '';
                                            const hasFlipX =
                                                transform.includes(
                                                    'scaleX(-1)'
                                                );
                                            const hasFlipY =
                                                transform.includes(
                                                    'scaleY(-1)'
                                                );

                                            const newFlipX = hasFlipX
                                                ? 'scaleX(1)'
                                                : 'scaleX(-1)';
                                            const flipY = hasFlipY
                                                ? 'scaleY(-1)'
                                                : 'scaleY(1)';

                                            onStyleChange({
                                                transform: `${newFlipX} ${flipY}`,
                                            });
                                        }}
                                    >
                                        <ArrowsLeftRightIcon
                                            className={styles.icon}
                                            weight={
                                                selectedElement?.style?.transform?.includes(
                                                    'scaleX(-1)'
                                                )
                                                    ? 'fill'
                                                    : 'regular'
                                            }
                                        />
                                    </div>

                                    <div
                                        className={`${styles.choice} ${selectedElement?.style?.transform?.includes('scaleY(-1)') ? `${styles.active} ${styles.toggled}` : styles.inactive}`}
                                        onClick={() => {
                                            const transform =
                                                selectedElement?.style
                                                    ?.transform || '';
                                            const hasFlipX =
                                                transform.includes(
                                                    'scaleX(-1)'
                                                );
                                            const hasFlipY =
                                                transform.includes(
                                                    'scaleY(-1)'
                                                );

                                            const flipX = hasFlipX
                                                ? 'scaleX(-1)'
                                                : 'scaleX(1)';
                                            const newFlipY = hasFlipY
                                                ? 'scaleY(1)'
                                                : 'scaleY(-1)';

                                            onStyleChange({
                                                transform: `${flipX} ${newFlipY}`,
                                            });
                                        }}
                                    >
                                        <ArrowsDownUpIcon
                                            className={styles.icon}
                                            weight={
                                                selectedElement?.style?.transform?.includes(
                                                    'scaleY(-1)'
                                                )
                                                    ? 'fill'
                                                    : 'regular'
                                            }
                                        />
                                    </div>
                                </div>
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
                </div>
            </div>
        );
    }
);
