import styles from '../../../../styles/Sidebar.module.css'

interface PaddingControlProps {
    side: 'paddingTop' | 'paddingBottom' | 'paddingLeft' | 'paddingRight';
    value: string | number | undefined;
    labelComponent: React.ReactNode;
    onPaddingChange: (side: PaddingControlProps['side'], value: string) => void;
}

export const PaddingControl: React.FC<PaddingControlProps> = ({ side, value, labelComponent, onPaddingChange }) => {
    const numericValue = value !== undefined ? String(value).replace('px', '') : '';

    return (
        <div className={styles.groupInput}>
            <div className={styles.inputLabel}>{labelComponent}</div>
            <input
                type="text"
                className={styles.input}
                value={numericValue}
                onChange={(e) => onPaddingChange(side, e.target.value)}
            />
        </div>
    );
};