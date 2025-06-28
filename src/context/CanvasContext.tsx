import { createContext, useContext, useState, type ReactNode } from "react";
import type { ElementNode } from "../components/TreeView/TreeView";

type CanvasContextType = {
  elements: ElementNode[];
  setElements: (els: ElementNode[]) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
};

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [elements, setElements] = useState<ElementNode[]>([
    {
      id: "1",
      type: "frame",
      name: "Default",
      children: [
        { id: "2", type: "div", name: "Box 1", children: [
            {id: "4", type: "div", name: "Box 4"}
        ] },
        { id: "3", type: "button", name: "Click Me" },
      ],
    },
  ]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <CanvasContext.Provider value={{ elements, setElements, selectedId, setSelectedId }}>
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvas() {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvas deve ser usado dentro de CanvasProvider");
  return ctx;
}
