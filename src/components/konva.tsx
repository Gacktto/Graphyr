import React, { useRef, useEffect, useState, Fragment } from 'react';
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';

// Tipagem dos atributos de um retângulo
interface RectShape {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  id: string;
}

// Props para o componente Rectangle
interface RectangleProps {
  shapeProps: RectShape;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: RectShape) => void;
}



const Rectangle: React.FC<RectangleProps> = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
}) => {
  const shapeRef = useRef<Konva.Rect>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <Fragment>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragStart={onSelect}
        onDragEnd={(e: KonvaEventObject<DragEvent>) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (!node) return;

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);

          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </Fragment>
  );
};

const initialRectangles: RectShape[]  = [
  {
    x: (window.innerWidth / 2) - 300 / 2 ,
    y: (window.innerHeight / 2) - 300 / 2,
    width: 300,
    height: 300,
    fill: 'green',
    id: 'rect2',
  },
];

const Tk: React.FC = () => {
  const [rectangles, setRectangles] = useState<RectShape[]>(initialRectangles);
  const [selectedId, selectShape] = useState<string | null>(null);
  const stageRef = useRef<Konva.Stage>(null);

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const scaleBy = 1.05;
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    // Posição relativa ao canvas
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    // Novo scale (zoom in/out)
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    stage.scale({ x: newScale, y: newScale });

    // Reposiciona o stage para que o zoom ocorra no ponteiro
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();
  };



  const checkDeselect = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  return (
    <Stage
      width={1200}
      height={window.innerHeight}
      onMouseDown={checkDeselect}
      onTouchStart={checkDeselect}
      ref={stageRef}
      onWheel={handleWheel}
    >
      <Layer>
        {rectangles.map((rect, i) => (
          <Rectangle
            key={rect.id}
            shapeProps={rect}
            isSelected={rect.id === selectedId}
            onSelect={() => selectShape(rect.id)}
            onChange={(newAttrs) => {
              const rects = rectangles.slice();
              rects[i] = newAttrs;
              setRectangles(rects);
            }}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default Tk;
