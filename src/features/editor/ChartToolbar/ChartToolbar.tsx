import React, { useState, useRef } from 'react';
import {
    ChartBarIcon as ChartBarIcon,
    PaintBrushIcon as PaintBrushIcon,
    TextAaIcon as TextAaIcon,
    ChartDonutIcon as DonutIcon,
    DatabaseIcon as DatabaseIcon, // <-- IMPORTAR NOVO ÍCONE
} from '@phosphor-icons/react';

import type { ElementNode } from '../TreeView/TreeView';
import styles from './ChartToolbar.module.css';

import { ChartToolbarPopover } from './ChartToolbarPopover';
import { TypePanel } from './panels/TypePanel';
import { DataStylePanel } from './panels/DataStylePanel';
import { AxisPanel } from './panels/AxisPanel';
import { PiePanel } from './panels/PiePanel';
import { DataPanel } from './panels/DataPanel'; 

interface ChartToolbarProps {
    selectedElement: ElementNode;
    onColorControlClick: (
        event: React.MouseEvent,
        property: string,
        onChange: (newColor: string) => void,
        currentValue?: string
    ) => void;
}

type PopoverId = 'type' | 'dataStyle' | 'axis' | 'pie' | 'data' | null; 

export const ChartToolbar: React.FC<ChartToolbarProps> = ({
    selectedElement,
    onColorControlClick,
}) => {
    const [activePopover, setActivePopover] = useState<PopoverId>(null);
    const iconRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const isBarOrLine =
        selectedElement.chartProps?.variant === 'bar' ||
        selectedElement.chartProps?.variant === 'line';

    const isPieOrDonut =
        selectedElement.chartProps?.variant === 'pie' ||
        selectedElement.chartProps?.variant === 'donut';

    const tools = [
        { id: 'type', icon: ChartBarIcon, title: 'Chart Type' },
        { id: 'data', icon: DatabaseIcon, title: 'Data Source' }, 
        { id: 'dataStyle', icon: PaintBrushIcon, title: 'Data Colors' },
        ...(isBarOrLine
            ? [{ id: 'axis', icon: TextAaIcon, title: 'Axis & Labels' }]
            : []),
        ...(isPieOrDonut
            ? [{ id: 'pie', icon: DonutIcon, title: 'Pie Options' }]
            : []),
    ];

    const handleIconClick = (id: PopoverId) => {
        setActivePopover((prev) => (prev === id ? null : id));
    };

    return (
        <div className={styles.chartToolbar}>
            {tools.map(({ id, icon: Icon, title }) => (
                <div
                    key={id}
                    title={title}
                    ref={(el) => (iconRefs.current[id] = el)}
                    className={`${styles.iconWrapper} ${activePopover === id ? styles.active : ''}`}
                    onClick={() => handleIconClick(id as PopoverId)}
                >
                    <Icon className={styles.icon} />
                </div>
            ))}

            {activePopover && (
                <ChartToolbarPopover
                    triggerRef={iconRefs.current[activePopover]}
                    onClose={() => setActivePopover(null)}
                >
                    {activePopover === 'type' && (
                        <TypePanel selectedElement={selectedElement} />
                    )}
                    {activePopover === 'data' && (
                        <DataPanel selectedElement={selectedElement} />
                    )}
                    {activePopover === 'dataStyle' && (
                        <DataStylePanel
                            selectedElement={selectedElement}
                            onColorControlClick={onColorControlClick}
                        />
                    )}
                    {activePopover === 'axis' && (
                        <AxisPanel
                            selectedElement={selectedElement}
                            onColorControlClick={onColorControlClick}
                        />
                    )}
                    {activePopover === 'pie' && (
                        <PiePanel
                            selectedElement={selectedElement}
                            onColorControlClick={onColorControlClick}
                        />
                    )}
                </ChartToolbarPopover>
            )}
        </div>
    );
};