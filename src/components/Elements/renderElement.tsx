import React, { type JSX } from 'react';
import type { ElementNode } from '../TreeView/TreeView';
import { useCanvas } from '../../context/CanvasContext';

export function renderElement(
    node: ElementNode,
    selectedId: string | null,
    onSelect: (id: string) => void
): JSX.Element | null {
    const { elementsRef } = useCanvas(); // importa o ref

    const isSelected = node.id === selectedId;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(node.id);
    };

    const registerRef = (el: HTMLElement | null) => {
        if (el) {
            elementsRef.current[node.id] = el;
        }
    };

    const commonStyle: React.CSSProperties = {
        outline: isSelected ? '2px solid #007aff' : 'none',
    };

    switch (node.type) {
        case 'frame':
            return (
                <div
                    key={node.id}
                    ref={registerRef}
                    data-element-id={node.id}
                    data-canvas-element
                    onClick={handleClick}
                    style={{
                        outline: isSelected ? '2px solid #007aff' : 'none',
                        margin: '0 auto',
                        width: node.style?.width || '1300px',
                        minHeight: 600,
                        backgroundColor: '#fff',
                        position: 'relative',
                        ...node.style,
                    }}
                >
                    {node.children?.map((child) =>
                        renderElement(child, selectedId, onSelect)
                    )}
                </div>
            );

        case 'div':
            return (
                <div
                    key={node.id}
                    ref={registerRef}
                    data-element-id={node.id}
                    data-canvas-element
                    onClick={handleClick}
                    style={{
                        ...commonStyle,
                        backgroundColor: node.style?.backgroundColor || 'red',
                        width: node.style?.width || 200,
                        display: node.style?.display || 'flex',
                        position: node.style?.position || 'absolute',
                        height: node.style?.height || 200,
                        ...node.style,
                    }}
                >
                    {node.children?.map((child) =>
                        renderElement(child, selectedId, onSelect)
                    )}
                </div>
            );

        case 'button':
            return (
                <button
                    key={node.id}
                    ref={registerRef}
                    data-element-id={node.id}
                    data-canvas-element
                    onClick={handleClick}
                    style={{
                        ...commonStyle,
                        backgroundColor:
                            node.style?.backgroundColor || '#007aff',
                        color: node.style?.color || '#fff',
                        width: node.style?.width || 'fit-content',
                        padding: node.style?.padding || 0,
                        ...node.style,
                    }}
                >
                    {node.name}
                </button>
            );

        default:
            return null;
    }
}
