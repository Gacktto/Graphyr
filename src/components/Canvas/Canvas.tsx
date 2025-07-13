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

type ActiveRect = {
    left: number;
    top: number;
    width: number;
    height: number;
    right: number;
    bottom: number;
    centerX: number;
    centerY: number;
};

type SnapCheck = {
    active: number;
    target: number;
    pos: keyof ActiveRect;
};

type GuideLine = {
    type: 'vertical' | 'horizontal';
    position: number;
};

function findNodeAndParent(
    nodes: ElementNode[],
    nodeId: string,
    parent: ElementNode | null = null
): { node: ElementNode; parent: ElementNode | null } | null {
    for (const n of nodes) {
        if (n.id === nodeId) {
            return { node: n, parent: parent };
        }
        if (n.children) {
            const found = findNodeAndParent(n.children, nodeId, n);
            if (found) {
                return found;
            }
        }
    }
    return null;
}

export default function Canvas() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const spacePressed = useRef(false);

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
        redo,
        deleteElement,
    } = useCanvas();

    const { scale, offset } = useCanvasTransform(
        canvasRef as React.RefObject<HTMLDivElement>,
        innerRef as React.RefObject<HTMLDivElement>
    );

    const [drawingState, setDrawingState] = useState<DrawingState | null>(null);
    const [resizingState, setResizingState] = useState<ResizingState | null>(
        null
    );
    const [draggingState, setDraggingState] = useState<DraggingState | null>(
        null
    );
    const [guideLines, setGuideLines] = useState<GuideLine[]>([]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.target as HTMLElement).isContentEditable) return;

            if (e.code === 'Space') {
                e.preventDefault();
                spacePressed.current = true;
            }

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

            if (
                (e.ctrlKey || e.metaKey) &&
                e.shiftKey &&
                e.key.toLowerCase() === 'z'
            ) {
                e.preventDefault();
                redo();
            }

            if (e.key === 'Delete' && selectedId) {
                e.preventDefault();
                deleteElement(selectedId);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                spacePressed.current = false;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
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
            if ((e.target as HTMLElement).dataset.canvasElement === undefined) {
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
                const findParentNode = (
                    nodes: ElementNode[],
                    id: string | null
                ): ElementNode | null => {
                    if (!id) return null;
                    for (const node of nodes) {
                        if (node.id === id) return node;
                        if (node.children) {
                            const found = findParentNode(node.children, id);
                            if (found) return found;
                        }
                    }
                    return null;
                };
                const parentNode = findParentNode(elements, parentId);

                let positionValue: 'relative' | 'absolute';
                let leftValue: string | number;
                let topValue: string | number;

                if (
                    parentNode?.style &&
                    (parentNode.style.display === 'flex' ||
                        parentNode.style.position === 'relative')
                ) {
                    positionValue = 'relative';
                    leftValue = '';
                    topValue = '';
                } else {
                    positionValue = 'absolute';
                    let worldLeft = Math.min(startX, currentX);
                    let worldTop = Math.min(startY, currentY);

                    if (parentId && parentId !== '1') {
                        const parentElement = elementsRef.current[parentId];
                        if (parentElement) {
                            const canvasRect =
                                canvasRef.current!.getBoundingClientRect();
                            const parentRect =
                                parentElement.getBoundingClientRect();
                            const parentX =
                                (parentRect.left - canvasRect.left - offset.x) /
                                scale;
                            const parentY =
                                (parentRect.top - canvasRect.top - offset.y) /
                                scale;

                            worldLeft -= parentX;
                            worldTop -= parentY;
                        }
                    }
                    leftValue = worldLeft;
                    topValue = worldTop;
                }

                const newElementStyle: React.CSSProperties = {
                    position: positionValue,
                    left:
                        typeof leftValue === 'number'
                            ? `${leftValue}px`
                            : leftValue,
                    top:
                        typeof topValue === 'number'
                            ? `${topValue}px`
                            : topValue,
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
    }, [
        drawingState,
        activeTool,
        addElement,
        getCoordsInWorld,
        setActiveTool,
        elements,
        elementsRef,
        offset,
        scale,
    ]);

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

    const handleResizeStart = useCallback(
        (e: React.MouseEvent, handle: Handle, node: ElementNode) => {
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
                },
            });
        },
        [elementsRef]
    );

    const handleDragStart = useCallback(
        (e: React.MouseEvent) => {
            if (spacePressed.current) return;
            if (activeTool !== 'cursor' || e.button !== 0) return;

            const target = e.target as HTMLElement;
            const wrapper = target.closest(
                '[data-canvas-element]'
            ) as HTMLElement;
            if (!wrapper) return;

            const id = wrapper.dataset.elementId;
            if (!id) return;

            const result = findNodeAndParent(elements, id);
            if (!result) return;

            const { node, parent } = result;

            if (parent && parent.style?.display === 'flex') {
                return;
            }

            const computedStyle = window.getComputedStyle(wrapper);
            if (computedStyle.position === 'relative') return;

            if (!node || !node.style) return;

            const { x: mouseX, y: mouseY } = getCoordsInWorld(e);

            const rect = wrapper.getBoundingClientRect();
            const canvasRect = canvasRef.current!.getBoundingClientRect();
            const elementX = (rect.left - canvasRect.left - offset.x) / scale;
            const elementY = (rect.top - canvasRect.top - offset.y) / scale;

            let parentX = 0;
            let parentY = 0;

            if (parent && parent.id !== '1') {
                const parentWrapper = elementsRef.current[parent.id];
                if (parentWrapper) {
                    const parentRect = parentWrapper.getBoundingClientRect();
                    parentX =
                        (parentRect.left - canvasRect.left - offset.x) / scale;
                    parentY =
                        (parentRect.top - canvasRect.top - offset.y) / scale;
                }
            }

            const relativeLeft = elementX - parentX;
            const relativeTop = elementY - parentY;

            setDraggingState({
                elementId: id,
                startX: mouseX,
                startY: mouseY,
                originalLeft: relativeLeft,
                originalTop: relativeTop,
                offsetX: mouseX - elementX,
                offsetY: mouseY - elementY,
            });
        },
        [activeTool, elements, elementsRef, getCoordsInWorld, offset, scale]
    );

    useEffect(() => {
        if (!draggingState) return;

        const handleMouseMove = (e: MouseEvent) => {
            const { elementId, originalLeft, originalTop, startX, startY } =
                draggingState;

            const { x, y } = getCoordsInWorld(e);
            const dx = x - startX;
            const dy = y - startY;

            let newLeft = originalLeft + dx;
            let newTop = originalTop + dy;

            const activeLines: GuideLine[] = [];
            const SNAP_THRESHOLD = 5 / scale;
            const activeElementNode = elementsRef.current[elementId];
            if (!activeElementNode) return;

            const activeRect: ActiveRect = {
                left: newLeft,
                top: newTop,
                width: activeElementNode.offsetWidth,
                height: activeElementNode.offsetHeight,
                right: newLeft + activeElementNode.offsetWidth,
                bottom: newTop + activeElementNode.offsetHeight,
                centerX: newLeft + activeElementNode.offsetWidth / 2,
                centerY: newTop + activeElementNode.offsetHeight / 2,
            };

            const otherElements = elements
                .flatMap((node) =>
                    node.id === '1' ? node.children || [] : [node]
                )
                .filter((el) => el.id !== elementId);

            for (const targetNode of otherElements) {
                const targetElement = elementsRef.current[targetNode.id];
                if (!targetElement) continue;

                const targetRect = {
                    left: targetElement.offsetLeft,
                    top: targetElement.offsetTop,
                    width: targetElement.offsetWidth,
                    height: targetElement.offsetHeight,
                    right: targetElement.offsetLeft + targetElement.offsetWidth,
                    bottom:
                        targetElement.offsetTop + targetElement.offsetHeight,
                    centerX:
                        targetElement.offsetLeft +
                        targetElement.offsetWidth / 2,
                    centerY:
                        targetElement.offsetTop +
                        targetElement.offsetHeight / 2,
                };

                const checks: SnapCheck[] = [
                    {
                        active: activeRect.left,
                        target: targetRect.left,
                        pos: 'left',
                    },
                    {
                        active: activeRect.left,
                        target: targetRect.right,
                        pos: 'left',
                    },
                    {
                        active: activeRect.left,
                        target: targetRect.centerX,
                        pos: 'left',
                    },
                    {
                        active: activeRect.right,
                        target: targetRect.left,
                        pos: 'right',
                    },
                    {
                        active: activeRect.right,
                        target: targetRect.right,
                        pos: 'right',
                    },
                    {
                        active: activeRect.right,
                        target: targetRect.centerX,
                        pos: 'right',
                    },
                    {
                        active: activeRect.centerX,
                        target: targetRect.left,
                        pos: 'centerX',
                    },
                    {
                        active: activeRect.centerX,
                        target: targetRect.right,
                        pos: 'centerX',
                    },
                    {
                        active: activeRect.centerX,
                        target: targetRect.centerX,
                        pos: 'centerX',
                    },

                    {
                        active: activeRect.top,
                        target: targetRect.top,
                        pos: 'top',
                    },
                    {
                        active: activeRect.top,
                        target: targetRect.bottom,
                        pos: 'top',
                    },
                    {
                        active: activeRect.top,
                        target: targetRect.centerY,
                        pos: 'top',
                    },
                    {
                        active: activeRect.bottom,
                        target: targetRect.top,
                        pos: 'bottom',
                    },
                    {
                        active: activeRect.bottom,
                        target: targetRect.bottom,
                        pos: 'bottom',
                    },
                    {
                        active: activeRect.bottom,
                        target: targetRect.centerY,
                        pos: 'bottom',
                    },
                    {
                        active: activeRect.centerY,
                        target: targetRect.top,
                        pos: 'centerY',
                    },
                    {
                        active: activeRect.centerY,
                        target: targetRect.bottom,
                        pos: 'centerY',
                    },
                    {
                        active: activeRect.centerY,
                        target: targetRect.centerY,
                        pos: 'centerY',
                    },
                ];

                for (const check of checks) {
                    if (
                        Math.abs(check.active - check.target) < SNAP_THRESHOLD
                    ) {
                        if (['left', 'right', 'centerX'].includes(check.pos)) {
                            newLeft =
                                check.target -
                                (activeRect[check.pos] - activeRect.left);
                            activeLines.push({
                                type: 'vertical',
                                position: check.target,
                            });
                        } else {
                            newTop =
                                check.target -
                                (activeRect[check.pos] - activeRect.top);
                            activeLines.push({
                                type: 'horizontal',
                                position: check.target,
                            });
                        }
                    }
                }
            }

            setGuideLines(activeLines);
            updateElementStyle(elementId, {
                left: `${newLeft}px`,
                top: `${newTop}px`,
                margin: '',
            });
        };

        const handleMouseUp = () => {
            setDraggingState(null);
            setGuideLines([]);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [
        draggingState,
        getCoordsInWorld,
        updateElementStyle,
        elements,
        elementsRef,
        scale,
    ]);

    useEffect(() => {
        if (!resizingState) return;

        const handleWindowMouseMove = (e: MouseEvent) => {
            const { handle, originalStyle, startX, startY, elementId } =
                resizingState;
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

            const activeLines: GuideLine[] = [];
            const SNAP_THRESHOLD = 5 / scale;

            const activeRect = {
                top,
                left,
                width,
                height,
                right: left + width,
                bottom: top + height,
                centerX: left + width / 2,
                centerY: top + height / 2,
            };

            const otherElements = elements
                .flatMap((node) =>
                    node.id === '1' ? node.children || [] : [node]
                )
                .filter((el) => el.id !== elementId);

            for (const targetNode of otherElements) {
                const targetElement = elementsRef.current[targetNode.id];
                if (!targetElement) continue;

                const targetRect = {
                    left: targetElement.offsetLeft,
                    top: targetElement.offsetTop,
                    right: targetElement.offsetLeft + targetElement.offsetWidth,
                    bottom:
                        targetElement.offsetTop + targetElement.offsetHeight,
                    centerX:
                        targetElement.offsetLeft +
                        targetElement.offsetWidth / 2,
                    centerY:
                        targetElement.offsetTop +
                        targetElement.offsetHeight / 2,
                };

                const verticalChecks = [
                    targetRect.left,
                    targetRect.centerX,
                    targetRect.right,
                ];
                const horizontalChecks = [
                    targetRect.top,
                    targetRect.centerY,
                    targetRect.bottom,
                ];

                if (handle.includes('r')) {
                    for (const targetPos of verticalChecks) {
                        if (
                            Math.abs(activeRect.right - targetPos) <
                            SNAP_THRESHOLD
                        ) {
                            width = targetPos - left;
                            activeLines.push({
                                type: 'vertical',
                                position: targetPos,
                            });
                            break;
                        }
                    }
                }
                if (handle.includes('l')) {
                    for (const targetPos of verticalChecks) {
                        if (
                            Math.abs(activeRect.left - targetPos) <
                            SNAP_THRESHOLD
                        ) {
                            const originalRight =
                                originalStyle.left + originalStyle.width;
                            left = targetPos;
                            width = originalRight - left;
                            activeLines.push({
                                type: 'vertical',
                                position: targetPos,
                            });
                            break;
                        }
                    }
                }

                if (handle.includes('b')) {
                    for (const targetPos of horizontalChecks) {
                        if (
                            Math.abs(activeRect.bottom - targetPos) <
                            SNAP_THRESHOLD
                        ) {
                            height = targetPos - top;
                            activeLines.push({
                                type: 'horizontal',
                                position: targetPos,
                            });
                            break;
                        }
                    }
                }
                if (handle.includes('t')) {
                    for (const targetPos of horizontalChecks) {
                        if (
                            Math.abs(activeRect.top - targetPos) <
                            SNAP_THRESHOLD
                        ) {
                            const originalBottom =
                                originalStyle.top + originalStyle.height;
                            top = targetPos;
                            height = originalBottom - top;
                            activeLines.push({
                                type: 'horizontal',
                                position: targetPos,
                            });
                            break;
                        }
                    }
                }
            }

            const minSize = 10;
            if (width < minSize) {
                if (handle.includes('l'))
                    left = originalStyle.left + originalStyle.width - minSize;
                width = minSize;
            }
            if (height < minSize) {
                if (handle.includes('t'))
                    top = originalStyle.top + originalStyle.height - minSize;
                height = minSize;
            }

            const newStyle: React.CSSProperties = {};
            const isRelative = originalStyle.position === 'relative';

            if (handle.includes('l') || handle.includes('r'))
                newStyle.width = `${width}px`;
            if (handle.includes('t') || handle.includes('b'))
                newStyle.height = `${height}px`;

            if (!isRelative) {
                if (handle.includes('t')) newStyle.top = `${top}px`;
                if (handle.includes('l')) newStyle.left = `${left}px`;
            }

            setGuideLines(activeLines);
            updateElementStyle(elementId, newStyle);
        };

        const handleWindowMouseUp = () => {
            setResizingState(null);
            setGuideLines([]);
        };

        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('mouseup', handleWindowMouseUp);
        };
    }, [
        resizingState,
        scale,
        updateElementStyle,
        getCoordsInWorld,
        elements,
        elementsRef,
    ]);

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
                {guideLines.map((line, index) => (
                    <div
                        key={`guide-${index}`}
                        style={{
                            position: 'absolute',
                            backgroundColor: '#FF0000',
                            ...(line.type === 'vertical'
                                ? {
                                      left: line.position,
                                      top: 0,
                                      width: '1px',
                                      height: '100%',
                                  }
                                : {
                                      top: line.position,
                                      left: 0,
                                      height: '1px',
                                      width: '100%',
                                  }),
                            zIndex: 9998,
                        }}
                    />
                ))}

                {elements.map((el) => (
                    <ElementRenderer
                        key={el.id}
                        node={el}
                        onResizeStart={handleResizeStart}
                        onDragStart={handleDragStart}
                    />
                ))}
            </div>
        </div>
    );
}
