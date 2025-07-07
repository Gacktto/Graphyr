import {
    createContext,
    useContext,
    useState,
    useRef,
    type ReactNode,
    useMemo,
    useCallback,
} from 'react';
import type { ElementNode } from '../components/TreeView/TreeView';

export type ActiveTool = 'cursor' | 'text' | 'div' | 'chartBarHorizontal'  | 'chartPie' | 'chartLine' | 'chartDonut' | 'chartBar' | 'table';

type AddElementOptions = {
    parentId: string | null;
    style?: React.CSSProperties;
};

type MoveElementOptions = {
    draggedId: string;
    targetId: string | null;
    position: 'before' | 'after' | 'inside';
};

type CanvasContextType = {
    elements: ElementNode[];
    setElements: React.Dispatch<React.SetStateAction<ElementNode[]>>;
    selectedId: string | null;
    setSelectedId: (id: string | null) => void;
    elementsRef: React.MutableRefObject<Record<string, HTMLElement | null>>;
    activeTool: ActiveTool;
    setActiveTool: (tool: ActiveTool) => void;
    addElement: (type: 'div' | 'text' |  'chartBarHorizontal'  | 'chartPie' | 'chartLine' | 'chartDonut' | 'chartBar' | 'table' , options: AddElementOptions) => void;
    updateElementStyle: (id: string, newStyle: React.CSSProperties) => void;
    moveElement: (options: MoveElementOptions) => void;
    copySelectedElement: () => void;
    pasteElement: () => void;
    undo: () => void;
    redo: () => void;
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
        newNode.children = node.children.map(child => deepCloneAndAssignNewIds(child));
    }
    return newNode;
}

function findAndRemove(
    nodes: ElementNode[],
    nodeId: string
): [ElementNode | null, ElementNode[]] {
    let found: ElementNode | null = null;

    const newNodes = nodes.filter((node) => {
        if (node.id === nodeId) {
            found = node;
            return false;
        }
        return true;
    });

    if (found) {
        return [found, newNodes];
    }

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
                return {
                    ...node,
                    children: [...(node.children || []), nodeToInsert],
                };
            }
            if (node.children) {
                const [childInserted, newChildren] = insert(
                    node.children,
                    nodeToInsert,
                    targetId,
                    position
                );
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
        newNodes.splice(
            position === 'before' ? targetIndex : targetIndex + 1,
            0,
            nodeToInsert
        );
        return [true, newNodes];
    }

    let inserted = false;
    const newNodes = nodes.map((node) => {
        if (inserted) return node;
        if (node.children) {
            const [childInserted, newChildren] = insert(
                node.children,
                nodeToInsert,
                targetId,
                position
            );
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

    const elementsRef = useRef<Record<string, HTMLElement | null>>({});
    const [elements, setElements] = useState<ElementNode[]>([
        {
            id: '1',
            type: 'frame',
            name: 'Default',
            style: {
                width: '1600px',
                height: '800px',
                position: 'relative',
                backgroundColor: '#FFF',
            },
            children: [],
        },
    ]);
    const [selectedId, setSelectedId] = useState<string | null>('1');
    const [activeTool, setActiveTool] = useState<ActiveTool>('cursor');
    const [copiedElement, setCopiedElement] = useState<ElementNode | null>(null);

    const updateElementsWithHistory = useCallback((updater: (prev: ElementNode[]) => ElementNode[]) => {
        setElements(prev => {
            undoStack.current.push(structuredClone(prev));
            if (undoStack.current.length > 1000) undoStack.current.shift();
            redoStack.current = [];
            return updater(prev);
        });
    }, []);

    const undo = useCallback(() => {
        if (undoStack.current.length === 0) return;
        setElements(prev => {
            const last = undoStack.current.pop()!;
            redoStack.current.push(structuredClone(prev));
            return last;
        });
    }, []);

    const redo = useCallback(() => {
        if (redoStack.current.length === 0) return;
        setElements(prev => {
            const next = redoStack.current.pop()!;
            undoStack.current.push(structuredClone(prev));
            return next;
        });
    }, []);

    const addElement = useCallback((type: 'div' | 'text' |  'chartBarHorizontal'  | 'chartPie' | 'chartLine' | 'chartDonut' | 'chartBar' | 'table' , options: AddElementOptions) => {
        const newId = crypto.randomUUID();
        let newElement: ElementNode;
        const baseStyle = { ...options.style, position: 'absolute' as const };

        if (type === 'div') {
            newElement = {
                id: newId,
                type: 'div',
                name: 'New Frame',
                style: {
                    width: '300px',
                    height: '200px',
                    backgroundColor: 'rgba(217, 217, 217, 1)',
                    ...baseStyle,
                },
                children: [],
            };
        } else {
            newElement = {
                id: newId,
                type: 'text',
                name: 'New Text',
                style: {
                    fontSize: '16px',
                    color: 'rgba(0, 0, 0, 1)',
                    width: 'auto',
                    height: 'auto',
                    ...baseStyle,
                },
            };
        }

        updateElementsWithHistory((current) => {
            const [, updated] = insert(current, newElement, options.parentId || '1', 'inside');
            return updated;
        });
        setSelectedId(newId);
    }, []);

    const updateElementStyle = useCallback((id: string, newStyle: React.CSSProperties) => {
        updateElementsWithHistory(prev => {
            let changed = false;

            const updateNode = (node: ElementNode): ElementNode => {
                if (node.id === id) {
                    const updatedStyle = { ...node.style, ...newStyle };

                    const hasChanged = Object.entries(newStyle).some(
                        ([key, value]) => node.style?.[key as keyof React.CSSProperties] !== value
                    );

                    if (!hasChanged) return node;

                    changed = true;
                    return { ...node, style: updatedStyle };
                }

                if (node.children) {
                    const updatedChildren = node.children.map(updateNode);
                    if (changed) return { ...node, children: updatedChildren };
                }

                return node;
            };

            const updatedTree = prev.map(updateNode);
            return changed ? updatedTree : prev;
        });
    }, []);


    const moveElement = useCallback((options: MoveElementOptions) => {
        const { draggedId, targetId, position } = options;
        if (draggedId === targetId) return;

        updateElementsWithHistory(currentElements => {
            const [draggedNode, treeWithoutDragged] = findAndRemove(currentElements, draggedId);
            if (!draggedNode) return currentElements;

            if (targetId === null) {
                const root = treeWithoutDragged.find(n => n.type === 'frame');
                if (root) {
                    root.children = [...(root.children || []), draggedNode];
                    return [...treeWithoutDragged];
                }
                return [...treeWithoutDragged, draggedNode];
            }

            const [, finalTree] = insert(treeWithoutDragged, draggedNode, targetId, position);
            return finalTree;
        });
    }, []);

    const copySelectedElement = useCallback(() => {
        if (!selectedId) return;
        const elementToCopy = findNode(elements, selectedId);
        if (elementToCopy) {
            setCopiedElement(JSON.parse(JSON.stringify(elementToCopy)));
        }
    }, [selectedId, elements]);

    const pasteElement = useCallback(() => {
        if (!copiedElement) return;

        const cloned = deepCloneAndAssignNewIds(copiedElement);
        
        cloned.style = { ...cloned.style, position: 'relative' };

        const parentId = selectedId || '1';

        updateElementsWithHistory(prev => {
            const [, tree] = insert(prev, cloned, parentId, 'inside');
            return tree;
        });

        setSelectedId(cloned.id);
    }, [copiedElement, selectedId]);

    const contextValue = useMemo(() => ({
        elements, setElements,
        selectedId, setSelectedId,
        elementsRef,
        activeTool, setActiveTool,
        addElement, updateElementStyle,
        moveElement,
        copySelectedElement,
        pasteElement,
        undo, redo,
    }), [elements, selectedId, activeTool, addElement, updateElementStyle, moveElement, copySelectedElement, pasteElement, undo, redo]);

    return (
        <CanvasContext.Provider value={contextValue}>
            {children}
        </CanvasContext.Provider>
    );
}

export function useCanvas() {
    const ctx = useContext(CanvasContext);
    if (!ctx) throw new Error('useCanvas deve ser usado dentro de CanvasProvider');
    return ctx;
}
