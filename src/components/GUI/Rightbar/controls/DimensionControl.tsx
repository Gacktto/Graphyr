import React, { useState, useEffect } from 'react';
import styles from '../../../../styles/Sidebar.module.css';

type DimensionMode = 'Fixed' | 'Fill' | 'Hug';

const getDimensionMode = (value: string | number | undefined): DimensionMode => {
    if (value === '100%') return 'Fill';
    if (value === 'fit-content') return 'Hug';
    return 'Fixed';
};

interface DimensionControlProps {
    label: string;
    value: string | number | undefined;
    onValueChange: (newValue: string | undefined) => void;
    placeholder?: string;
}

export const DimensionControl: React.FC<DimensionControlProps> = ({
    label,
    value,
    onValueChange,
    placeholder
}) => {
    const [currentMode, setCurrentMode] = useState<DimensionMode>(getDimensionMode(value));
    const [inputValue, setInputValue] = useState(value || '');

    useEffect(() => {
        setInputValue(value || '');
        setCurrentMode(getDimensionMode(value));
    }, [value]);

    const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMode = e.target.value as DimensionMode;
        setCurrentMode(newMode);

        if (newMode === 'Fill') {
            onValueChange('100%');
        } else if (newMode === 'Hug') {
            onValueChange('fit-content');
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        setCurrentMode('Fixed');
    };

    const handleInputBlur = () => {
        const value = inputValue?.toString().trim();
        onValueChange(value || undefined);
    };


    return (
        <div className={styles.group} style={{ flexDirection: 'row', gap: '10px' }}>
            <div className={styles.groupInput}>
                <div className={styles.inputLabel}>{label}</div>
                <input
                    type="text"
                    className={styles.input}
                    value={inputValue}
                    placeholder={placeholder}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    disabled={currentMode !== 'Fixed'}
                    style={{
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                        borderRight: 'none',
                    }}
                />
            </div>
            <div className={`${styles.groupInput}`} style={{ flexShrink: 0, width: '80px' }}>
                <select
                    className={`${styles.input} ${styles.select}`}
                    value={currentMode}
                    onChange={handleModeChange}
                    style={{
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                    }}
                >
                    <option value="Fixed">Fixed</option>
                    <option value="Fill">Fill</option>
                    <option value="Hug">Hug</option>
                </select>
            </div>
        </div>
    );
};