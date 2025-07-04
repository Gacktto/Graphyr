import React from 'react';
import styles from '../../../../styles/Sidebar.module.css';
import {
    AlignBottomIcon,
    AlignLeftIcon,
    AlignRightIcon,
    AlignTopIcon,
    AlignCenterHorizontalIcon,
    AlignCenterVerticalIcon,
    ArrowFatLinesDownIcon,
    ArrowFatLinesUpIcon,
    ArrowFatLinesLeftIcon,
    ArrowFatLinesRightIcon,
} from '@phosphor-icons/react';
import type { ElementNode } from '../../../TreeView/TreeView';
import { DimensionControl } from '../controls/DimensionControl';

interface LayoutSectionProps {
    selectedElement: ElementNode | null;
    computedStyles: CSSStyleDeclaration | null;
    onStyleChange: (style: React.CSSProperties) => void;
}

export const LayoutSection: React.FC<LayoutSectionProps> = React.memo(
    ({ selectedElement, computedStyles, onStyleChange }) => {
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
                            <DimensionControl
                                label="W"
                                value={selectedElement?.style?.width}
                                placeholder={computedStyles?.width}
                                onValueChange={(newValue) => onStyleChange({ width: newValue })}
                            />
                            <DimensionControl
                                label="H"
                                value={selectedElement?.style?.height}
                                placeholder={computedStyles?.height}
                                onValueChange={(newValue) => onStyleChange({ height: newValue })}
                            />
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
                                className={`${styles.groupContent} ${styles.buttonOptions}`}
                            >
                                <ArrowFatLinesDownIcon
                                    className={`${styles.icon} ${styles.button}`}
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
                                />
                                <ArrowFatLinesUpIcon
                                    className={`${styles.icon} ${styles.button}`}
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
                                />
                                <ArrowFatLinesRightIcon
                                    className={`${styles.icon} ${styles.button}`}
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
                                />
                                <ArrowFatLinesLeftIcon
                                    className={`${styles.icon} ${styles.button}`}
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
                                />
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

                                <div
                                    className={`${styles.groupContent} ${styles.buttonOptions}`}
                                >
                                    {/* Horizontal alignment (aparece se for column ou column-reverse) */}
                                    {['column', 'column-reverse'].includes(
                                        selectedElement?.style?.flexDirection ||
                                            ''
                                    ) && (
                                        <>
                                            <AlignLeftIcon
                                                className={`${styles.icon} ${styles.button}`}
                                                onClick={() =>
                                                    onStyleChange({
                                                        alignItems:
                                                            'flex-start',
                                                    })
                                                }
                                            />
                                            <AlignCenterHorizontalIcon
                                                className={`${styles.icon} ${styles.button}`}
                                                onClick={() =>
                                                    onStyleChange({
                                                        alignItems: 'center',
                                                    })
                                                }
                                            />
                                            <AlignRightIcon
                                                className={`${styles.icon} ${styles.button}`}
                                                onClick={() =>
                                                    onStyleChange({
                                                        alignItems: 'flex-end',
                                                    })
                                                }
                                            />
                                        </>
                                    )}

                                    {/* Vertical alignment (aparece se for row ou row-reverse) */}
                                    {['row', 'row-reverse'].includes(
                                        selectedElement?.style?.flexDirection ||
                                            ''
                                    ) && (
                                        <>
                                            <AlignTopIcon
                                                className={`${styles.icon} ${styles.button}`}
                                                onClick={() =>
                                                    onStyleChange({
                                                        alignItems:
                                                            'flex-start',
                                                    })
                                                }
                                            />
                                            <AlignCenterVerticalIcon
                                                className={`${styles.icon} ${styles.button}`}
                                                onClick={() =>
                                                    onStyleChange({
                                                        alignItems: 'center',
                                                    })
                                                }
                                            />
                                            <AlignBottomIcon
                                                className={`${styles.icon} ${styles.button}`}
                                                onClick={() =>
                                                    onStyleChange({
                                                        alignItems: 'flex-end',
                                                    })
                                                }
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Row Start */}
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
                                    <option value="flex-start">Start</option>
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
                                    disabled={
                                        [
                                            'column',
                                            'column-reverse',
                                            'row',
                                            'row-reverse',
                                        ].includes(
                                            selectedElement?.style
                                                ?.flexDirection || ''
                                        )
                                            ? false
                                            : true
                                    }
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
                    {/* Row Start */}
                    <div className={styles.row}>
                        <div className={styles.group}>
                            <div className={styles.groupTitle}>Padding</div>
                            <div
                                className={styles.group}
                                style={{ flexDirection: 'row', gap: '10px' }}
                            >
                                <div className={`${styles.groupInput}`}>
                                    <div className={styles.inputLabel}>T</div>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={
                                            selectedElement?.style
                                                ?.paddingTop !== undefined
                                                ? String(
                                                      selectedElement.style
                                                          .paddingTop
                                                  ).replace('px', '')
                                                : ''
                                        }
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            onStyleChange({
                                                paddingTop: value
                                                    ? `${value}px`
                                                    : undefined,
                                            });
                                        }}
                                    />
                                </div>
                                <div className={`${styles.groupInput}`}>
                                    <div className={styles.inputLabel}>B</div>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={
                                            selectedElement?.style
                                                ?.paddingBottom !== undefined
                                                ? String(
                                                      selectedElement.style
                                                          .paddingBottom
                                                  ).replace('px', '')
                                                : ''
                                        }
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            onStyleChange({
                                                paddingBottom: value
                                                    ? `${value}px`
                                                    : undefined,
                                            });
                                        }}
                                    />
                                </div>
                                <div className={`${styles.groupInput}`}>
                                    <div className={styles.inputLabel}>L</div>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={
                                            selectedElement?.style
                                                ?.paddingLeft !== undefined
                                                ? String(
                                                      selectedElement.style
                                                          .paddingLeft
                                                  ).replace('px', '')
                                                : ''
                                        }
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            onStyleChange({
                                                paddingLeft: value
                                                    ? `${value}px`
                                                    : undefined,
                                            });
                                        }}
                                    />
                                </div>
                                <div className={`${styles.groupInput}`}>
                                    <div className={styles.inputLabel}>R</div>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={
                                            selectedElement?.style
                                                ?.paddingRight !== undefined
                                                ? String(
                                                      selectedElement.style
                                                          .paddingRight
                                                  ).replace('px', '')
                                                : ''
                                        }
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            onStyleChange({
                                                paddingRight: value
                                                    ? `${value}px`
                                                    : undefined,
                                            });
                                        }}
                                    />
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
