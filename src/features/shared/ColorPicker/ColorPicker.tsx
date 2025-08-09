import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    useMemo,
} from 'react';
import {
    hsvaToRgba,
    rgbaToHex,
    rgbaToHsva,
    hexToRgba,
    type HSVA,
    type RGBA,
} from './color';
import styles from '../styles/Sidebar.module.css';
import './ColorPicker.css';

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

interface ColorPickerProps {
    color: string;
    onChange: (color: string) => void;
    debounceMs?: number;
}

const parseColor = (color: string): RGBA => {
    if (color.startsWith('rgba')) {
        const parts = color
            .substring(5, color.length - 1)
            .split(',')
            .map((s) => parseFloat(s.trim()));
        return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] };
    }
    const rgba = hexToRgba(color);
    return rgba ? { ...rgba, a: 1 } : { r: 255, g: 0, b: 0, a: 1 };
};

export const ColorPicker: React.FC<ColorPickerProps> = ({
    color,
    onChange,
    debounceMs = 100,
}) => {
    const [hsva, setHsva] = useState<HSVA>(() => rgbaToHsva(parseColor(color)));
    const interactionRef = useRef(false);
    const saturationRef = useRef<HTMLDivElement>(null);
    const hueRef = useRef<HTMLDivElement>(null);
    const alphaRef = useRef<HTMLDivElement>(null);

    const rgba = useMemo(() => hsvaToRgba(hsva), [hsva]);
    const debouncedRgba = useDebounce(rgba, debounceMs);

    useEffect(() => {
        const roundedRgba = {
            r: Math.round(debouncedRgba.r),
            g: Math.round(debouncedRgba.g),
            b: Math.round(debouncedRgba.b),
            a: debouncedRgba.a,
        };
        const newColor = `rgba(${roundedRgba.r}, ${roundedRgba.g}, ${roundedRgba.b}, ${roundedRgba.a})`;
        onChange(newColor);
    }, [debouncedRgba, onChange]);

    useEffect(() => {
        interactionRef.current = false;
        const newHsva = rgbaToHsva(parseColor(color));
        if (
            Math.round(newHsva.h) !== Math.round(hsva.h) ||
            Math.round(newHsva.s) !== Math.round(hsva.s) ||
            Math.round(newHsva.v) !== Math.round(hsva.v) ||
            Math.round(newHsva.a * 100) !== Math.round(hsva.a * 100)
        ) {
            setHsva(newHsva);
        }
    }, [color]);

    const handleDrag = useCallback(
        (
            e: MouseEvent | TouchEvent,
            ref: React.RefObject<HTMLDivElement | null>,
            updater: (coords: { x: number; y: number }, rect: DOMRect) => void
        ) => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
            const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
            updater({ x, y }, rect);
        },
        []
    );

    const createDragHandler = (
        ref: React.RefObject<HTMLDivElement | null>,
        updater: (coords: { x: number; y: number }, rect: DOMRect) => void
    ) => {
        return (startEvent: React.MouseEvent | React.TouchEvent) => {
            if (interactionRef.current) return;
            interactionRef.current = true;

            const onMove = (e: MouseEvent | TouchEvent) =>
                handleDrag(e, ref, updater);
            const onEnd = () => {
                interactionRef.current = false;
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onEnd);
                document.removeEventListener('touchmove', onMove);
                document.removeEventListener('touchend', onEnd);
            };

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onEnd);
            document.addEventListener('touchmove', onMove);
            document.addEventListener('touchend', onEnd);

            handleDrag(startEvent.nativeEvent, ref, updater);
        };
    };

    const handleSaturationChange = (
        { x, y }: { x: number; y: number },
        rect: DOMRect
    ) => {
        const s = (x / rect.width) * 100;
        const v = (1 - y / rect.height) * 100;
        setHsva((prev) => {
            if (
                Math.round(prev.s) === Math.round(s) &&
                Math.round(prev.v) === Math.round(v)
            )
                return prev;
            return { ...prev, s, v };
        });
    };

    const handleHueChange = ({ x }: { x: number }, rect: DOMRect) => {
        const h = (x / rect.width) * 360;
        setHsva((prev) =>
            Math.round(prev.h) === Math.round(h) ? prev : { ...prev, h }
        );
    };

    const handleAlphaChange = ({ x }: { x: number }, rect: DOMRect) => {
        const a = x / rect.width;
        setHsva((prev) =>
            Math.round(prev.a * 100) === Math.round(a * 100)
                ? prev
                : { ...prev, a }
        );
    };

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHex = e.target.value;
        const newRgba = hexToRgba(newHex);
        if (newRgba) setHsva(rgbaToHsva({ ...newRgba, a: hsva.a }));
    };

    const handleRgbaChange = (key: keyof RGBA, value: string) => {
        const num = parseFloat(value);
        if (isNaN(num)) return;
        const next = { r: rgba.r, g: rgba.g, b: rgba.b, a: rgba.a };
        next[key] =
            key === 'a'
                ? Math.max(0, Math.min(1, num))
                : Math.max(0, Math.min(255, Math.round(num)));
        setHsva(rgbaToHsva(next));
    };

    return (
        <div className="color-picker" onMouseDown={(e) => e.stopPropagation()}>
            <div
                className="saturation-box"
                style={{ backgroundColor: `hsl(${hsva.h}, 100%, 50%)` }}
                ref={saturationRef}
                onMouseDown={createDragHandler(
                    saturationRef,
                    handleSaturationChange
                )}
                onTouchStart={createDragHandler(
                    saturationRef,
                    handleSaturationChange
                )}
            >
                <div className="saturation-value-gradient" />
                <div className="saturation-black-gradient" />
                <div
                    className="picker-handle"
                    style={{
                        left: `${hsva.s}%`,
                        top: `${100 - hsva.v}%`,
                        backgroundColor: `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`,
                    }}
                />
            </div>
            <div className={'controls-wrapper'}>
                <div
                    className="color-preview"
                    style={{
                        backgroundColor: `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`,
                    }}
                />
                <div className="sliders">
                    <div
                        className="slider hue-slider"
                        ref={hueRef}
                        onMouseDown={createDragHandler(hueRef, handleHueChange)}
                        onTouchStart={createDragHandler(
                            hueRef,
                            handleHueChange
                        )}
                    >
                        <div
                            className="picker-handle"
                            style={{ left: `${(hsva.h / 360) * 100}%` }}
                        />
                    </div>
                    <div
                        className="slider alpha-slider"
                        ref={alphaRef}
                        onMouseDown={createDragHandler(
                            alphaRef,
                            handleAlphaChange
                        )}
                        onTouchStart={createDragHandler(
                            alphaRef,
                            handleAlphaChange
                        )}
                    >
                        <div
                            className="alpha-gradient"
                            style={{
                                background: `linear-gradient(to right, transparent, rgb(${rgba.r}, ${rgba.g}, ${rgba.b}))`,
                            }}
                        />
                        <div
                            className="picker-handle"
                            style={{
                                left: `${hsva.a * 100}%`,
                                backgroundColor: `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`,
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className={styles.group}>
                <div className={styles.groupInput}>
                    <div className={styles.inputLabel}>HEX</div>
                    <input
                        className={`${styles.input}`}
                        type="text"
                        value={rgbaToHex({
                            r: rgba.r,
                            g: rgba.g,
                            b: rgba.b,
                            a: rgba.a,
                        })}
                        onChange={handleHexChange}
                    />
                </div>
                <div
                    className={`${styles.group} ${styles.fill}`}
                    style={{ flexDirection: 'row', gap: '10px' }}
                >
                    <div className={styles.groupInput}>
                        <div className={styles.inputLabel}>R</div>
                        <input
                            className={`${styles.input} ${styles.number}`}
                            type="number"
                            min="0"
                            max="255"
                            value={rgba.r}
                            onChange={(e) =>
                                handleRgbaChange('r', e.target.value)
                            }
                        />
                    </div>
                    <div className={styles.groupInput}>
                        <div className={styles.inputLabel}>G</div>
                        <input
                            className={`${styles.input} ${styles.number}`}
                            type="number"
                            min="0"
                            max="255"
                            value={rgba.g}
                            onChange={(e) =>
                                handleRgbaChange('g', e.target.value)
                            }
                        />
                    </div>
                    <div className={styles.groupInput}>
                        <div className={styles.inputLabel}>B</div>
                        <input
                            className={`${styles.input} ${styles.number}`}
                            type="number"
                            min="0"
                            max="255"
                            value={rgba.b}
                            onChange={(e) =>
                                handleRgbaChange('b', e.target.value)
                            }
                        />
                    </div>
                    <div className={styles.groupInput}>
                        <div className={styles.inputLabel}>A</div>
                        <input
                            className={`${styles.input} ${styles.number}`}
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            value={rgba.a.toFixed(2)}
                            onChange={(e) =>
                                handleRgbaChange('a', e.target.value)
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
