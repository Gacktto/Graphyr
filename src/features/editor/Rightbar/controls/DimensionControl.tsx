import React, { useState, useEffect } from 'react';
import { CaretDownIcon } from '@phosphor-icons/react';
import styles from '../../../shared/styles/Sidebar.module.css';

type DimensionMode = 'Fixed' | 'Fill' | 'Hug';

const getDimensionMode = (
    value: string | number | undefined
): DimensionMode => {
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
    placeholder,
}) => {
    const [currentMode, setCurrentMode] = useState<DimensionMode>(
        getDimensionMode(value)
    );
    const [inputValue, setInputValue] = useState(value || '');
    const [showDropdown, setShowDropdown] = useState(false);
    const modes: DimensionMode[] = ['Fixed', 'Fill', 'Hug'];

    useEffect(() => {
        setInputValue(value || '');
        setCurrentMode(getDimensionMode(value));
    }, [value]);

    const handleModeSelect = (newMode: DimensionMode) => {
        setCurrentMode(newMode);
        setShowDropdown(false);

        if (newMode === 'Fill') {
            onValueChange('100%');
        } else if (newMode === 'Hug') {
            onValueChange('fit-content');
        } else if (newMode === 'Fixed') {
            if (inputValue) {
                onValueChange(inputValue.toString());
            }
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
        <div
            className={styles.group}
            style={{ flexDirection: 'row', gap: '10px' }}
        >
            <div
                className={`${styles.groupInput} ${styles.dropdown}`}
                onClick={() => {
                    setShowDropdown(!showDropdown);
                }}
            >
                <div className={styles.inputLabel}>{label}</div>
                <input
                    type="text"
                    className={styles.input}
                    value={currentMode === 'Fixed' ? inputValue : currentMode}
                    placeholder={placeholder}
                    onChange={handleInputChange}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    onBlur={handleInputBlur}
                    readOnly={currentMode !== 'Fixed'}
                />
                <CaretDownIcon className={styles.icon} />
                {showDropdown && (
                    <div className={styles.dropdownContainer}>
                        {modes.map((mode) => (
                            <div
                                key={mode}
                                className={`${styles.dropdownOption} ${currentMode === mode ? styles.active : ''}`}
                                onClick={() => handleModeSelect(mode)}
                            >
                                {mode}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
