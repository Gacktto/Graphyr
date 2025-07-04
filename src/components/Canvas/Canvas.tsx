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
    };
};


export default function Canvas() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);

    const {
        elements,
        selectedId,
        setSelectedId,
        activeTool,
        setActiveTool,
        addElement,
        updateElementStyle,
    } = useCanvas();

    const { scale, offset } = useCanvasTransform(
        canvasRef as React.RefObject<HTMLDivElement>,
        innerRef as React.RefObject<HTMLDivElement>
    );

    const [drawingState, setDrawingState] = useState<DrawingState | null>(null);
    const [resizingState, setResizingState] = useState<ResizingState | null>(null);

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
        
        if (!node.style) return;

        setResizingState({
            elementId: node.id,
            handle,
            startX: e.clientX,
            startY: e.clientY,
            originalStyle: {
                top: parseFloat(node.style.top as string) || 0,
                left: parseFloat(node.style.left as string) || 0,
                width: parseFloat(node.style.width as string) || 0,
                height: parseFloat(node.style.height as string) || 0,
            }
        });
    }, []);

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
            
            // Garante um tamanho mínimo para não inverter o elemento
            const minSize = 10;
            if (width < minSize) {
                width = minSize;
                // Previne que 'left' continue mudando se a largura travar
                if (handle.includes('l')) left = originalStyle.left + originalStyle.width - minSize;
            }
            if (height < minSize) {
                height = minSize;
                // Previne que 'top' continue mudando se a altura travar
                if (handle.includes('t')) top = originalStyle.top + originalStyle.height - minSize;
            }

            updateElementStyle(elementId, { top: `${top}px`, left: `${left}px`, width: `${width}px`, height: `${height}px` });
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
    }, [resizingState, scale, updateElementStyle]);

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
                    <ElementRenderer key={el.id} node={el} onResizeStart={handleResizeStart}/>
                ))}
            </div>
        </div>
    );
}
