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

export type ActiveTool = 'cursor' | 'text' | 'div';

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
    addElement: (type: 'div' | 'text', options: AddElementOptions) => void;
    updateElementStyle: (id: string, newStyle: React.CSSProperties) => void;
    moveElement: (options: MoveElementOptions) => void;
};

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

// --- FUNÇÕES UTILITÁRIAS ROBUSTAS PARA MANIPULAR A ÁRVORE ---

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

    const addElement = useCallback(
        (type: 'div' | 'text', options: AddElementOptions) => {
            const newId = crypto.randomUUID();
            let newElement: ElementNode;
            const baseStyle = { ...options.style, position: 'absolute' as const };
            if (type === 'div') {
                const defaultDivStyle = {
                    width: '300px',
                    height: '200px',
                    backgroundColor: 'rgba(217, 217, 217, 1)',
                };
                newElement = {
                    id: newId, type: 'div', name: 'New Frame',
                    style: { ...defaultDivStyle, ...baseStyle },
                    children: [],
                };
            } else {
                const defaultTextStyle = {
                    fontSize: '16px', color: 'rgba(0, 0, 0, 1)',
                    width: 'auto', height: 'auto',
                };
                newElement = {
                    id: newId, type: 'text', name: 'New Text',
                    style: { ...defaultTextStyle, ...baseStyle },
                };
            }
            setElements((currentElements) => {
                const [, newTree] = insert(currentElements, newElement, options.parentId!, 'inside');
                return newTree;
            });
            setSelectedId(newId);
        },
        []
    );

    const updateElementStyle = useCallback(
        (id: string, newStyle: React.CSSProperties) => {
            setElements((prevElements) => {
                const updateNode = (node: ElementNode): ElementNode => {
                    if (node.id === id) {
                        return { ...node, style: { ...node.style, ...newStyle } };
                    }
                    if (node.children) {
                        return { ...node, children: node.children.map(updateNode) };
                    }
                    return node;
                };
                return prevElements.map(updateNode);
            });
        },
        []
    );

    const moveElement = useCallback((options: MoveElementOptions) => {
        const { draggedId, targetId, position } = options;
        if (draggedId === targetId) return;

        setElements(currentElements => {
            const [draggedNode, treeWithoutDragged] = findAndRemove(currentElements, draggedId);
            if (!draggedNode) return currentElements;
            
            if (targetId === null) {
                const rootFrameIndex = treeWithoutDragged.findIndex(n => n.type === 'frame');
                if (rootFrameIndex !== -1) {
                    const newTree = [...treeWithoutDragged];
                    const rootFrame = {...newTree[rootFrameIndex]};
                    rootFrame.children = [...(rootFrame.children || []), draggedNode];
                    newTree[rootFrameIndex] = rootFrame;
                    return newTree;
                }
                 return [...treeWithoutDragged, draggedNode];
            }

            const [, finalTree] = insert(treeWithoutDragged, draggedNode, targetId, position);
            return finalTree;
        });
    }, []);

    const contextValue = useMemo(
        () => ({
            elements, setElements,
            selectedId, setSelectedId,
            elementsRef,
            activeTool, setActiveTool,
            addElement, updateElementStyle,
            moveElement,
        }),
        [elements, selectedId, activeTool, addElement, updateElementStyle, moveElement]
    );

    return (
        <CanvasContext.Provider value={contextValue}>
            {children}
        </CanvasContext.Provider>
    );
}

export function useCanvas() {
    const ctx = useContext(CanvasContext);
    if (!ctx)
        throw new Error('useCanvas deve ser usado dentro de CanvasProvider');
    return ctx;
}