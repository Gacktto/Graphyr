import React, { useState, useMemo, useEffect } from 'react';
import styles from '../../../../styles/Sidebar.module.css';
import { ColorControl } from '../../../ColorPicker/ColorControl';
import type { ElementNode } from '../../../TreeView/TreeView';
import { PlusIcon, TrashIcon } from '@phosphor-icons/react';

interface StrokeSectionProps {
    selectedElement: ElementNode | null;
    computedStyles: CSSStyleDeclaration | null;
    onStyleChange: (style: React.CSSProperties) => void;
    onColorControlClick: (
        event: React.MouseEvent,
        property: keyof React.CSSProperties
    ) => void;
}

type BorderSide = 'top' | 'right' | 'bottom' | 'left' | 'all';

const allIndividualSides: BorderSide[] = ['top', 'right', 'bottom', 'left'];

export const StrokeSection: React.FC<StrokeSectionProps> = React.memo(
    ({
        selectedElement,
        computedStyles,
        onStyleChange,
        onColorControlClick,
    }) => {
        const [activeSides, setActiveSides] = useState<BorderSide[]>([]);
        const [showDropdown, setShowDropdown] = useState(false);

        const capitalize = (s: string) =>
            s.charAt(0).toUpperCase() + s.slice(1);

        useEffect(() => {
            const elementStyle = selectedElement?.style;
            if (!elementStyle) {
                setActiveSides([]);
                return;
            }

            const detectedSides: BorderSide[] = [];

            const firstSideWidth = elementStyle.borderTopWidth;
            const firstSideStyle = elementStyle.borderTopStyle;
            const firstSideColor = elementStyle.borderTopColor;

            if (firstSideWidth || firstSideStyle || firstSideColor) {
                const allSame = allIndividualSides.every(
                    (s) =>
                        elementStyle[
                            `border${capitalize(s)}Width` as keyof React.CSSProperties
                        ] === firstSideWidth &&
                        elementStyle[
                            `border${capitalize(s)}Style` as keyof React.CSSProperties
                        ] === firstSideStyle &&
                        elementStyle[
                            `border${capitalize(s)}Color` as keyof React.CSSProperties
                        ] === firstSideColor
                );

                if (allSame) {
                    detectedSides.push('all');
                } else {
                    allIndividualSides.forEach((side) => {
                        const widthProp =
                            `border${capitalize(side)}Width` as keyof React.CSSProperties;
                        const styleProp =
                            `border${capitalize(side)}Style` as keyof React.CSSProperties;
                        const colorProp =
                            `border${capitalize(side)}Color` as keyof React.CSSProperties;
                        if (
                            elementStyle[widthProp] ||
                            elementStyle[styleProp] ||
                            elementStyle[colorProp]
                        ) {
                            detectedSides.push(side);
                        }
                    });
                }
            }

            setActiveSides(detectedSides);
        }, [selectedElement]);

        const availableSides = useMemo(() => {
            if (activeSides.includes('all') || activeSides.length >= 4)
                return [];
            const allPossibleSides: BorderSide[] = [
                'all',
                ...allIndividualSides,
            ];
            return allPossibleSides.filter(
                (side) => !activeSides.includes(side)
            );
        }, [activeSides]);

        const handleAddSide = (side: BorderSide) => {
            const defaultValues = {
                Width: '1px',
                Style: 'solid',
                Color: '#000000',
            };

            let styleUpdate: React.CSSProperties = {};

            if (side === 'all') {
                allIndividualSides.forEach((s) => {
                    (styleUpdate as any)[`border${capitalize(s)}Width`] =
                        defaultValues.Width;
                    (styleUpdate as any)[`border${capitalize(s)}Style`] =
                        defaultValues.Style;
                    (styleUpdate as any)[`border${capitalize(s)}Color`] =
                        defaultValues.Color;
                });
            } else {
                (styleUpdate as any)[`border${capitalize(side)}Width`] =
                    defaultValues.Width;
                (styleUpdate as any)[`border${capitalize(side)}Style`] =
                    defaultValues.Style;
                (styleUpdate as any)[`border${capitalize(side)}Color`] =
                    defaultValues.Color;
            }

            onStyleChange(styleUpdate);
            setShowDropdown(false);
        };

        const handleRemoveSide = (sideToRemove: BorderSide) => {
            setActiveSides((prev) => prev.filter((s) => s !== sideToRemove));

            if (sideToRemove === 'all') {
                onStyleChange({
                    borderWidth: undefined,
                    borderStyle: undefined,
                    borderColor: undefined,
                    borderTop: undefined,
                    borderBottom: undefined,
                    borderLeft: undefined,
                    borderRight: undefined,
                });
            } else {
                onStyleChange({
                    [`border${capitalize(sideToRemove)}Width`]: undefined,
                    [`border${capitalize(sideToRemove)}Style`]: undefined,
                    [`border${capitalize(sideToRemove)}Color`]: undefined,
                });
            }
        };

        const handlePropertyChange = (
            side: BorderSide,
            propertySuffix: 'Width' | 'Style' | 'Color',
            value: any
        ) => {
            let styleUpdate: React.CSSProperties = {};

            if (side === 'all') {
                allIndividualSides.forEach((s) => {
                    const key =
                        `border${capitalize(s)}${propertySuffix}` as keyof React.CSSProperties;
                    (styleUpdate as any)[key] = value;
                });
            } else {
                const key =
                    `border${capitalize(side)}${propertySuffix}` as keyof React.CSSProperties;
                (styleUpdate as any)[key] = value;
            }
            onStyleChange(styleUpdate);
        };

        const getPaddingClass = (side: BorderSide): string => {
            if (side === 'all')
                return `${styles.bottom} ${styles.top} ${styles.left} ${styles.right}`;
            return styles[side] || '';
        };

        return (
            <div className={styles.section}>
                <div
                    className={styles.container}
                    style={{ flexDirection: 'column', gap: '8px' }}
                >
                    <div
                        className={styles.row}
                        style={{ justifyContent: 'space-between' }}
                    >
                        Stroke
                        {availableSides.length > 0 && (
                            <div style={{ position: 'relative' }}>
                                <PlusIcon
                                    className={`${styles.icon} ${styles.button}`}
                                    onClick={() =>
                                        setShowDropdown(!showDropdown)
                                    }
                                />
                                {showDropdown && (
                                    <div
                                        className={styles.dropdownContainer}
                                        style={{
                                            left: 'unset',
                                            right: '100%',
                                            width: 'fit-content',
                                        }}
                                    >
                                        {availableSides.map((side) => (
                                            <div
                                                key={side}
                                                className={
                                                    styles.dropdownOption
                                                }
                                                onClick={() =>
                                                    handleAddSide(side)
                                                }
                                                style={{cursor: "pointer"}}
                                            >
                                                {capitalize(side)}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {activeSides.map((side: BorderSide) => {
                        const sideLabel = capitalize(side);
                        const widthProp =
                            `border${side === 'all' ? 'Top' : sideLabel}Width` as keyof React.CSSProperties;
                        const styleProp =
                            `border${side === 'all' ? 'Top' : sideLabel}Style` as keyof React.CSSProperties;
                        const colorProp =
                            `border${side === 'all' ? 'Top' : sideLabel}Color` as keyof React.CSSProperties;

                        return (
                            <div
                                key={side}
                                className={styles.row}
                                style={{ flexDirection: 'column', gap: '6px' }}
                            >
                                <div
                                    className={styles.row}
                                    style={{
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <div
                                        className={styles.groupInput}
                                        style={{ border: 'none' }}
                                    >
                                        <div className={styles.inputLabel}>
                                            <div
                                                className={`${styles.paddingOption} ${getPaddingClass(side)}`}
                                            ></div>
                                        </div>
                                        <span style={{ marginLeft: '8px' }}>
                                            {sideLabel}
                                        </span>
                                    </div>
                                    <TrashIcon
                                        className={`${styles.icon} ${styles.button}`}
                                        onClick={() => handleRemoveSide(side)}
                                    />
                                </div>

                                <div className={styles.row}>
                                    <ColorControl
                                        label="Color"
                                        property={colorProp}
                                        value={
                                            selectedElement?.style?.[colorProp]
                                                ? String(
                                                      selectedElement.style[
                                                          colorProp
                                                      ]
                                                  )
                                                : undefined
                                        }
                                        onClick={(e) => {
                                            // const propsToUpdate = side === 'all'
                                            //     ? allIndividualSides.map(s => `border${capitalize(s)}Color`)
                                            //     : [colorProp];
                                            onColorControlClick(e, colorProp);
                                        }}
                                    />
                                </div>

                                <div className={styles.row}>
                                    <div
                                        className={`${styles.group} ${styles.fill}`}
                                    >
                                        <div className={styles.groupTitle}>
                                            Style
                                        </div>
                                        <div className={`${styles.groupInput}`}>
                                            <select
                                                className={`${styles.input} ${styles.select}`}
                                                value={
                                                    selectedElement?.style?.[
                                                        styleProp
                                                    ] || ''
                                                }
                                                onChange={(e) =>
                                                    handlePropertyChange(
                                                        side,
                                                        'Style',
                                                        e.target.value ||
                                                            undefined
                                                    )
                                                }
                                            >
                                                <option value="">Type</option>
                                                <option value="solid">
                                                    Solid
                                                </option>
                                                <option value="dashed">
                                                    Dashed
                                                </option>
                                                <option value="dotted">
                                                    Dotted
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    <div
                                        className={`${styles.group} ${styles.fill}`}
                                    >
                                        <div className={styles.groupTitle}>
                                            Weight
                                        </div>
                                        <div className={`${styles.groupInput}`}>
                                            <div className={styles.inputLabel}>
                                                <div
                                                    className={`${styles.paddingOption} ${getPaddingClass(side)}`}
                                                ></div>
                                            </div>
                                            <input
                                                type="text"
                                                className={styles.input}
                                                value={String(
                                                    selectedElement?.style?.[
                                                        widthProp
                                                    ] || ''
                                                ).replace('px', '')}
                                                onChange={(e) =>
                                                    handlePropertyChange(
                                                        side,
                                                        'Width',
                                                        e.target.value
                                                            ? `${e.target.value}px`
                                                            : undefined
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
);
