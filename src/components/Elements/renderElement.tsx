import React, { type JSX } from "react";
import type { ElementNode } from "../TreeView/TreeView";

export function renderElement(
  node: ElementNode,
  selectedId: string | null,
  onSelect: (id: string) => void
): JSX.Element | null {
  const isSelected = node.id === selectedId;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.id);
  };

  const commonStyle: React.CSSProperties = {
    outline: isSelected ? "2px solid #007aff" : "none",
    position: "absolute",
    top: node.type === "div" ? 100 : 150,
    left: node.type === "div" ? 100 : 200,
    padding: 10,
  };

  switch (node.type) {
    case "frame":
      return (
        <div
          key={node.id}
          data-canvas-element
          onClick={handleClick}
          style={{
            outline: isSelected ? "2px solid #007aff" : "none",
            margin: "0 auto",
            width: 1300,
            minHeight: 600,
            backgroundColor: "#fff",
            position: "relative",
          }}
        >
          {node.children?.map((child) =>
            renderElement(child, selectedId, onSelect)
          )}
        </div>
      );

    case "div":
      return (
        <div
          key={node.id}
          data-canvas-element
          onClick={handleClick}
          style={{
            ...commonStyle,
            backgroundColor: "red",
            width: 200,
            height: 200,
          }}
        >
          {node.name}
          {node.children?.map((child) =>
            renderElement(child, selectedId, onSelect)
          )}
        </div>
      );

    case "button":
      return (
        <button
          key={node.id}
          data-canvas-element
          onClick={handleClick}
          style={{
            ...commonStyle,
            backgroundColor: "#007aff",
            color: "#fff",
            width: "fit-content",
            padding: 0,
          }}
        >
          {node.name}
        </button>
      );

    default:
      return null;
  }
}
