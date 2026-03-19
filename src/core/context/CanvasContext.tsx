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

export type ActiveTool =
    | 'cursor'
    | 'text'
    | 'div'
    | 'chart';

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
    selectedIds: string[];
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
    toggleSelection: (id: string, multi: boolean) => void;
    elementsRef: React.MutableRefObject<Record<string, HTMLElement | null>>;
    activeTool: ActiveTool;
    setActiveTool: (tool: ActiveTool) => void;
    addElement: (
        type:
            | 'div'
            | 'text'
            | 'chart',
        options: AddElementOptions
    ) => void;
    updateElementStyle: (id: string, newStyle: React.CSSProperties) => void;
    moveElement: (options: MoveElementOptions) => void;
    copySelectedElement: () => void;
    pasteElement: () => void;
    undo: () => void;
    redo: () => void;
    deleteElement: (idToDelete: string) => void;
    updateElementChartProps: (id: string, newChartProps: Partial<ElementNode['chartProps']>) => void;
    updateElementData: (id: string, data: any[]) => void;
    updateElementProps: (id: string, props: Partial<ElementNode>) => void; // <-- Nova função
    // Novas tipagens:
    startInteraction: () => void;
    endInteraction: () => void;
};

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

// Essas funções de utilidade poderiam ser movidas para /src/lib/treeUtils.ts
// como sugerido anteriormente para organizar melhor o código.
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
            const [foundNode, newChildren] = findAndRemove(
                node.children,
                nodeId
            );
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
    const isInteractionActive = useRef(false);
    const stateBeforeInteraction = useRef<ElementNode[] | null>(null);

    // Congela o histórico e tira uma "foto" de como tudo estava antes do movimento
    const startInteraction = useCallback(() => {
        isInteractionActive.current = true;
        setElements((currentElements) => {
            stateBeforeInteraction.current = currentElements;
            return currentElements;
        });
    }, []);

    // Salva a "foto" inicial no histórico e retoma o registro normal
    const endInteraction = useCallback(() => {
        isInteractionActive.current = false;
        setElements((currentElements) => {
            if (
                stateBeforeInteraction.current && 
                stateBeforeInteraction.current !== currentElements
            ) {
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
    const [selectedIds, setSelectedIds] = useState<string[]>(['1']); // Frame default selecionado

    const toggleSelection = useCallback((id: string, multi: boolean) => {
        setSelectedIds((prev) => {
            if (multi) {
                // Se já estiver selecionado e segurar shift, remove. Senão, adiciona.
                return prev.includes(id) 
                    ? prev.filter((selectedIds) => selectedIds !== id) 
                    : [...prev, id];
            }
            // Se clicar sem shift, seleciona apenas ele
            return [id];
        });
    }, []);

    const [activeTool, setActiveTool] = useState<ActiveTool>('cursor');
    const [copiedElement, setCopiedElement] = useState<ElementNode | null>(
        null
    );

    const updateElementsWithHistory = useCallback(
        (nextState: ElementNode[]) => {
            setElements((prev) => {
                if (prev !== nextState && !isInteractionActive.current) {
                    undoStack.current.push(prev);
                    redoStack.current.length = 0; 
                }
                return nextState;
            });
        },
        []
    );
     
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

    const addElement = useCallback(
        (
            type:
                | 'div'
                | 'text'
                | 'chart',
            options: AddElementOptions
        ) => {
            const newId = crypto.randomUUID();
            let newElement: ElementNode;
            const baseStyle = { ...options.style };

            if (type.startsWith('chart')) {
                const variantMap: Record<string, ChartVariant> = {
                    chartBar: 'bar',
                    chartBarHorizontal: 'barHorizontal',
                    chartPie: 'pie',
                    chartDonut: 'donut',
                    chartLine: 'line',
                };

                const chartData = letterFrequency.slice(0, 255).map(d => ({ ...d, value: d.frequency * 100 }));

                newElement = {
                    id: newId,
                    type: 'chart',
                    name: 'New Chart',
                    style: {
                        width: '450px',
                        height: '300px',
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                        ...baseStyle,
                    },
                    data: [],
                    
                    chartProps: {
                        variant: variantMap[type] || 'bar',
                        options: {
                            labelKey: '',
                            valueKey: '',
                            showXAxis: true,
                            showYAxis: true,
                            barColor: 'rgba(0, 0, 0, 1)',
                            lineColor: 'rgba(0, 0, 0, 1)',
                            xAxisColor: 'rgba(0, 0, 0, 1)',
                            yAxisColor: 'rgba(0, 0, 0, 1)',
                            dotColor: 'rgba(0, 0, 0, 1)',
                            xTickStrokeColor: 'rgba(0, 0, 0, 1)',
                            yTickStrokeColor: 'rgba(0, 0, 0, 1)',
                            xTickLabelColor: 'rgba(0, 0, 0, 1)',
                            yTickLabelColor: 'rgba(0, 0, 0, 1)',
                        }
                    },
                };
            } else if (type === 'div') {
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

            updateElementsWithHistory(
                produce(elements, draft => {
                    const [, updated] = insert(
                        draft,
                        newElement,
                        options.parentId || '1',
                        'inside'
                    );
                    return updated;
                })
            );
            setSelectedIds(newId);

        },
        [elements, updateElementsWithHistory]
    );

    const updateElementData = useCallback(
        (id: string, data: any[]) => {
            updateElementsWithHistory(
                produce(elements, (draft) => {
                    const findAndUpdate = (nodes: ElementNode[]) => {
                        const node = nodes.find(n => n.id === id);
                        if (node) {
                            node.data = data;
                            if (node.chartProps?.options) {
                                node.chartProps.options.labelKey = '';
                                node.chartProps.options.valueKey = '';
                            }
                        } else {
                            nodes.forEach(n => n.children && findAndUpdate(n.children));
                        }
                    };
                    findAndUpdate(draft);
                })
            );
        },
        [elements, updateElementsWithHistory]
    );
    
    const updateElementChartProps = useCallback(
        (id: string, newChartProps: Partial<ElementNode['chartProps']>) => {
            updateElementsWithHistory(
                produce(elements, draft => {
                    const findAndUpdate = (nodes: ElementNode[]) => {
                        const node = nodes.find(n => n.id === id);
                        if (node) {
                            node.chartProps = {
                                ...node.chartProps,
                                ...newChartProps,
                                options: {
                                    ...node.chartProps?.options,
                                    ...newChartProps?.options,
                                },
                            } as ElementNode['chartProps'];
                        } else {
                             nodes.forEach(n => n.children && findAndUpdate(n.children));
                        }
                    };
                    findAndUpdate(draft);
                })
            );
        },
        [elements, updateElementsWithHistory]
    );

    const updateElementProps = useCallback(
        (id: string, propsToUpdate: Partial<ElementNode>) => {
            updateElementsWithHistory(
                produce(elements, (draft) => {
                    const findAndUpdate = (nodes: ElementNode[]): boolean => {
                        for (let i = 0; i < nodes.length; i++) {
                            if (nodes[i].id === id) {
                                Object.assign(nodes[i], propsToUpdate);
                                return true;
                            }
                            if (nodes[i].children && findAndUpdate(nodes[i].children!)) {
                                return true;
                            }
                        }
                        return false;
                    };
                    findAndUpdate(draft);
                })
            );
        },
        [elements, updateElementsWithHistory]
    );


    const updateElementStyle = useCallback(
        (id: string, newStyle: React.CSSProperties) => {
            updateElementsWithHistory(
                 produce(elements, draft => {
                     const findAndUpdate = (nodes: ElementNode[]) => {
                         const node = nodes.find(n => n.id === id);
                         if(node) {
                             node.style = {...node.style, ...newStyle};
                             if (newStyle.display === 'flex' && node.children) {
                                 node.children.forEach(child => {
                                     child.style = {...child.style, left: '', top: ''};
                                 });
                             }
                         } else {
                              nodes.forEach(n => n.children && findAndUpdate(n.children));
                         }
                     };
                     findAndUpdate(draft);
                 })
            );
        },
        [elements, updateElementsWithHistory]
    );

    const moveElement = useCallback((options: MoveElementOptions) => {
        const { draggedId, targetId, position } = options;
        if (draggedId === targetId) return;

        updateElementsWithHistory(
            produce(elements, draft => {
                const [draggedNode, treeWithoutDragged] = findAndRemove(draft, draggedId);
                if (!draggedNode) return;

                if (targetId === null) {
                    const root = treeWithoutDragged.find((n) => n.type === 'frame');
                    if (root) {
                        root.children = [...(root.children || []), draggedNode];
                    }
                    return treeWithoutDragged;
                }

                const [, finalTree] = insert(treeWithoutDragged, draggedNode, targetId, position);
                return finalTree;
            })
        );
    }, [elements, updateElementsWithHistory]);

    const copySelectedElement = useCallback(() => {
        if (!selectedIds) return;
        const elementToCopy = findNode(elements, selectedIds);
        if (elementToCopy) {
            setCopiedElement(JSON.parse(JSON.stringify(elementToCopy)));
        }
    }, [selectedIds, elements]);

    const pasteElement = useCallback(() => {
        if (!copiedElement) return;

        const cloned = deepCloneAndAssignNewIds(copiedElement);
        cloned.style = { ...cloned.style, position: 'relative' };

        const parentId = selectedIds || '1';

        updateElementsWithHistory(
            produce(elements, draft => {
                const [, tree] = insert(draft, cloned, parentId, 'inside');
                return tree;
            })
        );
    }, [copiedElement, selectedIds, elements, updateElementsWithHistory]);

    const deleteElement = useCallback(
        (idToDelete: string) => {
            if (idToDelete === '1') return;

            updateElementsWithHistory(
                produce(elements, draft => {
                    const [, newTree] = findAndRemove(draft, idToDelete);
                    return newTree;
                })
            );

            setSelectedIds((prev) => prev.filter(id => id !== idToDelete));
        },
        [selectedIds, elements, updateElementsWithHistory]
    );

    const contextValue = useMemo(
        () => ({
            elements,
            setElements,
            selectedIds,
            setSelectedIds,
            elementsRef,
            activeTool,
            setActiveTool,
            addElement,
            updateElementStyle,
            moveElement,
            copySelectedElement,
            pasteElement,
            undo,
            redo,
            deleteElement,
            updateElementChartProps,
            updateElementData,
            updateElementProps,
            startInteraction,
            endInteraction,
            toggleSelection
        }),
        [
            elements,
            selectedIds,
            activeTool,
            addElement,
            updateElementStyle,
            moveElement,
            copySelectedElement,
            pasteElement,
            undo,
            redo,
            deleteElement,
            updateElementChartProps,
            updateElementData,
            updateElementProps,
            startInteraction,
            endInteraction,
            toggleSelection
        ]
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