import React from 'react';
import styles from '../../../../styles/Sidebar.module.css';
import {
    EyeIcon,
    DiceFiveIcon,
    EyeClosedIcon,
    CornersOutIcon,
} from '@phosphor-icons/react';
import type { ElementNode } from '../../../TreeView/TreeView';
import { ColorControl } from '../../../ColorPicker/ColorControl';

interface AppearanceSectionProps {
    selectedElement: ElementNode | null;
    computedStyles: CSSStyleDeclaration | null;
    onStyleChange: (style: React.CSSProperties) => void;
    onColorControlClick: (
        event: React.MouseEvent,
        property: keyof React.CSSProperties
    ) => void;
}

export const AppearanceSection: React.FC<AppearanceSectionProps> = React.memo(
    ({
        selectedElement,
        computedStyles,
        onStyleChange,
        onColorControlClick,
    }) => {
        return (
            <div className={styles.section}>
                <div
                    className={styles.container}
                    style={{ flexDirection: 'column' }}
                >
                    Appearence
                    {/* Row Start */}
                    <div className={styles.row}>
                        <div className={`${styles.group} ${styles.fill}`}>
                            <div className={styles.groupTitle}>Visibility</div>
                            <div
                                className={`${styles.group} ${styles.fill}`}
                                style={{ flexDirection: 'row', gap: '10px' }}
                            >
                                <div className={styles.groupInput}>
                                    <DiceFiveIcon
                                        className={`${styles.inputIcon}`}
                                    />
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={
                                            selectedElement?.style?.opacity !==
                                            undefined
                                                ? selectedElement.style.opacity
                                                : ''
                                        }
                                        placeholder={computedStyles?.opacity}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            onStyleChange({
                                                opacity: value || undefined,
                                            });
                                        }}
                                    />
                                </div>
                                <div
                                    className={`${styles.groupContent} ${styles.buttonOptions}`}
                                >
                                    <EyeIcon
                                        className={`${styles.icon} ${styles.button}`}
                                        onClick={() =>
                                            onStyleChange({ display: 'flex' })
                                        }
                                    />
                                    <EyeClosedIcon
                                        className={`${styles.icon} ${styles.button}`}
                                        onClick={() =>
                                            onStyleChange({ display: 'none' })
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Row Start - Background Color */}
                    <div className={styles.row}>
                        <ColorControl
                            label="Background"
                            property="backgroundColor"
                            value={selectedElement?.style?.backgroundColor}
                            onClick={onColorControlClick}
                        />
                    </div>
                    {/* Row Start */}
                    <div className={styles.row}>
                        <div className={`${styles.group} ${styles.fill}`}>
                            <div className={styles.groupTitle}>
                                Border Radius
                            </div>
                            <div className={styles.groupInput}>
                                <CornersOutIcon
                                    className={`${styles.inputIcon}`}
                                />
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={
                                        selectedElement?.style?.borderRadius !==
                                        undefined
                                            ? String(
                                                  selectedElement.style
                                                      .borderRadius
                                              ).replace('px', '')
                                            : ''
                                    }
                                    placeholder={String(
                                        computedStyles?.borderRadius
                                    ).replace('px', '')}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        onStyleChange({
                                            borderRadius: value
                                                ? `${value}px`
                                                : undefined,
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
