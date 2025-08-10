import React, { useRef, useLayoutEffect, useEffect } from 'react';
import styles from './ChartToolbar.module.css';

interface PopoverProps {
    children: React.ReactNode;
    triggerRef: HTMLElement | null;
    onClose: () => void;
}

export const ChartToolbarPopover: React.FC<PopoverProps> = ({
    children,
    triggerRef,
    onClose,
}) => {
    const popoverRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (triggerRef && popoverRef.current) {
            const triggerRect = triggerRef.getBoundingClientRect();
            const popoverEl = popoverRef.current;
            popoverEl.style.top = `${triggerRect.top}px`;
            popoverEl.style.left = `${triggerRect.left - popoverEl.offsetWidth - 10}px`; 
        }
    }, [triggerRef]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                triggerRef &&
                !triggerRef.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose, triggerRef]);

    return (
        <div ref={popoverRef} className={styles.popover}>
            {children}
        </div>
    );
};