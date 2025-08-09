import React from 'react';
import styles from '../styles/Sidebar.module.css';

interface ColorControlProps {
    label: string;
    property: keyof React.CSSProperties;
    value: string | undefined;
    onClick: (
        event: React.MouseEvent,
        property: keyof React.CSSProperties
    ) => void;
}

export const ColorControl: React.FC<ColorControlProps> = ({
    label,
    property,
    value,
    onClick,
}) => {
    const displayColor = value || 'transparent';

    return (
        <div className={styles.row}>
            <div className={`${styles.group} ${styles.fill}`}>
                <div className={styles.groupTitle}>{label}</div>
                <div
                    className={`${styles.groupInput} color-control-clickable`}
                    onClick={(e) => onClick(e, property)}
                >
                    <div
                        className={styles.inputLabel}
                        style={{ opacity: '100%' }}
                    >
                        <div
                            className={styles.currentColor}
                            style={{
                                backgroundColor: value ? displayColor : 'grey',
                            }}
                        ></div>
                    </div>
                    <div className="color-control-value">
                        {value ? String(value) : 'Not set'}
                    </div>
                </div>
            </div>
        </div>
    );
};
