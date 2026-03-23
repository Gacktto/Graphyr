import React, { useState } from 'react';
import type { ElementNode } from '../editor/TreeView/TreeView';
import { useCanvas } from '../../core/context/CanvasContext';
import styles from './Canvas.module.css';
import { MutableChart } from '../charts/MutableChart';

export type Handle = 'tl' | 't' | 'tr' | 'l' | 'r' | 'bl' | 'b' | 'br';

export interface ElementRendererProps {
    node: ElementNode;
    isRootFrame?: boolean;
    onResizeStart: (
        e: React.MouseEvent,
        handle: Handle,
        node: ElementNode
    ) => void;
    onDragStart: (e: React.MouseEvent) => void;
}

export const ElementRenderer: React.FC<ElementRendererProps> = React.memo(
    ({ node, isRootFrame = false, onResizeStart, onDragStart }) => {
        const {
            elementsRef,
            setElements,
            selectedIds,
            hoveredId,
            activeTool,
            updateElementProps
        } = useCanvas();

        const [isEditingTitle, setIsEditingTitle] = useState(false);

        const isSelected = selectedIds.includes(node.id);
        const isHovered = hoveredId === node.id;
        const isSingleSelection = selectedIds.length === 1;
        const showHandles = isSelected && isSingleSelection && activeTool === 'cursor';

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

        const isFrame = node.type === 'frame';
        
        let outlineStyle = 'none';
        if (isSelected) {
            outlineStyle = '2px solid #007aff';
        } else if (isHovered) {
            outlineStyle = '2px solid rgba(0, 122, 255, 0.4)';
        }

        const wrapperStyle: React.CSSProperties = {
            ...node.style,
            outline: outlineStyle,
            boxShadow: isFrame && !node.style?.boxShadow ? '0px 4px 15px rgba(0, 0, 0, 0.10)' : node.style?.boxShadow,
            boxSizing: 'border-box',
        };

        const handles: Handle[] = ['tl', 't', 'tr', 'l', 'r', 'bl', 'b', 'br'];

        const renderChildren = () =>
            node.children?.map((child) => (
                <ElementRenderer
                    key={child.id}
                    node={child}
                    isRootFrame={false}
                    onResizeStart={onResizeStart}
                    onDragStart={onDragStart}
                />
            ));

        const renderFrameTitle = () => {
            if (!isRootFrame) return null;
            return (
                <div 
                    className={styles.frameTitle} 
                    onDoubleClick={(e) => {
                        e.stopPropagation();
                        setIsEditingTitle(true);
                    }}
                >
                    {isEditingTitle ? (
                        <input
                            autoFocus
                            className={styles.frameTitleInput}
                            defaultValue={node.name}
                            onBlur={(e) => {
                                setIsEditingTitle(false);
                                updateElementProps(node.id, { name: e.target.value || 'Frame' });
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                        />
                    ) : (
                        node.name
                    )}
                </div>
            );
        };

        if (node.type.startsWith('chart')) {
            return (
                <div
                    ref={registerRef}
                    data-element-id={node.id}
                    data-canvas-element
                    onMouseDown={onDragStart}
                    style={wrapperStyle}
                >
                    {renderFrameTitle()}
                    <MutableChart 
                        data={node.data || []} 
                        chartProps={node.chartProps}
                    />

                    {showHandles && (
                        <>
                            {handles.map((handle) => (
                                <div
                                    key={handle}
                                    className={`${styles.resizeHandle} ${styles[`handle-${handle}`]}`}
                                    onMouseDown={(e) =>
                                        onResizeStart(e, handle, node)
                                    }
                                />
                            ))}
                        </>
                    )}
                </div>
            );
        }

        if (node.type === 'frame' || node.type === 'div') {
            return (
                <div
                    ref={registerRef}
                    data-element-id={node.id}
                    data-canvas-element
                    onMouseDown={onDragStart}
                    style={wrapperStyle}
                >
                    {renderFrameTitle()}
                    {renderChildren()}

                    {showHandles && (
                        <>
                            {handles.map((handle) => (
                                <div
                                    key={handle}
                                    className={`${styles.resizeHandle} ${styles[`handle-${handle}`]}`}
                                    onMouseDown={(e) =>
                                        onResizeStart(e, handle, node)
                                    }
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
                    style={wrapperStyle}
                    contentEditable={isSingleSelection && isSelected}
                    suppressContentEditableWarning={true}
                    onMouseDown={onDragStart}
                    onBlur={handleTextBlur}
                >
                    {renderFrameTitle()}
                    {node.name}
                    {showHandles && (
                        <>
                            {handles.map((handle) => (
                                <div
                                    key={handle}
                                    className={`${styles.resizeHandle} ${styles[`handle-${handle}`]}`}
                                    onMouseDown={(e) =>
                                        onResizeStart(e, handle, node)
                                    }
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
                    style={wrapperStyle}
                >
                    {node.name}
                </button>
            );
        }

        return null;
    }
);