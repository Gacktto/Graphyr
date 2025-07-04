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
};

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

const insertNodeIntoTree = (
    nodes: ElementNode[],
    newNode: ElementNode,
    parentId: string | null
): ElementNode[] => {
    if (parentId === null) {
        const rootFrameIndex = nodes.findIndex((n) => n.type === 'frame');
        if (rootFrameIndex !== -1) {
            const newNodes = [...nodes];
            const rootFrame = { ...newNodes[rootFrameIndex] };
            rootFrame.children = [...(rootFrame.children || []), newNode];
            newNodes[rootFrameIndex] = rootFrame;
            return newNodes;
        }
        return [...nodes, newNode];
    }

    return nodes.map((node) => {
        if (node.id === parentId) {
            return { ...node, children: [...(node.children || []), newNode] };
        }
        if (node.children) {
            return {
                ...node,
                children: insertNodeIntoTree(node.children, newNode, parentId),
            };
        }
        return node;
    });
};

export function CanvasProvider({ children }: { children: ReactNode }) {
    const elementsRef = useRef<Record<string, HTMLElement | null>>({});
    const [elements, setElements] = useState<ElementNode[]>([
        {
            id: '1',
            type: 'frame',
            name: 'Default',
            style: {
                width: '1600px',
                height: '600px',
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

            const baseStyle = { ...options.style };

            if (type === 'div') {
                const defaultDivStyle = {
                    width: '300px',
                    height: '200px',
                    backgroundColor: 'rgba(217, 217, 217, 1)',
                };

                newElement = {
                    id: newId,
                    type: 'div',
                    name: 'New Frame',
                    style: { ...defaultDivStyle, ...baseStyle },
                    children: [],
                };
            } else {
                const defaultTextStyle = {
                    fontSize: '16px',
                    color: 'rgba(0, 0, 0, 1)',
                    width: 'auto',
                    height: 'auto',
                };

                newElement = {
                    id: newId,
                    type: 'text',
                    name: 'New Text',
                    style: { ...defaultTextStyle, ...baseStyle },
                };
            }

            setElements((currentElements) =>
                insertNodeIntoTree(
                    currentElements,
                    newElement,
                    options.parentId
                )
            );
            setSelectedId(newId);
        },
        []
    );

     const updateElementStyle = useCallback((id: string, newStyle: React.CSSProperties) => {
        setElements((prevElements) => {
            const updateNode = (node: ElementNode): ElementNode => {
                if (node.id === id) {
                    return {
                        ...node,
                        style: {
                            ...node.style,
                            ...newStyle,
                        },
                    };
                }
                if (node.children) {
                    return {
                        ...node,
                        children: node.children.map(updateNode),
                    };
                }
                return node;
            };
            // Usamos uma verificação simples para evitar re-renderizações desnecessárias
            const newElements = prevElements.map(updateNode);
            return JSON.stringify(newElements) === JSON.stringify(prevElements) 
                ? prevElements 
                : newElements;
        });
    }, []); // Dependência vazia pois `setElements` é estáve

    const contextValue = useMemo(
        () => ({
            elements,
            setElements,
            selectedId,
            setSelectedId,
            elementsRef,
            activeTool,
            setActiveTool,
            addElement,
            updateElementStyle
        }),
        [elements, selectedId, activeTool, addElement, updateElementStyle]
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
