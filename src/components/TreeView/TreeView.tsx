import { useState, useRef, type JSX } from 'react';
import { useCanvas } from '../../context/CanvasContext';
import styles from '../../styles/Treeview.module.css';
import { SquareIcon, TextTIcon, BoundingBoxIcon } from '@phosphor-icons/react';

export type ChartVariant = 'bar' | 'pie' | 'donut' | 'line' | 'barHorizontal';

export interface ChartOptions {
    showXAxis?: boolean;
    showYAxis?: boolean;
    xAxisColor?: string;
    yAxisColor?: string;
    colorScheme?: string[];
    barColor?: string;
    lineColor?: string;
    dotColor?: string;
    xTickStrokeColor?: string;
    yTickStrokeColor?: string;
    xTickLabelColor?: string;
    yTickLabelColor?: string;
    labelKey?: string;
    valueKey?: string;
    pieLabelPosition?: 'inside' | 'outside';
    pieLabelColor?: string;
    axisLabelFontSize?: number;
}

export type ElementNode = {
    id: string;
    type: string;
    name: string;
    children?: ElementNode[];
    style?: React.CSSProperties;
    data?: any[];
    chartProps?: {
        variant: ChartVariant;
        options?: ChartOptions; 
    };
};

type TreeViewProps = {
    elements: ElementNode[];
    selectedId: string | null;
    onSelect: (id: string) => void;
};

const NodeIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'text':
            return (
                <TextTIcon weight="fill" size={15} color="rgb(158, 2, 96)" />
            );
        case 'frame':
            return (
                <BoundingBoxIcon
                    weight="fill"
                    size={15}
                    color="rgb(100, 100, 100)"
                />
            );
        default:
            return (
                <SquareIcon weight="fill" size={15} color="rgb(2, 96, 158)" />
            );
    }
};

export default function TreeView({
    elements,
    selectedId,
    onSelect,
}: TreeViewProps) {
    const { moveElement } = useCanvas();
    const dragIndicator = useRef<{
        id: string;
        position: 'top' | 'bottom' | 'middle';
    } | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, node: ElementNode) => {
        e.dataTransfer.setData(
            'application/json',
            JSON.stringify({ id: node.id })
        );
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => {
            (e.target as HTMLElement).style.opacity = '0.5';
        }, 0);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        (e.target as HTMLElement).style.opacity = '1';
        dragIndicator.current = null;
        setDragOverId(null);
    };

    const handleDragOver = (e: React.DragEvent, node: ElementNode) => {
        e.preventDefault();
        e.stopPropagation();

        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.height;
        let position: 'top' | 'bottom' | 'middle' = 'middle';

        if (node.type === 'frame') {
            position = 'middle';
        } else if (y < height * 0.25) {
            position = 'top';
        } else if (y > height * 0.75) {
            position = 'bottom';
        }

        dragIndicator.current = { id: node.id, position };
        setDragOverId(node.id);
    };

    const handleDrop = (e: React.DragEvent, targetNode: ElementNode | null) => {
        e.preventDefault();
        e.stopPropagation();

        const draggedData = JSON.parse(
            e.dataTransfer.getData('application/json')
        );
        const draggedId = draggedData.id;

        const dropTargetInfo = dragIndicator.current;
        const targetId = (targetNode ? dropTargetInfo?.id : null) as string;

        if (targetId && draggedId === targetId) return;

        let position: 'before' | 'after' | 'inside' = 'inside';
        if (dropTargetInfo?.position === 'top') position = 'before';
        if (dropTargetInfo?.position === 'bottom') position = 'after';

        moveElement({ draggedId, targetId, position });
    };

    const renderNode = (node: ElementNode, depth = 0): JSX.Element => {
        const isSelected = node.id === selectedId;
        const isDraggingOver = dragOverId === node.id;
        const indicatorPosition = isDraggingOver
            ? dragIndicator.current?.position
            : null;

        return (
            <div key={node.id}>
                <div
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, node)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, node)}
                    onDrop={(e) => handleDrop(e, node)}
                    onDragLeave={() => setDragOverId(null)}
                    className={`${styles.node} ${isSelected ? styles.active : ''} ${isDraggingOver ? styles[indicatorPosition!] : ''}`}
                    style={{ paddingLeft: depth * 20 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(node.id);
                    }}
                >
                    <div className={styles.line}>
                        <NodeIcon type={node.type} />
                        <span className={styles.nodeName}>{node.name}</span>
                    </div>
                </div>
                {node.children && node.children.length > 0 && (
                    <div className={styles.children}>
                        {node.children.map((child) =>
                            renderNode(child, depth + 1)
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            className={styles.treeview}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, null)}
        >
            {elements.map((el) => renderNode(el))}
        </div>
    );
}
