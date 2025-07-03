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

// Definimos as props que este componente precisa receber
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
                    {/* Row Start - Border e outros */}
                    {/* Você pode continuar movendo o resto do JSX da seção de aparência para cá */}
                    {/* Row Start */}
                    <div className={styles.row}>
                        <div className={styles.group}>
                            <div className={styles.groupTitle}>Border</div>
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
                                                ?.borderTop !== undefined
                                                ? String(
                                                      selectedElement.style
                                                          .borderTop
                                                  ).replace('px', '')
                                                : ''
                                        }
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            onStyleChange({
                                                borderTop: value
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
                                                ?.borderBottom !== undefined
                                                ? String(
                                                      selectedElement.style
                                                          .borderBottom
                                                  ).replace('px', '')
                                                : ''
                                        }
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            onStyleChange({
                                                borderBottom: value
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
                                                ?.borderLeft !== undefined
                                                ? String(
                                                      selectedElement.style
                                                          .borderLeft
                                                  ).replace('px', '')
                                                : ''
                                        }
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            onStyleChange({
                                                borderLeft: value
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
                                                ?.borderRight !== undefined
                                                ? String(
                                                      selectedElement.style
                                                          .borderRight
                                                  ).replace('px', '')
                                                : ''
                                        }
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            onStyleChange({
                                                borderRight: value
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
                            <div className={styles.groupTitle}>
                                Border Style
                            </div>
                            <div className={`${styles.groupInput}`}>
                                <select
                                    className={`${styles.input} ${styles.select}`}
                                    value={
                                        selectedElement?.style?.borderStyle ||
                                        ''
                                    }
                                    onChange={(e) =>
                                        onStyleChange({
                                            borderStyle:
                                                (e.target
                                                    .value as React.CSSProperties['borderStyle']) ||
                                                'auto',
                                        })
                                    }
                                >
                                    <option value="none">Type</option>
                                    <option value="solid">Solid</option>
                                    <option value="dashed">dashed</option>
                                    <option value="dotted">dotted</option>
                                </select>
                            </div>
                        </div>
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
                    {/* Row Start */}
                    <div className={styles.row}>
                        <ColorControl
                            label="Border Color"
                            property="borderColor"
                            value={selectedElement?.style?.borderColor}
                            onClick={onColorControlClick}
                        />
                    </div>
                </div>
            </div>
        );
    }
);
