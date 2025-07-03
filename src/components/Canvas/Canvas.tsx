// src/components/Canvas/Canvas.tsx
import { useRef } from 'react';
import styles from '../../styles/Canvas.module.css';
import { useCanvasTransform } from './useCanvasTransform';
import { renderElement } from '../Elements/renderElement';
import { useCanvas } from '../../context/CanvasContext';

export default function Canvas() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);

    const { elements, selectedId, setSelectedId } = useCanvas();
    const { scale, offset } = useCanvasTransform(
        canvasRef as React.RefObject<HTMLDivElement>,
        innerRef as React.RefObject<HTMLDivElement>
    );

    return (
        <div ref={canvasRef} className={styles.canvas}>
            <div
                ref={innerRef}
                style={{
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                    transformOrigin: 'top left',
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                }}
            >
                {elements.map((el) =>
                    renderElement(el, selectedId, setSelectedId)
                )}
            </div>
        </div>
    );
}
