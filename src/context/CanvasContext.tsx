import {
    createContext,
    useContext,
    useState,
    useRef,
    type ReactNode,
    useMemo,
} from 'react';
import type { ElementNode } from '../components/TreeView/TreeView';

type CanvasContextType = {
    elements: ElementNode[];
    setElements: React.Dispatch<React.SetStateAction<ElementNode[]>>;
    selectedId: string | null;
    setSelectedId: (id: string | null) => void;
    elementsRef: React.MutableRefObject<Record<string, HTMLElement | null>>;
};

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export function CanvasProvider({ children }: { children: ReactNode }) {
    const elementsRef = useRef<Record<string, HTMLElement | null>>({});
    const [elements, setElements] = useState<ElementNode[]>([
        {
            id: '1',
            type: 'frame',
            name: 'Default',
            children: [
                {
                    id: '2',
                    type: 'div',
                    name: 'Box 1',
                    children: [{ id: '4', type: 'div', name: 'Box 4' }],
                },
                { id: '3', type: 'button', name: 'Click Me' },
            ],
        },
    ]);

    const [selectedId, setSelectedId] = useState<string | null>(null);

    const contextValue = useMemo(
        () => ({
            elements,
            setElements,
            selectedId,
            setSelectedId,
            elementsRef,
        }),
        [elements, selectedId]
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
