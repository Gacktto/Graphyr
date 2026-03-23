import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import styles from './Canvas.module.css';
import { useCanvasTransform } from './useCanvasTransform';
import { ElementRenderer, type Handle } from './renderElement';
import { useCanvas } from '../../core/context/CanvasContext';
import type { ElementNode } from '../editor/TreeView/TreeView';
import { produce } from 'immer';

type DrawingState = { startX: number; startY: number; currentX: number; currentY: number; parentId: string | null; };
type ResizingState = { elementId: string; handle: Handle; startX: number; startY: number; originalStyle: { top: number; left: number; width: number; height: number; position?: React.CSSProperties['position']; }; originalWorldBox: { left: number; top: number; right: number; bottom: number; width: number; height: number; }; snapTargets: { id: string; left: number; top: number; right: number; bottom: number; centerX: number; centerY: number; }[]; };
type SelectionBoxState = { startX: number; startY: number; currentX: number; currentY: number; };
type DraggingState = { 
    items: { id: string; originalLeft: number; originalTop: number; }[]; 
    startX: number; startY: number; 
    selectionWorldBox: { left: number, top: number, right: number, bottom: number, width: number, height: number, centerX: number, centerY: number };
    snapTargets: { id: string, left: number, top: number, right: number, bottom: number, centerX: number, centerY: number }[];
};
type ActiveRect = { left: number; top: number; width: number; height: number; right: number; bottom: number; centerX: number; centerY: number; };
type GuideLine = { type: 'vertical' | 'horizontal'; position: number; };

function findNodeAndParent(nodes: ElementNode[], nodeId: string, parent: ElementNode | null = null): { node: ElementNode; parent: ElementNode | null } | null {
    for (const n of nodes) {
        if (n.id === nodeId) return { node: n, parent };
        if (n.children) {
            const found = findNodeAndParent(n.children, nodeId, n);
            if (found) return found;
        }
    }
    return null;
}

function getElementPath(nodes: ElementNode[], targetId: string, currentPath: ElementNode[] = []): ElementNode[] | null {
    for (const node of nodes) {
        const path = [...currentPath, node];
        if (node.id === targetId) return path;
        if (node.children) {
            const found = getElementPath(node.children, targetId, path);
            if (found) return found;
        }
    }
    return null;
}

function getSelectableTarget(
    elements: ElementNode[],
    selectedIds: string[],
    rawId: string,
    detail: number = 1,
    draggingSelected: boolean = false
): string {
    if (!rawId || rawId === 'root') return rawId;
    if (draggingSelected && selectedIds.includes(rawId)) return rawId;

    const path = getElementPath(elements, rawId);
    if (!path) return rawId;

    let contextIndex = -1;
    if (selectedIds.length > 0) {
        const refPath = getElementPath(elements, selectedIds[selectedIds.length - 1]);
        if (refPath && refPath.length >= 2) {
            const activeContextId = refPath[refPath.length - 2].id;
            contextIndex = path.findIndex(n => n.id === activeContextId);
        }
    }

    if (contextIndex === -1) {
        contextIndex = path.findIndex(n => n.type === 'frame' && path[path.indexOf(n) - 1]?.id === 'root');
        if (contextIndex === -1) contextIndex = 0;
    }

    const targetIndex = Math.min(contextIndex + detail, path.length - 1);
    return path[targetIndex].id;
}

export default function Canvas() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const spacePressed = useRef(false);
    const hasDragged = useRef(false);

    const {
        elements, elementsRef, selectedIds, setSelectedIds, hoveredId, setHoveredId,
        activeTool, setActiveTool, addElement, updateElementStyle, copySelectedElement, pasteElement,
        undo, redo, deleteElement, startInteraction, endInteraction, reparentElements, setElements,
        groupElements, ungroupElements,
    } = useCanvas();

    const { scale, offset } = useCanvasTransform(canvasRef as React.RefObject<HTMLDivElement>, innerRef as React.RefObject<HTMLDivElement>);

    const [drawingState, setDrawingState] = useState<DrawingState | null>(null);
    const [resizingState, setResizingState] = useState<ResizingState | null>(null);
    const [draggingState, setDraggingState] = useState<DraggingState | null>(null);
    const [selectionBox, setSelectionBox] = useState<SelectionBoxState | null>(null);
    const [guideLines, setGuideLines] = useState<GuideLine[]>([]);
    const [boundingBox, setBoundingBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.target as HTMLElement).isContentEditable || (e.target as HTMLElement).tagName === 'INPUT') return;
            if (e.code === 'Space') { e.preventDefault(); spacePressed.current = true; }
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') { e.preventDefault(); copySelectedElement(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') { e.preventDefault(); pasteElement(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') { e.preventDefault(); redo(); }
            if (e.key === 'Delete' && selectedIds.length > 0) { e.preventDefault(); selectedIds.forEach((id) => deleteElement(id)); }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g' && !e.shiftKey) { e.preventDefault(); groupElements(); }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'g') { e.preventDefault(); ungroupElements(); }
        };
        const handleKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); spacePressed.current = false; } };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
    }, [copySelectedElement, pasteElement, undo, redo, selectedIds, deleteElement, groupElements, ungroupElements]);

    const getCoordsInWorld = useCallback((e: MouseEvent | React.MouseEvent): { x: number; y: number } => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const canvasRect = canvasRef.current.getBoundingClientRect();
        return { x: (e.clientX - canvasRect.left - offset.x) / scale, y: (e.clientY - canvasRect.top - offset.y) / scale };
    }, [offset, scale]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (resizingState || e.button !== 0) return;
        hasDragged.current = false;

        const targetElement = (e.target as HTMLElement).closest('[data-canvas-element]');
        const clickedId = targetElement ? targetElement.getAttribute('data-element-id') : null;
        const isBackgroundOrRoot = !clickedId || clickedId === 'root';

        if (activeTool === 'cursor' && isBackgroundOrRoot) {
            const { x, y } = getCoordsInWorld(e);
            setSelectionBox({ startX: x, startY: y, currentX: x, currentY: y });
            if (!e.shiftKey) setSelectedIds([]);
            return;
        }

        if (activeTool !== 'cursor') {
            let finalParentId = 'root';
            if (clickedId && clickedId !== 'root') {
                const nodeInfo = findNodeAndParent(elements, clickedId);
                if (nodeInfo?.node.type === 'frame' || nodeInfo?.node.type === 'div') {
                    finalParentId = clickedId;
                } else if (nodeInfo?.parent && nodeInfo.parent.id !== 'root') {
                    finalParentId = nodeInfo.parent.id;
                }
            }
            const { x, y } = getCoordsInWorld(e);
            setDrawingState({ startX: x, startY: y, currentX: x, currentY: y, parentId: finalParentId });
        }
    };

    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (drawingState || resizingState || draggingState || selectionBox || spacePressed.current) {
                if (hoveredId) setHoveredId(null);
                return;
            }
            const target = e.target as HTMLElement;
            const wrapper = target.closest('[data-canvas-element]') as HTMLElement;
            const rawId = wrapper?.dataset.elementId || 'root';

            if (rawId === 'root') {
                if (hoveredId !== null) setHoveredId(null);
            } else {
                const selectable = getSelectableTarget(elements, selectedIds, rawId, 1, false);
                if (hoveredId !== selectable) setHoveredId(selectable);
            }
        };
        window.addEventListener('mousemove', handleGlobalMouseMove);
        return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
    }, [drawingState, resizingState, draggingState, selectionBox, elements, selectedIds, hoveredId, setHoveredId]);

    useEffect(() => {
        if (!selectionBox) return;

        const handleWindowMouseMove = (e: MouseEvent) => {
            hasDragged.current = true;
            const { x, y } = getCoordsInWorld(e);
            setSelectionBox((prev) => prev ? { ...prev, currentX: x, currentY: y } : null);

            const boxLeft = Math.min(selectionBox.startX, x);
            const boxRight = Math.max(selectionBox.startX, x);
            const boxTop = Math.min(selectionBox.startY, y);
            const boxBottom = Math.max(selectionBox.startY, y);

            let intersectingIds: string[] = [];
            const canvasRect = canvasRef.current!.getBoundingClientRect();

            Object.entries(elementsRef.current).forEach(([id, el]) => {
                if (!el || id === 'root') return;
                const rect = el.getBoundingClientRect();
                const elLeft = (rect.left - canvasRect.left - offset.x) / scale;
                const elTop = (rect.top - canvasRect.top - offset.y) / scale;
                const elRight = elLeft + (rect.width / scale);
                const elBottom = elTop + (rect.height / scale);

                if (boxLeft < elRight && boxRight > elLeft && boxTop < elBottom && boxBottom > elTop) {
                    intersectingIds.push(id);
                }
            });

            const filteredIds = intersectingIds.filter((id) => {
                const domEl = elementsRef.current[id];
                return !intersectingIds.some(otherId => {
                    if (otherId === id) return false;
                    const otherDom = elementsRef.current[otherId];
                    return otherDom?.contains(domEl);
                });
            });
            setSelectedIds(filteredIds);
        };

        const handleWindowMouseUp = () => {
            setSelectionBox(null);
            setTimeout(() => { hasDragged.current = false; }, 50);
        };

        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);
        return () => { window.removeEventListener('mousemove', handleWindowMouseMove); window.removeEventListener('mouseup', handleWindowMouseUp); };
    }, [selectionBox?.startX, selectionBox?.startY, getCoordsInWorld, elementsRef, offset, scale, setSelectedIds]);

    useEffect(() => {
        if (!drawingState) return;

        const handleWindowMouseMove = (e: MouseEvent) => {
            hasDragged.current = true;
            const { x, y } = getCoordsInWorld(e);
            setDrawingState((prev) => prev ? { ...prev, currentX: x, currentY: y } : null);
        };

        const handleWindowMouseUp = (_e: MouseEvent) => {
            if (!drawingState || activeTool === 'cursor') return;
            const { startX, startY, currentX, currentY, parentId } = drawingState;
            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);

            if (width > 5 && height > 5) {
                const parentNode = findNodeAndParent(elements, parentId || 'root')?.node;
                let positionValue: 'relative' | 'absolute' = 'absolute';
                let leftValue: string | number = Math.min(startX, currentX);
                let topValue: string | number = Math.min(startY, currentY);

                if (parentNode?.style && (parentNode.style.display === 'flex' || parentNode.style.position === 'relative')) {
                    positionValue = 'relative';
                    leftValue = ''; topValue = '';
                } else if (parentId && parentId !== 'root') {
                    const parentElement = elementsRef.current[parentId];
                    if (parentElement) {
                        const canvasRect = canvasRef.current!.getBoundingClientRect();
                        const parentRect = parentElement.getBoundingClientRect();
                        const parentX = (parentRect.left - canvasRect.left - offset.x) / scale;
                        const parentY = (parentRect.top - canvasRect.top - offset.y) / scale;
                        leftValue -= parentX;
                        topValue -= parentY;
                    }
                }

                addElement(activeTool, { parentId, style: { position: positionValue, left: typeof leftValue === 'number' ? `${Math.round(leftValue)}px` : leftValue, top: typeof topValue === 'number' ? `${Math.round(topValue)}px` : topValue, width: `${Math.round(width)}px`, height: `${Math.round(height)}px` } });
            }
            setDrawingState(null);
            setActiveTool('cursor');
            setTimeout(() => { hasDragged.current = false; }, 50);
        };

        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);
        return () => { window.removeEventListener('mousemove', handleWindowMouseMove); window.removeEventListener('mouseup', handleWindowMouseUp); };
    }, [drawingState, activeTool, addElement, getCoordsInWorld, setActiveTool, elements, elementsRef, offset, scale]);

    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (activeTool === 'cursor') return;
        const { x, y } = getCoordsInWorld(e);
        const targetElement = (e.target as HTMLElement).closest('[data-canvas-element]');
        const parentId = targetElement ? targetElement.getAttribute('data-element-id') : 'root';
        addElement(activeTool, { parentId, style: { left: `${Math.round(x)}px`, top: `${Math.round(y)}px` } });
        setActiveTool('cursor');
    };

    const handleResizeStart = useCallback(
        (e: React.MouseEvent, handle: Handle, node: ElementNode) => {
            e.stopPropagation();
            e.preventDefault();
            hasDragged.current = false;
            const domElement = elementsRef.current[node.id];
            if (!node.style || !domElement) return;

            const canvasRect = canvasRef.current!.getBoundingClientRect();
            const rect = domElement.getBoundingClientRect();
            const worldLeft = (rect.left - canvasRect.left - offset.x) / scale;
            const worldTop = (rect.top - canvasRect.top - offset.y) / scale;
            const worldWidth = rect.width / scale;
            const worldHeight = rect.height / scale;

            const snapTargets: typeof draggingState.snapTargets = [];
            const nodeInfo = findNodeAndParent(elements, node.id);
            const parentNode = nodeInfo?.parent || elements[0];

            const addSnapTarget = (targetNode: ElementNode) => {
                if (targetNode.id === node.id || targetNode.id === 'root') return;
                const dom = elementsRef.current[targetNode.id];
                if (dom) {
                    const tRect = dom.getBoundingClientRect();
                    const sLeft = (tRect.left - canvasRect.left - offset.x) / scale;
                    const sTop = (tRect.top - canvasRect.top - offset.y) / scale;
                    const sWidth = tRect.width / scale;
                    const sHeight = tRect.height / scale;
                    snapTargets.push({ id: targetNode.id, left: sLeft, top: sTop, right: sLeft + sWidth, bottom: sTop + sHeight, centerX: sLeft + sWidth / 2, centerY: sTop + sHeight / 2 });
                }
            };
            if (parentNode.id !== 'root') addSnapTarget(parentNode);
            if (parentNode.children) parentNode.children.forEach(addSnapTarget);

            startInteraction();
            setResizingState({
                elementId: node.id, handle, startX: e.clientX, startY: e.clientY,
                originalStyle: { top: parseFloat(node.style.top as string) || 0, left: parseFloat(node.style.left as string) || 0, width: domElement.offsetWidth, height: domElement.offsetHeight, position: node.style.position },
                originalWorldBox: { left: worldLeft, top: worldTop, width: worldWidth, height: worldHeight, right: worldLeft + worldWidth, bottom: worldTop + worldHeight },
                snapTargets
            });
        },
        [elementsRef, startInteraction, elements, offset, scale]
    );

    const handleDragStart = useCallback(
        (e: React.MouseEvent) => {
            if (activeTool !== 'cursor') return; 
            e.stopPropagation();

            if (spacePressed.current || e.button !== 0) return;
            hasDragged.current = false;

            const target = e.target as HTMLElement;
            const wrapper = target.closest('[data-canvas-element]') as HTMLElement;
            if (!wrapper) return;

            const rawId = wrapper.dataset.elementId!;
            if (!rawId || rawId === 'root') return;

            const targetId = getSelectableTarget(elements, selectedIds, rawId, e.detail, true);

            let itemsToDrag = selectedIds;
            if (e.shiftKey) {
                if (selectedIds.includes(targetId)) {
                    itemsToDrag = selectedIds.filter(sId => sId !== targetId);
                } else {
                    itemsToDrag = [...selectedIds, targetId].filter(sId => {
                        if (sId === targetId) return true;
                        const domA = elementsRef.current[targetId];
                        const domB = elementsRef.current[sId];
                        if (domA && domB) {
                            if (domA.contains(domB) || domB.contains(domA)) return false;
                        }
                        return true;
                    });
                }
                setSelectedIds(itemsToDrag);
                if (!itemsToDrag.includes(targetId)) return;
            } else {
                if (!selectedIds.includes(targetId)) {
                    itemsToDrag = [targetId];
                    setSelectedIds(itemsToDrag);
                }
            }

            const { x: mouseX, y: mouseY } = getCoordsInWorld(e);
            
            const canvasRect = canvasRef.current!.getBoundingClientRect();
            const snapTargets: typeof draggingState.snapTargets = [];
            const firstDragId = itemsToDrag[0];
            const parentInfo = findNodeAndParent(elements, firstDragId);
            const parentNode = parentInfo?.parent || elements[0]; 

            const addSnapTarget = (targetNode: ElementNode) => {
                if (itemsToDrag.includes(targetNode.id) || targetNode.id === 'root') return;
                const dom = elementsRef.current[targetNode.id];
                if (dom) {
                    const tRect = dom.getBoundingClientRect();
                    const sLeft = (tRect.left - canvasRect.left - offset.x) / scale;
                    const sTop = (tRect.top - canvasRect.top - offset.y) / scale;
                    const sWidth = tRect.width / scale;
                    const sHeight = tRect.height / scale;
                    snapTargets.push({ id: targetNode.id, left: sLeft, top: sTop, right: sLeft + sWidth, bottom: sTop + sHeight, centerX: sLeft + sWidth / 2, centerY: sTop + sHeight / 2 });
                }
            };
            if (parentNode.id !== 'root') addSnapTarget(parentNode);
            if (parentNode.children) parentNode.children.forEach(addSnapTarget);

            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            itemsToDrag.forEach(id => {
                const dom = elementsRef.current[id];
                if (dom) {
                    const r = dom.getBoundingClientRect();
                    minX = Math.min(minX, r.left);
                    minY = Math.min(minY, r.top);
                    maxX = Math.max(maxX, r.right);
                    maxY = Math.max(maxY, r.bottom);
                }
            });
            
            const selWorldLeft = (minX - canvasRect.left - offset.x) / scale;
            const selWorldTop = (minY - canvasRect.top - offset.y) / scale;
            const selWorldRight = (maxX - canvasRect.left - offset.x) / scale;
            const selWorldBottom = (maxY - canvasRect.top - offset.y) / scale;

            const itemsData = itemsToDrag.map((dragId) => {
                const result = findNodeAndParent(elements, dragId);
                const domEl = elementsRef.current[dragId];
                let originalLeft = 0, originalTop = 0;

                if (result && domEl) {
                    const { parent } = result;
                    const rect = domEl.getBoundingClientRect();
                    const elementX = (rect.left - canvasRect.left - offset.x) / scale;
                    const elementY = (rect.top - canvasRect.top - offset.y) / scale;

                    let parentX = 0, parentY = 0;
                    if (parent && parent.id !== 'root') {
                        const parentWrapper = elementsRef.current[parent.id];
                        if (parentWrapper) {
                            const parentRect = parentWrapper.getBoundingClientRect();
                            parentX = (parentRect.left - canvasRect.left - offset.x) / scale;
                            parentY = (parentRect.top - canvasRect.top - offset.y) / scale;
                        }
                    }
                    originalLeft = elementX - parentX;
                    originalTop = elementY - parentY;
                }
                return { id: dragId, originalLeft, originalTop };
            });

            startInteraction();
            setDraggingState({
                items: itemsData, startX: mouseX, startY: mouseY, snapTargets,
                selectionWorldBox: { 
                    left: selWorldLeft, top: selWorldTop, right: selWorldRight, bottom: selWorldBottom, 
                    width: selWorldRight - selWorldLeft, height: selWorldBottom - selWorldTop,
                    centerX: selWorldLeft + (selWorldRight - selWorldLeft) / 2, 
                    centerY: selWorldTop + (selWorldBottom - selWorldTop) / 2
                }
            });
        },
        [activeTool, elements, elementsRef, getCoordsInWorld, offset, scale, startInteraction, selectedIds, setSelectedIds]
    );

    useEffect(() => {
        if (!draggingState) return;

        const handleMouseMove = (e: MouseEvent) => {
            hasDragged.current = true;
            const { items, startX, startY, snapTargets, selectionWorldBox } = draggingState;

            const { x, y } = getCoordsInWorld(e);
            let dx = x - startX;
            let dy = y - startY;

            const activeLines: GuideLine[] = [];
            const SNAP_THRESHOLD = 5 / scale;

            const activeRect = {
                left: selectionWorldBox.left + dx, top: selectionWorldBox.top + dy,
                right: selectionWorldBox.right + dx, bottom: selectionWorldBox.bottom + dy,
                centerX: selectionWorldBox.centerX + dx, centerY: selectionWorldBox.centerY + dy,
            };

            let snapDx = dx;
            let snapDy = dy;
            let minDiffX = SNAP_THRESHOLD;
            let minDiffY = SNAP_THRESHOLD;
            let bestSnapX: any = null;
            let bestSnapY: any = null;

            for (const targetRect of snapTargets) {
                const checks = [
                    { active: activeRect.left, target: targetRect.left, pos: 'left' },
                    { active: activeRect.left, target: targetRect.right, pos: 'left' },
                    { active: activeRect.left, target: targetRect.centerX, pos: 'left' },
                    { active: activeRect.right, target: targetRect.left, pos: 'right' },
                    { active: activeRect.right, target: targetRect.right, pos: 'right' },
                    { active: activeRect.right, target: targetRect.centerX, pos: 'right' },
                    { active: activeRect.centerX, target: targetRect.left, pos: 'centerX' },
                    { active: activeRect.centerX, target: targetRect.right, pos: 'centerX' },
                    { active: activeRect.centerX, target: targetRect.centerX, pos: 'centerX' },
                    { active: activeRect.top, target: targetRect.top, pos: 'top' },
                    { active: activeRect.top, target: targetRect.bottom, pos: 'top' },
                    { active: activeRect.top, target: targetRect.centerY, pos: 'top' },
                    { active: activeRect.bottom, target: targetRect.top, pos: 'bottom' },
                    { active: activeRect.bottom, target: targetRect.bottom, pos: 'bottom' },
                    { active: activeRect.bottom, target: targetRect.centerY, pos: 'bottom' },
                    { active: activeRect.centerY, target: targetRect.top, pos: 'centerY' },
                    { active: activeRect.centerY, target: targetRect.bottom, pos: 'centerY' },
                    { active: activeRect.centerY, target: targetRect.centerY, pos: 'centerY' },
                ];

                for (const check of checks) {
                    const diff = Math.abs(check.active - check.target);
                    if (diff < SNAP_THRESHOLD) {
                        if (['left', 'right', 'centerX'].includes(check.pos)) {
                            if (diff < minDiffX) { minDiffX = diff; bestSnapX = check; }
                        } else {
                            if (diff < minDiffY) { minDiffY = diff; bestSnapY = check; }
                        }
                    }
                }
            }

            if (bestSnapX) {
                snapDx = bestSnapX.target - selectionWorldBox[bestSnapX.pos as 'left'|'right'|'centerX'];
                activeLines.push({ type: 'vertical', position: bestSnapX.target });
            }
            if (bestSnapY) {
                snapDy = bestSnapY.target - selectionWorldBox[bestSnapY.pos as 'top'|'bottom'|'centerY'];
                activeLines.push({ type: 'horizontal', position: bestSnapY.target });
            }
            
            setGuideLines(activeLines);

            setElements((prevElements) => {
                return produce(prevElements, (draft) => {
                    const findAndUpdate = (nodes: ElementNode[], targetId: string) => {
                        const node = nodes.find((n) => n.id === targetId);
                        if (node && node.style) {
                            const draggedItem = items.find(i => i.id === targetId);
                            if (draggedItem) {
                                node.style.left = `${Math.round(draggedItem.originalLeft + snapDx)}px`;
                                node.style.top = `${Math.round(draggedItem.originalTop + snapDy)}px`;
                                node.style.margin = '';
                            }
                        } else {
                            nodes.forEach((n) => n.children && findAndUpdate(n.children, targetId));
                        }
                    };
                    items.forEach((item) => findAndUpdate(draft, item.id));
                });
            });
        };

        const handleMouseUp = () => {
            if (draggingState && hasDragged.current) {
                const moves: {id: string, newParentId: string, newLeft: number, newTop: number}[] = [];
                
                draggingState.items.forEach(item => {
                    const domEl = elementsRef.current[item.id];
                    if (!domEl) return;
                    
                    const rect = domEl.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    
                    const elementsAtPoint = document.elementsFromPoint(centerX, centerY);
                    let newParentId = 'root';
                    let parentWrapper: HTMLElement | null = null;
                    
                    for (const el of elementsAtPoint) {
                        const tid = (el as HTMLElement).dataset?.elementId;
                        if (tid && tid !== 'root' && !selectedIds.includes(tid)) {
                            if (domEl.contains(el)) continue;
                            const tNodeInfo = findNodeAndParent(elements, tid);
                            if (tNodeInfo && (tNodeInfo.node.type === 'frame' || tNodeInfo.node.type === 'div')) {
                                newParentId = tid;
                                parentWrapper = el as HTMLElement;
                                break;
                            }
                        }
                    }
                    
                    const currentParentInfo = findNodeAndParent(elements, item.id);
                    if (currentParentInfo && currentParentInfo.parent?.id !== newParentId) {
                        const canvasRect = canvasRef.current!.getBoundingClientRect();
                        const elementXWorld = (rect.left - canvasRect.left - offset.x) / scale;
                        const elementYWorld = (rect.top - canvasRect.top - offset.y) / scale;
                        
                        let parentXWorld = 0, parentYWorld = 0;
                        if (newParentId !== 'root' && parentWrapper) {
                            const pRect = parentWrapper.getBoundingClientRect();
                            parentXWorld = (pRect.left - canvasRect.left - offset.x) / scale;
                            parentYWorld = (pRect.top - canvasRect.top - offset.y) / scale;
                        }
                        
                        moves.push({
                            id: item.id,
                            newParentId,
                            newLeft: Math.round(elementXWorld - parentXWorld),
                            newTop: Math.round(elementYWorld - parentYWorld)
                        });
                    }
                });

                if (moves.length > 0) reparentElements(moves);
            }

            setDraggingState(null);
            setGuideLines([]);
            endInteraction();
            setTimeout(() => { hasDragged.current = false; }, 50);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
    }, [draggingState, getCoordsInWorld, updateElementStyle, elements, elementsRef, scale, endInteraction, reparentElements, offset, selectedIds, setElements]);

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
            zIndex: 9999,
        };
    };
    useEffect(() => {
        if (!resizingState) return;

        const handleWindowMouseMove = (e: MouseEvent) => {
            hasDragged.current = true;
            const { handle, originalStyle, startX, startY, elementId, originalWorldBox, snapTargets } = resizingState;
            const dx = (e.clientX - startX) / scale;
            const dy = (e.clientY - startY) / scale;

            let { top, left, width, height } = originalStyle;
            let worldLeft = originalWorldBox.left;
            let worldTop = originalWorldBox.top;
            let worldWidth = originalWorldBox.width;
            let worldHeight = originalWorldBox.height;

            if (handle.includes('b')) { height += dy; worldHeight += dy; }
            if (handle.includes('t')) { height -= dy; top += dy; worldHeight -= dy; worldTop += dy; }
            if (handle.includes('r')) { width += dx; worldWidth += dx; }
            if (handle.includes('l')) { width -= dx; left += dx; worldWidth -= dx; worldLeft += dx; }

            const activeLines: GuideLine[] = [];
            const SNAP_THRESHOLD = 5 / scale;

            const activeWorldRect = {
                top: worldTop, left: worldLeft, width: worldWidth, height: worldHeight,
                right: worldLeft + worldWidth, bottom: worldTop + worldHeight,
                centerX: worldLeft + worldWidth / 2, centerY: worldTop + worldHeight / 2,
            };

            let minDiffX = SNAP_THRESHOLD;
            let minDiffY = SNAP_THRESHOLD;
            let bestSnapX: any = null;
            let bestSnapY: any = null;

            for (const targetRect of snapTargets) {
                const verticalChecks = [targetRect.left, targetRect.centerX, targetRect.right];
                const horizontalChecks = [targetRect.top, targetRect.centerY, targetRect.bottom];

                if (handle.includes('r') || handle.includes('l')) {
                    const activeEdge = handle.includes('r') ? activeWorldRect.right : activeWorldRect.left;
                    for (const targetPos of verticalChecks) {
                        const diff = Math.abs(activeEdge - targetPos);
                        if (diff < minDiffX) { minDiffX = diff; bestSnapX = { targetPos, activeEdge }; }
                    }
                }
                if (handle.includes('b') || handle.includes('t')) {
                    const activeEdge = handle.includes('b') ? activeWorldRect.bottom : activeWorldRect.top;
                    for (const targetPos of horizontalChecks) {
                        const diff = Math.abs(activeEdge - targetPos);
                        if (diff < minDiffY) { minDiffY = diff; bestSnapY = { targetPos, activeEdge }; }
                    }
                }
            }

            if (bestSnapX) {
                const correction = bestSnapX.targetPos - bestSnapX.activeEdge;
                if (handle.includes('r')) width += correction;
                if (handle.includes('l')) { left += correction; width -= correction; }
                activeLines.push({ type: 'vertical', position: bestSnapX.targetPos });
            }
            if (bestSnapY) {
                const correction = bestSnapY.targetPos - bestSnapY.activeEdge;
                if (handle.includes('b')) height += correction;
                if (handle.includes('t')) { top += correction; height -= correction; }
                activeLines.push({ type: 'horizontal', position: bestSnapY.targetPos });
            }

            const minSize = 10;
            if (width < minSize) { if (handle.includes('l')) left = originalStyle.left + originalStyle.width - minSize; width = minSize; }
            if (height < minSize) { if (handle.includes('t')) top = originalStyle.top + originalStyle.height - minSize; height = minSize; }

            const newStyle: React.CSSProperties = {};
            if (handle.includes('l') || handle.includes('r')) newStyle.width = `${Math.round(width)}px`;
            if (handle.includes('t') || handle.includes('b')) newStyle.height = `${Math.round(height)}px`;
            if (originalStyle.position !== 'relative') {
                if (handle.includes('t')) newStyle.top = `${Math.round(top)}px`;
                if (handle.includes('l')) newStyle.left = `${Math.round(left)}px`;
            }

            setGuideLines(activeLines);
            updateElementStyle(elementId, newStyle);
        };

        const handleWindowMouseUp = () => {
            setResizingState(null);
            setGuideLines([]);
            endInteraction();
            setTimeout(() => { hasDragged.current = false; }, 50);
        };

        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('mouseup', handleWindowMouseUp);
        };
    }, [resizingState, scale, updateElementStyle, endInteraction]);

    useLayoutEffect(() => {
        if (!Array.isArray(selectedIds) || selectedIds.length <= 1 || !canvasRef.current) {
            setBoundingBox(null);
            return;
        }

        const canvasRect = canvasRef.current.getBoundingClientRect();
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        let hasValid = false;

        selectedIds.forEach((id) => {
            const el = elementsRef.current[id];
            if (el && id !== 'root') {
                const rect = el.getBoundingClientRect();
                const elLeft = (rect.left - canvasRect.left - offset.x) / scale;
                const elTop = (rect.top - canvasRect.top - offset.y) / scale;
                const elRight = elLeft + (rect.width / scale);
                const elBottom = elTop + (rect.height / scale);

                minX = Math.min(minX, elLeft);
                minY = Math.min(minY, elTop);
                maxX = Math.max(maxX, elRight);
                maxY = Math.max(maxY, elBottom);
                hasValid = true;
            }
        });

        if (hasValid) {
            setBoundingBox({ left: minX, top: minY, width: maxX - minX, height: maxY - minY });
        } else {
            setBoundingBox(null);
        }
    }, [elements, selectedIds, offset, scale, elementsRef]);

    const canvasElements = elements[0]?.children || [];

    return (
        <div ref={canvasRef} className={`${styles.canvas} ${styles[activeTool]}`}>
            <div
                ref={innerRef}
                onClickCapture={(e) => {
                    if (hasDragged.current) e.stopPropagation();
                }}
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
                
                {selectionBox && (
                    <div style={{
                        position: 'absolute',
                        left: Math.min(selectionBox.startX, selectionBox.currentX),
                        top: Math.min(selectionBox.startY, selectionBox.currentY),
                        width: Math.abs(selectionBox.currentX - selectionBox.startX),
                        height: Math.abs(selectionBox.currentY - selectionBox.startY),
                        backgroundColor: 'rgba(0, 122, 255, 0.1)',
                        border: '1px solid rgba(0, 122, 255, 0.5)',
                        zIndex: 9999,
                        pointerEvents: 'none'
                    }} />
                )}

                {boundingBox && (
                    <div style={{
                        position: 'absolute',
                        left: boundingBox.left,
                        top: boundingBox.top,
                        width: boundingBox.width,
                        height: boundingBox.height,
                        border: '1px solid #007aff',
                        pointerEvents: 'none',
                        zIndex: 9999
                    }} />
                )}

                {guideLines.map((line, index) => (
                    <div
                        key={`guide-${index}`}
                        style={{
                            position: 'absolute',
                            backgroundColor: '#FF0000',
                            ...(line.type === 'vertical'
                                ? { left: line.position, top: -10000, width: '1px', height: '20000px' }
                                : { top: line.position, left: -10000, height: '1px', width: '20000px' }),
                            zIndex: 9998,
                        }}
                    />
                ))}

                {canvasElements.map((el) => (
                    <ElementRenderer
                        key={el.id}
                        node={el}
                        isRootFrame={true}
                        onResizeStart={handleResizeStart}
                        onDragStart={handleDragStart}
                    />
                ))}
            </div>
        </div>
    );
}