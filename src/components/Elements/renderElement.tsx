import React from 'react';
import type { ElementNode } from '../TreeView/TreeView';
import { useCanvas } from '../../context/CanvasContext';
import styles from '../../styles/Canvas.module.css';

export type Handle = 'tl' | 't' | 'tr' | 'l' | 'r' | 'bl' | 'b' | 'br';

export interface ElementRendererProps {
    node: ElementNode;
    onResizeStart: (e: React.MouseEvent, handle: Handle, node: ElementNode) => void;
    onDragStart: (e: React.MouseEvent) => void;
}

export const ElementRenderer: React.FC<ElementRendererProps> = React.memo(
    ({ node, onResizeStart, onDragStart }) => {
        const {
            elementsRef,
            setElements,
            selectedId,
            setSelectedId,
            activeTool,
        } = useCanvas();

        const isSelected = node.id === selectedId;

        const handleClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (activeTool === 'cursor') {
                setSelectedId(node.id);
            }
        };

        const handleTextBlur = (e: React.FocusEvent<HTMLDivElement>) => {
            const newText = e.currentTarget.innerText;
            setElements((prev) => {
                const updateName = (nodes: ElementNode[]): ElementNode[] => {
                    return nodes.map((n) => {
                        if (n.id === node.id) {
                            return { ...n, name: newText };
                        }
                        if (n.children) {
                            return { ...n, children: updateName(n.children) };
                        }
                        return n;
                    });
                };
                return updateName(prev);
            });
        };

        const registerRef = (el: HTMLElement | null) => {
            if (el) elementsRef.current[node.id] = el;
        };

        const wrapperStyle: React.CSSProperties = {
            ...node.style,
            outline: isSelected ? '2px solid #007aff' : 'none',
            boxSizing: 'border-box',
        };
        
        const handles: Handle[] = ['tl', 't', 'tr', 'l', 'r', 'bl', 'b', 'br'];

        const renderChildren = () =>
            node.children?.map((child) => (
                <ElementRenderer key={child.id} node={child} onResizeStart={onResizeStart} onDragStart={onDragStart}/>
            ));

        if (node.type === 'frame' || node.type === 'div') {
            return (
                <div
                    ref={registerRef}
                    data-element-id={node.id}
                    data-canvas-element
                    onClick={handleClick}
                    onMouseDown={onDragStart}
                    style={wrapperStyle}
                >
                    {renderChildren()}

                    {isSelected && activeTool === 'cursor' && (
                        <>
                            {handles.map(handle => (
                                <div
                                    key={handle}
                                    className={`${styles.resizeHandle} ${styles[`handle-${handle}`]}`}
                                    onMouseDown={(e) => onResizeStart(e, handle, node)}
                                />
                            ))}
                        </>
                    )}
                </div>
            );
        }

        if (node.type === 'text') {
            return (
                <div
                    ref={registerRef}
                    data-element-id={node.id}
                    data-canvas-element
                    onClick={handleClick}
                    style={wrapperStyle}
                    contentEditable={isSelected}
                    suppressContentEditableWarning={true}
                    onMouseDown={onDragStart}
                    onBlur={handleTextBlur}
                >
                    {node.name}
                    {isSelected && activeTool === 'cursor' && (
                        <>
                            {handles.map(handle => (
                                <div
                                    key={handle}
                                    className={`${styles.resizeHandle} ${styles[`handle-${handle}`]}`}
                                    onMouseDown={(e) => onResizeStart(e, handle, node)}
                                />
                            ))}
                        </>
                    )}
                </div>
            );
        }

        if (node.type === 'button') {
            return (
                <button
                    ref={registerRef}
                    data-element-id={node.id}
                    data-canvas-element
                    onClick={handleClick}
                    style={wrapperStyle}
                >
                    {node.name}
                </button>
            )
        }

        return null; 
    }
);