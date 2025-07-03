import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

type Offset = { x: number; y: number };

export function useCanvasTransform(
    canvasRef: RefObject<HTMLDivElement>,
    innerRef: RefObject<HTMLDivElement>
) {
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });

    const isPanning = useRef(false);
    const panStart = useRef({ x: 0, y: 0 });
    const offsetStart = useRef<Offset>({ x: 0, y: 0 });

    // --- Zoom com CTRL + Wheel ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleWheel = (e: WheelEvent) => {
            if (!e.ctrlKey) return;
            e.preventDefault();

            const zoomIntensity = 0.0015;
            const delta = -e.deltaY;
            const newScale = Math.min(
                Math.max(scale + delta * zoomIntensity, 0.3),
                4
            );

            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const dx = (mouseX - offset.x) / scale;
            const dy = (mouseY - offset.y) / scale;

            const newOffsetX = mouseX - dx * newScale;
            const newOffsetY = mouseY - dy * newScale;

            setScale(newScale);
            setOffset({ x: newOffsetX, y: newOffsetY });
        };

        canvas.addEventListener('wheel', handleWheel, { passive: false });
        return () => canvas.removeEventListener('wheel', handleWheel);
    }, [canvasRef, scale, offset]);

    // --- Pan com botão esquerdo ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const spacePressed = { current: false };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                spacePressed.current = true;
                if (!isPanning.current) {
                    canvas.style.cursor = 'grab';
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                spacePressed.current = false;
                if (!isPanning.current) {
                    canvas.style.cursor = 'default';
                }
            }
        };

        const handleMouseDown = (e: MouseEvent) => {
            if (e.button !== 0 || !spacePressed.current) return;
            isPanning.current = true;
            panStart.current = { x: e.clientX, y: e.clientY };
            offsetStart.current = { ...offset };
            canvas.style.cursor = 'grabbing';
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isPanning.current) return;
            const dx = e.clientX - panStart.current.x;
            const dy = e.clientY - panStart.current.y;
            setOffset({
                x: offsetStart.current.x + dx,
                y: offsetStart.current.y + dy,
            });
        };

        const handleMouseUp = () => {
            isPanning.current = false;
            canvas.style.cursor = spacePressed.current ? 'grab' : 'default';
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        canvas.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            canvas.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [canvasRef, offset, setOffset]);

    // --- Auto centralizar elementos visíveis ---
    useEffect(() => {
        const canvas = canvasRef.current;
        const inner = innerRef.current;
        if (!canvas || !inner) return;

        const centerView = () => {
            const elements = inner.querySelectorAll('[data-canvas-element]');
            if (elements.length === 0) return;

            let minX = Infinity,
                minY = Infinity,
                maxX = -Infinity,
                maxY = -Infinity;

            elements.forEach((el) => {
                const rect = el.getBoundingClientRect();
                const { left, top, right, bottom } = rect;
                minX = Math.min(minX, left);
                minY = Math.min(minY, top);
                maxX = Math.max(maxX, right);
                maxY = Math.max(maxY, bottom);
            });

            const contentCenterX = (minX + maxX) / 2;
            const contentCenterY = (minY + maxY) / 2;

            const canvasRect = canvas.getBoundingClientRect();
            const canvasCenterX = canvasRect.width / 2;
            const canvasCenterY = canvasRect.height / 2;

            const dx = canvasCenterX - contentCenterX;
            const dy = canvasCenterY - contentCenterY;

            setOffset({ x: dx, y: dy });
        };

        setTimeout(centerView, 0);
    }, [canvasRef, innerRef]);

    return { scale, offset };
}
