import React, { useState, useMemo, useEffect } from 'react';
import styles from '../../../../styles/Sidebar.module.css';
import {
    AlignBottomIcon,
    AlignLeftIcon,
    AlignRightIcon,
    AlignTopIcon,
    AlignCenterHorizontalIcon,
    AlignCenterVerticalIcon,
    ArrowDownIcon,
    ArrowUpIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    CornersOutIcon,
} from '@phosphor-icons/react';
import type { ElementNode } from '../../../TreeView/TreeView';
import { DimensionControl } from '../controls/DimensionControl';
import { PaddingControl } from '../controls/PaddingControl';

interface LayoutSectionProps {
    selectedElement: ElementNode | null;
    computedStyles: CSSStyleDeclaration | null;
    onStyleChange: (style: React.CSSProperties) => void;
}

export const LayoutSection: React.FC<LayoutSectionProps> = React.memo(
    ({ selectedElement, computedStyles, onStyleChange }) => {
        const [isEditingIndividually, setIsEditingIndividually] =
            useState(false);

        useEffect(() => {
            if (!selectedElement?.style) {
                setIsEditingIndividually(false);
                return;
            }

            const { paddingTop, paddingBottom, paddingLeft, paddingRight } =
                selectedElement.style;

            const areCurrentlyDifferent =
                paddingTop !== paddingBottom || paddingLeft !== paddingRight;

            setIsEditingIndividually(areCurrentlyDifferent);
        }, [selectedElement]);

        const handlePaddingChange = (
            side:
                | 'paddingTop'
                | 'paddingBottom'
                | 'paddingLeft'
                | 'paddingRight',
            value: string
        ) => {
            const newStyle = { [side]: value ? `${value}px` : undefined };

            if (!isEditingIndividually) {
                if (side === 'paddingTop') {
                    newStyle.paddingBottom = value ? `${value}px` : undefined;
                } else if (side === 'paddingLeft') {
                    newStyle.paddingRight = value ? `${value}px` : undefined;
                }
            }

            onStyleChange(newStyle);
        };

        const handleToggleSides = () => {
            if (isEditingIndividually) {
                onStyleChange({
                    paddingRight: selectedElement?.style?.paddingLeft,
                    paddingBottom: selectedElement?.style?.paddingTop,
                });
            }

            setIsEditingIndividually((prevState) => !prevState);
        };
        return (
            <div className={styles.section}>
                <div
                    className={styles.container}
                    style={{ flexDirection: 'column' }}
                >
                    Layout
                    {/* Row Start */}
                    <div className={styles.row}>
                        <div className={styles.group}>
                            <div className={styles.groupTitle}>Size</div>
                            <div className={styles.row}>
                                <DimensionControl
                                    label="W"
                                    value={selectedElement?.style?.width}
                                    placeholder={computedStyles?.width}
                                    onValueChange={(newValue) =>
                                        onStyleChange({ width: newValue })
                                    }
                                />
                                <DimensionControl
                                    label="H"
                                    value={selectedElement?.style?.height}
                                    placeholder={computedStyles?.height}
                                    onValueChange={(newValue) =>
                                        onStyleChange({ height: newValue })
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    {/* Row Start */}
                    <div className={styles.row}>
                        <div className={styles.group}>
                            <div
                                className={styles.group}
                                style={{ flexDirection: 'row', gap: '10px' }}
                            >
                                <div
                                    className={`${styles.groupInput} ${styles.disabled}`}
                                >
                                    <div className={styles.inputLabel}>min</div>
                                    <input
                                        type="text"
                                        disabled
                                        className={styles.input}
                                        value={
                                            selectedElement?.style?.minWidth !==
                                            undefined
                                                ? String(
                                                      selectedElement.style
                                                          .minWidth
                                                  ).replace('px', '')
                                                : ''
                                        }
                                        placeholder={computedStyles?.minWidth?.replace(
                                            'px',
                                            ''
                                        )}
                                    />
                                </div>
                                <div
                                    className={`${styles.groupInput} ${styles.disabled}`}
                                >
                                    <div className={styles.inputLabel}>max</div>
                                    <input
                                        type="text"
                                        disabled
                                        className={styles.input}
                                        value={
                                            selectedElement?.style?.maxWidth !==
                                            undefined
                                                ? String(
                                                      selectedElement.style
                                                          .maxWidth
                                                  ).replace('px', '')
                                                : ''
                                        }
                                        placeholder={computedStyles?.maxWidth?.replace(
                                            'px',
                                            ''
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.group}>
                            <div
                                className={styles.group}
                                style={{ flexDirection: 'row', gap: '10px' }}
                            >
                                <div
                                    className={`${styles.groupInput} ${styles.disabled}`}
                                >
                                    <div className={styles.inputLabel}>min</div>
                                    <input
                                        type="text"
                                        disabled
                                        className={styles.input}
                                        value={
                                            selectedElement?.style
                                                ?.minHeight !== undefined
                                                ? String(
                                                      selectedElement.style
                                                          .minHeight
                                                  ).replace('px', '')
                                                : ''
                                        }
                                        placeholder={computedStyles?.minHeight?.replace(
                                            'px',
                                            ''
                                        )}
                                    />
                                </div>
                                <div
                                    className={`${styles.groupInput} ${styles.disabled}`}
                                >
                                    <div className={styles.inputLabel}>max</div>
                                    <input
                                        type="text"
                                        disabled
                                        className={styles.input}
                                        value={
                                            selectedElement?.style
                                                ?.maxHeight !== undefined
                                                ? String(
                                                      selectedElement.style
                                                          .maxHeight
                                                  ).replace('px', '')
                                                : ''
                                        }
                                        placeholder={computedStyles?.maxHeight?.replace(
                                            'px',
                                            ''
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Row Start */}
                    <div className={styles.row}>
                        <div className={`${styles.group} ${styles.fill}`}>
                            <div className={styles.groupTitle}>
                                Display Direction
                            </div>
                            <div
                                className={`${styles.groupChoices} ${styles.buttonOptions}`}
                            >
                                <div
                                    className={`${styles.choice} ${selectedElement?.style?.flexDirection === 'column' ? styles.active : styles.inactive}`}
                                    onClick={() => {
                                        const currentDisplay =
                                            selectedElement?.style?.display;
                                        console.log(currentDisplay);

                                        onStyleChange({
                                            display:
                                                currentDisplay === 'flex'
                                                    ? currentDisplay
                                                    : 'flex',
                                            flexDirection: 'column',
                                        });
                                    }}
                                >
                                    <ArrowDownIcon
                                        className={`${styles.icon}`}
                                    />
                                </div>
                                <div
                                    className={`${styles.choice} ${selectedElement?.style?.flexDirection === 'column-reverse' ? styles.active : styles.inactive}`}
                                    onClick={() => {
                                        const currentDisplay =
                                            selectedElement?.style?.display;

                                        onStyleChange({
                                            display:
                                                currentDisplay === 'flex'
                                                    ? currentDisplay
                                                    : 'flex',
                                            flexDirection: 'column-reverse',
                                        });
                                    }}
                                >
                                    <ArrowUpIcon className={`${styles.icon}`} />
                                </div>
                                <div
                                    className={`${styles.choice} ${selectedElement?.style?.flexDirection === 'row' ? styles.active : styles.inactive}`}
                                    onClick={() => {
                                        const currentDisplay =
                                            selectedElement?.style?.display;

                                        onStyleChange({
                                            display:
                                                currentDisplay === 'flex'
                                                    ? currentDisplay
                                                    : 'flex',
                                            flexDirection: 'row',
                                        });
                                    }}
                                >
                                    <ArrowRightIcon
                                        className={`${styles.icon}`}
                                    />
                                </div>
                                <div
                                    className={`${styles.choice} ${selectedElement?.style?.flexDirection === 'row-reverse' ? styles.active : styles.inactive}`}
                                    onClick={() => {
                                        const currentDisplay =
                                            selectedElement?.style?.display;

                                        onStyleChange({
                                            display:
                                                currentDisplay === 'flex'
                                                    ? currentDisplay
                                                    : 'flex',
                                            flexDirection: 'row-reverse',
                                        });
                                    }}
                                >
                                    <ArrowLeftIcon
                                        className={`${styles.icon}`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Row Start */}
                    {[
                        'column',
                        'column-reverse',
                        'row',
                        'row-reverse',
                    ].includes(selectedElement?.style?.flexDirection || '') && (
                        <div className={styles.row}>
                            <div className={`${styles.group} ${styles.fill}`}>
                                <div className={styles.groupTitle}>Align</div>
                                <div className={styles.groupChoices}>
                                    <div
                                        className={`${styles.choice}  ${selectedElement?.style?.alignItems === 'flex-start' ? styles.active : styles.inactive}`}
                                        onClick={() =>
                                            onStyleChange({
                                                alignItems: 'flex-start',
                                            })
                                        }
                                    >
                                        {['row', 'row-reverse'].includes(
                                            selectedElement?.style
                                                ?.flexDirection || ''
                                        ) ? (
                                            <AlignTopIcon
                                                className={`${styles.icon}`}
                                                weight={
                                                    selectedElement?.style
                                                        ?.alignItems ===
                                                    'flex-start'
                                                        ? 'fill'
                                                        : 'regular'
                                                }
                                            />
                                        ) : (
                                            <AlignLeftIcon
                                                className={`${styles.icon}`}
                                                weight={
                                                    selectedElement?.style
                                                        ?.alignItems ===
                                                    'flex-start'
                                                        ? 'fill'
                                                        : 'regular'
                                                }
                                            />
                                        )}
                                    </div>
                                    <div
                                        className={`${styles.choice} ${selectedElement?.style?.alignItems === 'center' ? styles.active : styles.inactive}`}
                                        onClick={() =>
                                            onStyleChange({
                                                alignItems: 'center',
                                            })
                                        }
                                    >
                                        {['row', 'row-reverse'].includes(
                                            selectedElement?.style
                                                ?.flexDirection || ''
                                        ) ? (
                                            <AlignCenterVerticalIcon
                                                className={`${styles.icon}`}
                                                weight={
                                                    selectedElement?.style
                                                        ?.alignItems ===
                                                    'center'
                                                        ? 'fill'
                                                        : 'regular'
                                                }
                                            />
                                        ) : (
                                            <AlignCenterHorizontalIcon
                                                className={`${styles.icon}`}
                                                weight={
                                                    selectedElement?.style
                                                        ?.alignItems ===
                                                    'center'
                                                        ? 'fill'
                                                        : 'regular'
                                                }
                                            />
                                        )}
                                    </div>
                                    <div
                                        className={`${styles.choice} ${selectedElement?.style?.alignItems === 'flex-end' ? styles.active : styles.inactive}`}
                                        onClick={() =>
                                            onStyleChange({
                                                alignItems: 'flex-end',
                                            })
                                        }
                                    >
                                        {['row', 'row-reverse'].includes(
                                            selectedElement?.style
                                                ?.flexDirection || ''
                                        ) ? (
                                            <AlignBottomIcon
                                                className={`${styles.icon}`}
                                                weight={
                                                    selectedElement?.style
                                                        ?.alignItems ===
                                                    'flex-end'
                                                        ? 'fill'
                                                        : 'regular'
                                                }
                                            />
                                        ) : (
                                            <AlignRightIcon
                                                className={`${styles.icon}`}
                                                weight={
                                                    selectedElement?.style
                                                        ?.alignItems ===
                                                    'flex-end'
                                                        ? 'fill'
                                                        : 'regular'
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Row Start */}
                    {[
                        'column',
                        'column-reverse',
                        'row',
                        'row-reverse',
                    ].includes(selectedElement?.style?.flexDirection || '') && (
                        <div className={styles.row}>
                            <div className={`${styles.group} ${styles.fill}`}>
                                <div className={styles.groupTitle}>Justify</div>
                                <div className={`${styles.groupInput}`}>
                                    <select
                                        className={`${styles.input} ${styles.select}`}
                                        value={
                                            selectedElement?.style
                                                ?.justifyContent || ''
                                        }
                                        onChange={(e) =>
                                            onStyleChange({
                                                justifyContent:
                                                    e.target.value || undefined,
                                            })
                                        }
                                    >
                                        <option value="">Default</option>
                                        <option value="flex-start">
                                            Start
                                        </option>
                                        <option value="center">Center</option>
                                        <option value="flex-end">End</option>
                                        <option value="space-between">
                                            Space Between
                                        </option>
                                        <option value="space-around">
                                            Space Around
                                        </option>
                                        <option value="space-evenly">
                                            Space Evenly
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.group}>
                                <div className={styles.groupTitle}>Gap</div>
                                <div
                                    className={`${styles.groupInput} ${['column', 'column-reverse', 'row', 'row-reverse'].includes(selectedElement?.style?.flexDirection || '') ? '' : styles.disabled}`}
                                >
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={
                                            selectedElement?.style?.gap !==
                                            undefined
                                                ? String(
                                                      selectedElement.style.gap
                                                  ).replace('px', '')
                                                : ''
                                        }
                                        placeholder={computedStyles?.gap?.replace(
                                            'px',
                                            ''
                                        )}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            onStyleChange({
                                                gap: value
                                                    ? `${value}px`
                                                    : undefined,
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Row Start */}
                    <div className={styles.row}>
                        <div className={styles.group}>
                            <div className={styles.groupTitle}>Padding</div>
                            <div
                                className={styles.group}
                                style={{
                                    flexDirection: 'row',
                                    gap: '10px',
                                    alignItems: 'flex-end',
                                }}
                            >
                                <PaddingControl
                                    side="paddingTop"
                                    value={selectedElement?.style?.paddingTop}
                                    onPaddingChange={handlePaddingChange}
                                    labelComponent={
                                        <div
                                            className={`${styles.paddingOption} ${styles.top} ${!isEditingIndividually && styles.bottom}`}
                                        ></div>
                                    }
                                />

                                {isEditingIndividually && (
                                    <PaddingControl
                                        side="paddingBottom"
                                        value={
                                            selectedElement?.style
                                                ?.paddingBottom
                                        }
                                        onPaddingChange={handlePaddingChange}
                                        labelComponent={
                                            <div
                                                className={`${styles.paddingOption} ${styles.bottom}`}
                                            ></div>
                                        }
                                    />
                                )}

                                <PaddingControl
                                    side="paddingLeft"
                                    value={selectedElement?.style?.paddingLeft}
                                    onPaddingChange={handlePaddingChange}
                                    labelComponent={
                                        <div
                                            className={`${styles.paddingOption} ${styles.left} ${!isEditingIndividually && styles.right}`}
                                        ></div>
                                    }
                                />

                                {isEditingIndividually && (
                                    <PaddingControl
                                        side="paddingRight"
                                        value={
                                            selectedElement?.style?.paddingRight
                                        }
                                        onPaddingChange={handlePaddingChange}
                                        labelComponent={
                                            <div
                                                className={`${styles.paddingOption} ${styles.right}`}
                                            ></div>
                                        }
                                    />
                                )}

                                <div
                                    className={styles.groupChoices}
                                    style={{ width: 'fit-content' }}
                                >
                                    <div
                                        className={`${styles.choice} ${isEditingIndividually ? `${styles.active} ${styles.toggled}` : styles.inactive}`}
                                        onClick={handleToggleSides}
                                    >
                                        <CornersOutIcon
                                            className={styles.icon}
                                            weight={
                                                isEditingIndividually
                                                    ? 'bold'
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
                        <div className={`${styles.group} ${styles.fill}`}>
                            <div className={styles.groupTitle}>Overflow X</div>
                            <div className={`${styles.groupInput}`}>
                                <select
                                    className={`${styles.input} ${styles.select}`}
                                    value={
                                        selectedElement?.style?.overflowX || ''
                                    }
                                    onChange={(e) =>
                                        onStyleChange({
                                            overflowX:
                                                (e.target
                                                    .value as React.CSSProperties['overflowX']) ||
                                                'auto',
                                        })
                                    }
                                >
                                    <option value="auto">Auto</option>
                                    <option value="hidden">Hidden</option>
                                    <option value="visible">Visible</option>
                                    <option value="scroll">Scroll</option>
                                </select>
                            </div>
                        </div>
                        <div className={`${styles.group} ${styles.fill}`}>
                            <div className={styles.groupTitle}>Overflow Y</div>
                            <div className={`${styles.groupInput}`}>
                                <select
                                    className={`${styles.input} ${styles.select}`}
                                    value={
                                        selectedElement?.style?.overflowY || ''
                                    }
                                    onChange={(e) =>
                                        onStyleChange({
                                            overflowY:
                                                (e.target
                                                    .value as React.CSSProperties['overflowY']) ||
                                                'auto',
                                        })
                                    }
                                >
                                    <option value="auto">Auto</option>
                                    <option value="hidden">Hidden</option>
                                    <option value="visible">Visible</option>
                                    <option value="scroll">Scroll</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);
