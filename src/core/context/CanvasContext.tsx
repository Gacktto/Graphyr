import {
    createContext,
    useContext,
    useState,
    useRef,
    type ReactNode,
    useMemo,
    useCallback,
} from 'react';
import { produce } from 'immer';
import type { ElementNode, ChartVariant, ChartOptions } from '../../features/editor/TreeView/TreeView';
import { letterFrequency } from '@visx/mock-data';

export type ActiveTool = 'cursor' | 'text' | 'frame' | 'chart';

type AddElementOptions = {
    parentId: string | null;
    style?: React.CSSProperties;
};

type MoveElementOptions = {
    draggedId: string;
    targetId: string | null;
    position: 'before' | 'after' | 'inside';
};

type ReparentOption = {
    id: string;
    newParentId: string;
    newLeft: number;
    newTop: number;
};

type CanvasContextType = {
    elements: ElementNode[];
    setElements: React.Dispatch<React.SetStateAction<ElementNode[]>>;
    selectedIds: string[];
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
    hoveredId: string | null;
    setHoveredId: React.Dispatch<React.SetStateAction<string | null>>;
    toggleSelection: (id: string, multi: boolean) => void;
    elementsRef: React.MutableRefObject<Record<string, HTMLElement | null>>;
    activeTool: ActiveTool;
    setActiveTool: (tool: ActiveTool) => void;
    addElement: (type: 'frame' | 'text' | 'chart', options: AddElementOptions) => void;
    updateElementStyle: (id: string | string[], newStyle: React.CSSProperties) => void;
    moveElement: (options: MoveElementOptions) => void;
    reparentElements: (moves: ReparentOption[]) => void;
    copySelectedElement: () => void;
    pasteElement: () => void;
    undo: () => void;
    redo: () => void;
    deleteElement: (idToDelete: string) => void;
    updateElementChartProps: (id: string | string[], newChartProps: Partial<ElementNode['chartProps']>) => void;
    updateElementData: (id: string | string[], data: any[]) => void;
    updateElementProps: (id: string | string[], props: Partial<ElementNode>) => void;
    startInteraction: () => void;
    endInteraction: () => void;
    groupElements: () => void;
    ungroupElements: () => void;
};

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

function findNode(nodes: ElementNode[], nodeId: string): ElementNode | null {
    for (const node of nodes) {
        if (node.id === nodeId) return node;
        if (node.children) {
            const found = findNode(node.children, nodeId);
            if (found) return found;
        }
    }
    return null;
}

function deepCloneAndAssignNewIds(node: ElementNode): ElementNode {
    const newNode: ElementNode = {
        ...node,
        id: crypto.randomUUID(),
        name: node.name,
    };
    if (node.children) {
        newNode.children = node.children.map((child) =>
            deepCloneAndAssignNewIds(child)
        );
    }
    return newNode;
}

function findAndRemove(nodes: ElementNode[], nodeId: string): [ElementNode | null, ElementNode[]] {
    let found: ElementNode | null = null;
    const newNodes = nodes.filter((node) => {
        if (node.id === nodeId) {
            found = node;
            return false;
        }
        return true;
    });

    if (found) return [found, newNodes];

    for (let i = 0; i < newNodes.length; i++) {
        const node = newNodes[i];
        if (node.children) {
            const [foundNode, newChildren] = findAndRemove(node.children, nodeId);
            if (foundNode) {
                newNodes[i] = { ...node, children: newChildren };
                return [foundNode, newNodes];
            }
        }
    }
    return [null, nodes];
}

function removeNodeFromTree(nodes: ElementNode[], id: string): ElementNode | null {
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) {
            return nodes.splice(i, 1)[0];
        }
        if (nodes[i].children) {
            const found = removeNodeFromTree(nodes[i].children!, id);
            if (found) return found;
        }
    }
    return null;
}

function insert(
    nodes: ElementNode[],
    nodeToInsert: ElementNode,
    targetId: string,
    position: 'before' | 'after' | 'inside'
): [boolean, ElementNode[]] {
    if (position === 'inside') {
        let inserted = false;
        const newNodes = nodes.map((node) => {
            if (inserted) return node;
            if (node.id === targetId) {
                inserted = true;
                return { ...node, children: [...(node.children || []), nodeToInsert] };
            }
            if (node.children) {
                const [childInserted, newChildren] = insert(node.children, nodeToInsert, targetId, position);
                if (childInserted) {
                    inserted = true;
                    return { ...node, children: newChildren };
                }
            }
            return node;
        });
        return [inserted, newNodes];
    }

    const targetIndex = nodes.findIndex((n) => n.id === targetId);
    if (targetIndex !== -1) {
        const newNodes = [...nodes];
        newNodes.splice(position === 'before' ? targetIndex : targetIndex + 1, 0, nodeToInsert);
        return [true, newNodes];
    }

    let inserted = false;
    const newNodes = nodes.map((node) => {
        if (inserted) return node;
        if (node.children) {
            const [childInserted, newChildren] = insert(node.children, nodeToInsert, targetId, position);
            if (childInserted) {
                inserted = true;
                return { ...node, children: newChildren };
            }
        }
        return node;
    });
    return [inserted, newNodes];
}

export function CanvasProvider({ children }: { children: ReactNode }) {
    const undoStack = useRef<ElementNode[][]>([]);
    const redoStack = useRef<ElementNode[][]>([]);
    const isInteractionActive = useRef(false);
    const stateBeforeInteraction = useRef<ElementNode[] | null>(null);

    const startInteraction = useCallback(() => {
        isInteractionActive.current = true;
        setElements((currentElements) => {
            stateBeforeInteraction.current = currentElements;
            return currentElements;
        });
    }, []);

    const endInteraction = useCallback(() => {
        isInteractionActive.current = false;
        setElements((currentElements) => {
            if (stateBeforeInteraction.current && stateBeforeInteraction.current !== currentElements) {
                undoStack.current.push(stateBeforeInteraction.current);
                redoStack.current.length = 0;
            }
            stateBeforeInteraction.current = null;
            return currentElements;
        });
    }, []);

    const elementsRef = useRef<Record<string, HTMLElement | null>>({});
    const [elements, setElements] = useState<ElementNode[]>([
        {
            id: 'root',
            type: 'root',
            name: 'Canvas',
            style: {},
            children: [],
        },
    ]);
    
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [activeTool, setActiveTool] = useState<ActiveTool>('cursor');
    const [copiedElement, setCopiedElement] = useState<ElementNode | null>(null);

    const toggleSelection = useCallback((id: string, multi: boolean) => {
        setSelectedIds((prev) => {
            if (multi) {
                return prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id];
            }
            return [id];
        });
    }, []);

    const updateElementsWithHistory = useCallback((nextState: ElementNode[]) => {
        setElements((prev) => {
            if (prev !== nextState && !isInteractionActive.current) {
                undoStack.current.push(prev);
                redoStack.current.length = 0; 
            }
            return nextState;
        });
    }, []);

    const undo = useCallback(() => {
        if (undoStack.current.length === 0) return;
        setElements((prev) => {
            const last = undoStack.current.pop()!;
            redoStack.current.push(prev); 
            return last;
        });
    }, []);

    const redo = useCallback(() => {
        if (redoStack.current.length === 0) return;
        setElements((prev) => {
            const next = redoStack.current.pop()!;
            undoStack.current.push(prev); 
            return next;
        });
    }, []);

    const addElement = useCallback((type: 'frame' | 'text' | 'chart', options: AddElementOptions) => {
        const newId = crypto.randomUUID();
        let newElement: ElementNode;
        const baseStyle = { ...options.style, position: 'absolute' as any };

        if (type.startsWith('chart')) {
            const variantMap: Record<string, ChartVariant> = {
                chartBar: 'bar', chartBarHorizontal: 'barHorizontal', chartPie: 'pie', chartDonut: 'donut', chartLine: 'line',
            };
            const chartData = letterFrequency.slice(0, 255).map(d => ({ ...d, value: d.frequency * 100 }));

            newElement = {
                id: newId, type: 'chart', name: 'Chart',
                style: { width: '450px', height: '300px', backgroundColor: 'rgba(255, 255, 255, 1)', ...baseStyle },
                data: chartData,
                chartProps: {
                    variant: variantMap[type] || 'bar',
                    options: { showXAxis: true, showYAxis: true, barColor: 'rgba(0, 0, 0, 1)', lineColor: 'rgba(0, 0, 0, 1)', xAxisColor: 'rgba(0, 0, 0, 1)', yAxisColor: 'rgba(0, 0, 0, 1)', dotColor: 'rgba(0, 0, 0, 1)', xTickStrokeColor: 'rgba(0, 0, 0, 1)', yTickStrokeColor: 'rgba(0, 0, 0, 1)', xTickLabelColor: 'rgba(0, 0, 0, 1)', yTickLabelColor: 'rgba(0, 0, 0, 1)' }
                },
            };
        } else if (type === 'frame') {
            newElement = { id: newId, type: 'frame', name: 'Frame', style: { width: '300px', height: '300px', backgroundColor: '#FFFFFF', ...baseStyle }, children: [] };
        } else {
            newElement = { id: newId, type: 'text', name: 'Text', style: { fontSize: '16px', color: 'rgba(0, 0, 0, 1)', width: 'auto', height: 'auto', ...baseStyle } };
        }

        updateElementsWithHistory(produce(elements, draft => {
            const [, updated] = insert(draft, newElement, options.parentId || 'root', 'inside');
            return updated;
        }));
        setSelectedIds([newId]);
    }, [elements, updateElementsWithHistory]);

    const updateElementData = useCallback((idOrIds: string | string[], data: any[]) => {
        const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
        updateElementsWithHistory(produce(elements, (draft) => {
            const findAndUpdate = (nodes: ElementNode[]) => {
                nodes.forEach(node => {
                    if (ids.includes(node.id)) {
                        node.data = data;
                        if (node.chartProps?.options) {
                            node.chartProps.options.labelKey = '';
                            node.chartProps.options.valueKey = '';
                        }
                    }
                    if (node.children) findAndUpdate(node.children);
                });
            };
            findAndUpdate(draft);
        }));
    }, [elements, updateElementsWithHistory]);
    
    const updateElementChartProps = useCallback((idOrIds: string | string[], newChartProps: Partial<ElementNode['chartProps']>) => {
        const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
        updateElementsWithHistory(produce(elements, draft => {
            const findAndUpdate = (nodes: ElementNode[]) => {
                nodes.forEach(node => {
                    if (ids.includes(node.id)) {
                        node.chartProps = {
                            ...node.chartProps, ...newChartProps,
                            options: { ...node.chartProps?.options, ...newChartProps?.options },
                        } as ElementNode['chartProps'];
                    }
                    if (node.children) findAndUpdate(node.children);
                });
            };
            findAndUpdate(draft);
        }));
    }, [elements, updateElementsWithHistory]);

    const updateElementProps = useCallback((idOrIds: string | string[], propsToUpdate: Partial<ElementNode>) => {
        const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
        updateElementsWithHistory(produce(elements, (draft) => {
            const findAndUpdate = (nodes: ElementNode[]) => {
                nodes.forEach(node => {
                    if (ids.includes(node.id)) {
                        Object.assign(node, propsToUpdate);
                    }
                    if (node.children) findAndUpdate(node.children);
                });
            };
            findAndUpdate(draft);
        }));
    }, [elements, updateElementsWithHistory]);

    const updateElementStyle = useCallback((idOrIds: string | string[], newStyle: React.CSSProperties) => {
        const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
        updateElementsWithHistory(produce(elements, draft => {
            const findAndUpdate = (nodes: ElementNode[]) => {
                nodes.forEach(node => {
                    if(ids.includes(node.id)) {
                        node.style = {...node.style, ...newStyle};
                        if (newStyle.display === 'flex' && node.children) {
                            node.children.forEach(child => { child.style = {...child.style, left: '', top: ''}; });
                        }
                    }
                    if (node.children) findAndUpdate(node.children);
                });
            };
            findAndUpdate(draft);
        }));
    }, [elements, updateElementsWithHistory]);

    const moveElement = useCallback((options: MoveElementOptions) => {
        const { draggedId, targetId, position } = options;
        if (draggedId === targetId) return;

        updateElementsWithHistory(produce(elements, draft => {
            const [draggedNode, treeWithoutDragged] = findAndRemove(draft, draggedId);
            if (!draggedNode) return;

            if (targetId === null) {
                const root = treeWithoutDragged.find((n) => n.id === 'root');
                if (root) root.children = [...(root.children || []), draggedNode];
                return treeWithoutDragged;
            }
            const [, finalTree] = insert(treeWithoutDragged, draggedNode, targetId, position);
            return finalTree;
        }));
    }, [elements, updateElementsWithHistory]);

    const reparentElements = useCallback((moves: ReparentOption[]) => {
        updateElementsWithHistory(produce(elements, draft => {
            moves.forEach(move => {
                const nodeToMove = removeNodeFromTree(draft, move.id);
                if (nodeToMove) {
                    nodeToMove.style = {
                        ...nodeToMove.style,
                        left: `${move.newLeft}px`,
                        top: `${move.newTop}px`,
                    };
                    const newParent = findNode(draft, move.newParentId);
                    if (newParent) {
                        if (!newParent.children) newParent.children = [];
                        newParent.children.push(nodeToMove);
                    }
                }
            });
        }));
    }, [elements, updateElementsWithHistory]);

    const copySelectedElement = useCallback(() => {
        if (selectedIds.length === 0) return;
        const elementToCopy = findNode(elements, selectedIds[0]);
        if (elementToCopy) {
            setCopiedElement(JSON.parse(JSON.stringify(elementToCopy)));
        }
    }, [selectedIds, elements]);

    const pasteElement = useCallback(() => {
        if (!copiedElement) return;
        const cloned = deepCloneAndAssignNewIds(copiedElement);
        cloned.style = { ...cloned.style, position: 'absolute' };
        const parentId = selectedIds.length > 0 ? selectedIds[0] : 'root';

        updateElementsWithHistory(produce(elements, draft => {
            const [, updated] = insert(draft, cloned, parentId, 'inside');
            return updated;
        }));
    }, [copiedElement, selectedIds, elements, updateElementsWithHistory]);

    const deleteElement = useCallback((idToDelete: string) => {
        if (idToDelete === 'root') return;
        updateElementsWithHistory(produce(elements, draft => {
            const [, newTree] = findAndRemove(draft, idToDelete);
            return newTree;
        }));
        setSelectedIds((prev) => prev.filter(id => id !== idToDelete));
    }, [elements, updateElementsWithHistory]);

    const groupElements = useCallback(() => {
        if (selectedIds.length < 2) return;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        selectedIds.forEach((id) => {
            const el = elementsRef.current[id];
            if (el && id !== 'root') {
                const left = el.offsetLeft;
                const top = el.offsetTop;
                minX = Math.min(minX, left);
                minY = Math.min(minY, top);
                maxX = Math.max(maxX, left + el.offsetWidth);
                maxY = Math.max(maxY, top + el.offsetHeight);
            }
        });

        if (minX === Infinity) return;
        const newGroupId = crypto.randomUUID();

        updateElementsWithHistory(produce(elements, (draft) => {
            const extractedNodes: ElementNode[] = [];
            let parentIdOfFirstItem = 'root';

            const extractNodes = (nodes: ElementNode[], parent: ElementNode | null) => {
                for (let i = nodes.length - 1; i >= 0; i--) {
                    if (selectedIds.includes(nodes[i].id)) {
                        if (extractedNodes.length === 0 && parent) parentIdOfFirstItem = parent.id;
                        
                        const nodeStyle = nodes[i].style || {};
                        const currentLeft = parseFloat(String(nodeStyle.left || 0));
                        const currentTop = parseFloat(String(nodeStyle.top || 0));
                        
                        nodes[i].style = {
                            ...nodeStyle,
                            left: `${currentLeft - minX}px`,
                            top: `${currentTop - minY}px`,
                        };
                        
                        extractedNodes.unshift(nodes[i]);
                        nodes.splice(i, 1);
                    } else if (nodes[i].children) {
                        extractNodes(nodes[i].children!, nodes[i]);
                    }
                }
            };

            extractNodes(draft, null);

            const newGroup: ElementNode = {
                id: newGroupId,
                type: 'div',
                name: 'Group',
                style: {
                    position: 'absolute',
                    left: `${minX}px`,
                    top: `${minY}px`,
                    width: `${maxX - minX}px`,
                    height: `${maxY - minY}px`,
                    backgroundColor: 'transparent',
                },
                children: extractedNodes,
            };

            const insertGroup = (nodes: ElementNode[]) => {
                for (const node of nodes) {
                    if (node.id === parentIdOfFirstItem) {
                        node.children = [...(node.children || []), newGroup];
                        return true;
                    }
                    if (node.children && insertGroup(node.children)) return true;
                }
                return false;
            };

            if (!insertGroup(draft)) {
                const root = draft.find(n => n.id === 'root');
                if (root) root.children = [...(root.children || []), newGroup];
            }
        }));

        setSelectedIds([newGroupId]);
    }, [selectedIds, elements, elementsRef, updateElementsWithHistory]);

    const ungroupElements = useCallback(() => {
        if (selectedIds.length === 0) return;
        let newSelectedIds: string[] = [];

        updateElementsWithHistory(produce(elements, (draft) => {
            const processUngroup = (nodes: ElementNode[]) => {
                for (let i = nodes.length - 1; i >= 0; i--) {
                    const node = nodes[i];
                    if (selectedIds.includes(node.id) && (node.type === 'div' || node.type === 'frame') && node.children && node.children.length > 0 && node.id !== 'root') {
                        const groupLeft = parseFloat(String(node.style?.left || 0));
                        const groupTop = parseFloat(String(node.style?.top || 0));

                        const childrenToExtract = node.children.map(child => {
                            const childLeft = parseFloat(String(child.style?.left || 0));
                            const childTop = parseFloat(String(child.style?.top || 0));
                            newSelectedIds.push(child.id);
                            return {
                                ...child,
                                style: {
                                    ...child.style,
                                    left: `${groupLeft + childLeft}px`,
                                    top: `${groupTop + childTop}px`,
                                }
                            };
                        });

                        nodes.splice(i, 1);
                        nodes.splice(i, 0, ...childrenToExtract);
                    } else if (node.children) {
                        processUngroup(node.children);
                    }
                }
            };
            processUngroup(draft);
        }));

        if (newSelectedIds.length > 0) setSelectedIds(newSelectedIds);
    }, [selectedIds, elements, updateElementsWithHistory]);

    const contextValue = useMemo(
        () => ({
            elements, setElements, selectedIds, setSelectedIds, toggleSelection,
            hoveredId, setHoveredId,
            elementsRef, activeTool, setActiveTool, addElement, updateElementStyle,
            moveElement, reparentElements, copySelectedElement, pasteElement, undo, redo, deleteElement,
            updateElementChartProps, updateElementData, updateElementProps,
            startInteraction, endInteraction, groupElements, ungroupElements,
        }),
        [
            elements, selectedIds, toggleSelection, hoveredId, activeTool, addElement, updateElementStyle,
            moveElement, reparentElements, copySelectedElement, pasteElement, undo, redo, deleteElement,
            updateElementChartProps, updateElementData, updateElementProps,
            startInteraction, endInteraction, groupElements, ungroupElements,
        ]
    );

    return <CanvasContext.Provider value={contextValue}>{children}</CanvasContext.Provider>;
}

export function useCanvas() {
    const ctx = useContext(CanvasContext);
    if (!ctx) throw new Error('useCanvas deve ser usado dentro de CanvasProvider');
    return ctx;
}