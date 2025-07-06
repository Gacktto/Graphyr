import React, { useRef, useState, useEffect, useCallback } from 'react';
import styles from '../../styles/Canvas.module.css';
import { useCanvasTransform } from './useCanvasTransform';
import { ElementRenderer, type Handle } from '../Elements/renderElement';
import { useCanvas } from '../../context/CanvasContext';
import type { ElementNode } from '../TreeView/TreeView';

type DrawingState = {
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    parentId: string | null;
};

type ResizingState = {
    elementId: string;
    handle: Handle;
    startX: number;
    startY: number;
    originalStyle: {
        top: number;
        left: number;
        width: number;
        height: number;
        position?: React.CSSProperties['position'];
    };
};

type DraggingState = {
    elementId: string;
    startX: number;
    startY: number;
    originalLeft: number;
    originalTop: number;
    offsetX: number;
    offsetY: number;
};

export default function Canvas() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);

    const {
        elements,
        elementsRef,
        selectedId,
        setSelectedId,
        activeTool,
        setActiveTool,
        addElement,
        updateElementStyle,
        copySelectedElement,
        pasteElement,
        undo,
        redo
    } = useCanvas();

    const { scale, offset } = useCanvasTransform(
        canvasRef as React.RefObject<HTMLDivElement>,
        innerRef as React.RefObject<HTMLDivElement>
    );

    const [drawingState, setDrawingState] = useState<DrawingState | null>(null);
    const [resizingState, setResizingState] = useState<ResizingState | null>(null);
    const [draggingState, setDraggingState] = useState<DraggingState | null>(null);


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.target as HTMLElement).isContentEditable) return;

            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                e.preventDefault();
                copySelectedElement();
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                e.preventDefault();
                pasteElement();
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                redo();
            }

        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [copySelectedElement, pasteElement, undo, redo]);


    const getCoordsInWorld = useCallback(
        (e: MouseEvent | React.MouseEvent): { x: number; y: number } => {
            if (!canvasRef.current) return { x: 0, y: 0 };
            const canvasRect = canvasRef.current.getBoundingClientRect();
            return {
                x: (e.clientX - canvasRect.left - offset.x) / scale,
                y: (e.clientY - canvasRect.top - offset.y) / scale,
            };
        },
        [offset, scale]
    );

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (resizingState || activeTool === 'cursor' || e.button !== 0) {
            if((e.target as HTMLElement).dataset.canvasElement === undefined) {
                setSelectedId(null);
            }
            return;
        }

        const targetElement = (e.target as HTMLElement).closest(
            '[data-canvas-element]'
        );
        const parentId = targetElement
            ? targetElement.getAttribute('data-element-id')
            : '1';

        const { x, y } = getCoordsInWorld(e);
        setDrawingState({
            startX: x,
            startY: y,
            currentX: x,
            currentY: y,
            parentId,
        });
    };

    useEffect(() => {
        if (!drawingState) return;

        const handleWindowMouseMove = (e: MouseEvent) => {
            const { x, y } = getCoordsInWorld(e);
            setDrawingState((prev) =>
                prev ? { ...prev, currentX: x, currentY: y } : null
            );
        };

        const handleWindowMouseUp = (_e: MouseEvent) => {
            if (!drawingState || activeTool === 'cursor') return;
            const { startX, startY, currentX, currentY, parentId } =
                drawingState;
            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);

            if (width > 5 && height > 5) {
                const newElementStyle: React.CSSProperties = {
                    // left: `${Math.min(startX, currentX)}px`,
                    // top: `${Math.min(startY, currentY)}px`,
                    position: 'relative',
                    width: `${width}px`,
                    height: `${height}px`,
                };
                addElement(activeTool, { parentId, style: newElementStyle });
            }
            setDrawingState(null);
            setActiveTool('cursor');
        };

        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('mouseup', handleWindowMouseUp);
        };
    }, [drawingState, activeTool, addElement, getCoordsInWorld, setActiveTool]);

    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (activeTool === 'cursor') return;
        const { x, y } = getCoordsInWorld(e);
        const targetElement = (e.target as HTMLElement).closest(
            '[data-canvas-element]'
        );
        const parentId = targetElement
            ? targetElement.getAttribute('data-element-id')
            : '1';
        const newElementStyle: React.CSSProperties = {
            left: `${x}px`,
            top: `${y}px`,
        };
        addElement(activeTool, { parentId, style: newElementStyle });
        setActiveTool('cursor');
    };

    const getGhostStyle = (): React.CSSProperties => {
        if (!drawingState) return { display: 'none' };
        const { startX, startY, currentX, currentY } = drawingState;
        return {
            position: 'absolute',
            left: Math.min(startX, currentX),
            top: Math.min(startY, currentY),
            width: Math.abs(currentX - startX),
            height: Math.abs(currentY - startY),
            backgroundColor: 'rgba(0, 122, 255, 0.2)',
            border: '1px solid rgba(0, 122, 255, 0.8)',
            zIndex: '9999',
        };
    };

    const handleResizeStart = useCallback((e: React.MouseEvent, handle: Handle, node: ElementNode) => {
        e.stopPropagation();
        e.preventDefault();
        
        const domElement = elementsRef.current[node.id];

        if (!node.style || !domElement) return;

        const computedWidth = domElement.offsetWidth;
        const computedHeight = domElement.offsetHeight;

        setResizingState({
            elementId: node.id,
            handle,
            startX: e.clientX,
            startY: e.clientY,
            originalStyle: {
                top: parseFloat(node.style.top as string) || 0,
                left: parseFloat(node.style.left as string) || 0,
                width: computedWidth,
                height: computedHeight,
                position: node.style.position,
            }
        });
    }, [elementsRef]);

    const handleDragStart = useCallback((e: React.MouseEvent) => {
        if (activeTool !== 'cursor' || e.button !== 0) return;

        const target = e.target as HTMLElement;
        const wrapper = target.closest('[data-canvas-element]') as HTMLElement;
        if (!wrapper) return;

        const id = wrapper.dataset.elementId;
        if (!id) return;

        const node = elements.find((n) => n.id === id || n.children?.some(c => c.id === id));
        if (!node || !node.style) return;

        const computedStyle = window.getComputedStyle(wrapper);
        if (computedStyle.position === 'relative') return;

        const { x: mouseX, y: mouseY } = getCoordsInWorld(e);

        const rect = wrapper.getBoundingClientRect();
        const canvasRect = canvasRef.current!.getBoundingClientRect();

        const elementX = (rect.left - canvasRect.left - offset.x) / scale;
        const elementY = (rect.top - canvasRect.top - offset.y) / scale;

        const dx = mouseX - elementX;
        const dy = mouseY - elementY;

        setDraggingState({
            elementId: id,
            startX: mouseX,
            startY: mouseY,
            originalLeft: elementX,
            originalTop: elementY,
            offsetX: dx,
            offsetY: dy,
        });
    }, [activeTool, elements, getCoordsInWorld, offset, scale]);


    useEffect(() => {
        if (!draggingState) return;

        const handleMouseMove = (e: MouseEvent) => {
            const { x, y } = getCoordsInWorld(e);
            const dx = x - draggingState.startX;
            const dy = y - draggingState.startY;

            updateElementStyle(draggingState.elementId, {
                left: `${draggingState.originalLeft + dx}px`,
                top: `${draggingState.originalTop + dy}px`,
            });
        };

        const handleMouseUp = () => {
            setDraggingState(null);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingState, getCoordsInWorld, updateElementStyle]);



    useEffect(() => {
        if (!resizingState) return;

        const handleWindowMouseMove = (e: MouseEvent) => {
            const { handle, originalStyle, startX, startY, elementId } = resizingState;

            const dx = (e.clientX - startX) / scale;
            const dy = (e.clientY - startY) / scale;

            let { top, left, width, height } = originalStyle;

            if (handle.includes('b')) height = originalStyle.height + dy;
            if (handle.includes('t')) {
                height = originalStyle.height - dy;
                top = originalStyle.top + dy;
            }
            if (handle.includes('r')) width = originalStyle.width + dx;
            if (handle.includes('l')) {
                width = originalStyle.width - dx;
                left = originalStyle.left + dx;
            }
            
            const minSize = 10;
            if (width < minSize) {
                width = minSize;
                if (handle.includes('l')) left = originalStyle.left + originalStyle.width - minSize;
            }
            if (height < minSize) {
                height = minSize;
                if (handle.includes('t')) top = originalStyle.top + originalStyle.height - minSize;
            }

            const newStyle: React.CSSProperties = {};
            
            const isRelative = originalStyle.position === 'relative';

            if (handle.includes('l') || handle.includes('r')) {
                newStyle.width = `${width}px`;
            }
            if (handle.includes('t') || handle.includes('b')) {
                newStyle.height = `${height}px`;
            }

            if (!isRelative) {
                if (handle.includes('t')) {
                    newStyle.top = `${top}px`;
                }
                if (handle.includes('l')) {
                    newStyle.left = `${left}px`;
                }
            }
            
            updateElementStyle(elementId, newStyle);
        };

        const handleWindowMouseUp = () => {
            setResizingState(null);
        };

        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('mouseup', handleWindowMouseUp);
        };
    }, [resizingState, scale, updateElementStyle, getCoordsInWorld]);

    return (
        <div
            ref={canvasRef}
            className={`${styles.canvas} ${styles[activeTool]}`}
        >
            <div
                ref={innerRef}
                style={{
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                    transformOrigin: 'top left',
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                }}
                onMouseDown={handleMouseDown}
                onDoubleClick={handleDoubleClick}
            >
                {drawingState && <div style={getGhostStyle()} />}
                {elements.map((el) => (
                    <ElementRenderer key={el.id} node={el} onResizeStart={handleResizeStart} onDragStart={handleDragStart}/>
                ))}
            </div>
        </div>
    );
}
