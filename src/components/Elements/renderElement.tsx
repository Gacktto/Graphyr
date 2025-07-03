import React from 'react';
import type { ElementNode } from '../TreeView/TreeView';
import { useCanvas } from '../../context/CanvasContext';

export interface ElementRendererProps {
    node: ElementNode;
}

export const ElementRenderer: React.FC<ElementRendererProps> = React.memo(
    ({ node }) => {
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

        const commonStyle: React.CSSProperties = {
            outline: isSelected ? '2px solid #007aff' : 'none',
            outlineOffset: isSelected ? '2px' : '0px',
        };

        const finalStyle = { ...commonStyle, ...node.style };

        const renderChildren = () =>
            node.children?.map((child) => (
                <ElementRenderer key={child.id} node={child} />
            ));

        switch (node.type) {
            case 'frame':
                const frameStyle = {
                    ...finalStyle,
                    width: node.style?.width || '1300px',
                    minHeight: node.style?.minHeight || '800px',
                    backgroundColor: node.style?.backgroundColor || '#fff',
                    position: 'relative',
                };
                return (
                    <div
                        key={node.id}
                        ref={registerRef}
                        data-element-id={node.id}
                        data-canvas-element
                        onClick={handleClick}
                        style={frameStyle}
                    >
                        {renderChildren()}
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
                        style={finalStyle}
                    >
                        {renderChildren()}
                    </div>
                );
            case 'text':
                return (
                    <div
                        key={node.id}
                        ref={registerRef}
                        data-element-id={node.id}
                        data-canvas-element
                        onClick={handleClick}
                        style={finalStyle}
                        contentEditable={isSelected}
                        suppressContentEditableWarning={true}
                        onBlur={handleTextBlur}
                    >
                        {node.name}
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
                        style={finalStyle}
                    >
                        {node.name}
                    </button>
                );
            default:
                return null;
        }
    }
);
