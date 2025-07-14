import React, { useState } from 'react';
import styles from '../../../../styles/Sidebar.module.css';
import {
    EyeIcon,
    DiceFiveIcon,
    EyeClosedIcon,
    CornersOutIcon,
    DropHalfIcon
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

const blendModes: React.CSSProperties['mixBlendMode'][] = [
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 
  'color-dodge', 'color-burn', 'hard-light', 'soft-light', 
  'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'
];

export const AppearanceSection: React.FC<AppearanceSectionProps> = React.memo(
    ({
        selectedElement,
        computedStyles,
        onStyleChange,
        onColorControlClick,
    }) => {
        const [showDropdown, setShowDropdown] = useState(false);

        const handleBlendModeChange = (mode: React.CSSProperties['mixBlendMode']) => {
            onStyleChange({ mixBlendMode: mode });
            setShowDropdown(false);
        };

        const capitalize = (s: string | undefined | null) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
        const isBlendActive = selectedElement?.style?.mixBlendMode && selectedElement.style.mixBlendMode !== 'normal';

        return (
            <div className={styles.section}>
                <div
                    className={styles.container}
                    style={{ flexDirection: 'column' }}
                >
                    <div className={styles.row} style={{justifyContent: "space-between"}}>
                        Appearence
                        <div style={{ position: 'relative' }}>
                            <DropHalfIcon
                                className={`${styles.icon} ${styles.button}`}
                                style={{opacity: isBlendActive ? 1 : 0.5}}
                                weight={isBlendActive ? 'fill' : 'regular'}
                                onClick={() => setShowDropdown(!showDropdown)}
                            />
                            {showDropdown && (
                                <div
                                    className={styles.dropdownContainer}
                                    style={{
                                        left: 'unset', right: '100%',
                                        width: 'fit-content', maxHeight: '200px', overflowY: 'auto'
                                    }}
                                >
                                    {blendModes.map(mode => (
                                        <div
                                            key={mode}
                                            className={`${styles.dropdownOption} ${selectedElement?.style?.mixBlendMode === mode ? styles.active : ''}`}
                                            onClick={() => handleBlendModeChange(mode)}
                                        >
                                            {capitalize(mode)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
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
