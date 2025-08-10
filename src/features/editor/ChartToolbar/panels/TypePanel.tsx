import React, { useState } from 'react';
import { useCanvas } from '../../../../core/context/CanvasContext';
import type { ElementNode, ChartVariant } from '../../TreeView/TreeView';
import styles from '../../../shared/styles/Sidebar.module.css';
import panelStyles from '../ChartToolbar.module.css';
import { capitalize } from 'lodash';
import { CaretDownIcon } from '@phosphor-icons/react';

interface TypePanelProps {
    selectedElement: ElementNode;
}

export const TypePanel: React.FC<TypePanelProps> = ({ selectedElement }) => {
    const { updateElementChartProps } = useCanvas();
    const [showDropdown, setShowDropdown] = useState(false);

    const chartVariants: ChartVariant[] = ['bar', 'line', 'donut', 'pie'];
    const currentVariant = selectedElement.chartProps?.variant;

    return (
        <div>
            <div className={panelStyles.panelTitle}>Chart Type</div>
            <div className={panelStyles.panelContent}>
                <div
                    className={`${styles.groupInput} ${styles.dropdown}`}
                    onClick={() => setShowDropdown(!showDropdown)}
                >
                    <div className={styles.row}>
                        {capitalize(currentVariant || 'bar')}
                        <CaretDownIcon className={styles.icon} />
                    </div>
                    {showDropdown && (
                        <div className={styles.dropdownContainer}>
                            {chartVariants.map((variant) => (
                                <div
                                    key={variant}
                                    className={`${styles.dropdownOption} ${currentVariant === variant ? styles.active : ''}`}
                                    onClick={() => {
                                        updateElementChartProps(
                                            selectedElement.id,
                                            { variant }
                                        );
                                        setShowDropdown(false);
                                    }}
                                >
                                    {capitalize(variant)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};