import styles from '../../../styles/Sidebar.module.css';
import buttonStyles from '../../../styles/Buttons.module.css';
import { GlobeIcon, ShareFatIcon } from '@phosphor-icons/react';
import {
    useEffect,
    useState,
    useRef,
    useLayoutEffect,
    useCallback,
} from 'react';

import { useCanvas } from '../../../context/CanvasContext';
import type { ElementNode } from '../../TreeView/TreeView';

import { ColorPicker } from '../../ColorPicker/ColorPicker';

import { AppearanceSection } from './sections/AppearenceSection';
import { PositionSection } from './sections/PositionSection';
import { LayoutSection } from './sections/LayoutSection';
import { StrokeSection } from './sections/StrokeSection';
import { EffectsSection } from './sections/EffectsSection';

type PickerState = {
    id: string;
    // property: keyof React.CSSProperties;
    triggerRect: DOMRect;
    initialColor: string;
    onChangeCallback?: (newColor: string) => void;
};

export default function Rightbar() {
    const { elements, selectedId, elementsRef, updateElementStyle } =
        useCanvas();
    const selectedElement = findElementById(elements, selectedId);
    const [computedStyles, setComputedStyles] =
        useState<CSSStyleDeclaration | null>(null);

    const [pickerState, setPickerState] = useState<PickerState | null>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedId && elementsRef.current[selectedId]) {
            const el = elementsRef.current[selectedId]!;
            const computed = getComputedStyle(el);
            setComputedStyles(computed);
        } else {
            setComputedStyles(null);
        }
    }, [selectedId, elementsRef]);

    function findElementById(
        nodes: ElementNode[],
        id: string | null
    ): ElementNode | null {
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
                const found = findElementById(node.children, id);
                if (found) return found;
            }
        }
        return null;
    }

    const handleStyleChange = useCallback(
        (newStyle: React.CSSProperties) => {
            if (selectedId) {
                updateElementStyle(selectedId, newStyle);
            }
        },
        [selectedId, updateElementStyle]
    );

    const handleColorControlClick = (
        event: React.MouseEvent,
        propertyOrId: string,
        onChange?: (newColor: string) => void,
        currentValue?: string
    ) => {
        if (pickerState?.id === propertyOrId) {
            setPickerState(null);
        } else {
            const initialColor = onChange
                ? currentValue || '#000000'
                : (selectedElement?.style?.[
                      propertyOrId as keyof React.CSSProperties
                  ] as string) || '#000000';

            setPickerState({
                id: propertyOrId,
                triggerRect: event.currentTarget.getBoundingClientRect(),
                initialColor: initialColor,
                onChangeCallback: onChange,
            });
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(event.target as Node)
            ) {
                setPickerState(null);
            }
        };
        if (pickerState) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [pickerState]);

    useLayoutEffect(() => {
        if (pickerState && pickerRef.current && menuRef.current) {
            const pickerEl = pickerRef.current;
            const menuRect = menuRef.current.getBoundingClientRect();
            const pickerRect = pickerEl.getBoundingClientRect();
            const triggerRect = pickerState.triggerRect;

            const spaceBelow = menuRect.bottom - triggerRect.bottom;
            const spaceAbove = triggerRect.top - menuRect.top;

            let finalTop = triggerRect.bottom + 5;
            if (
                spaceBelow < pickerRect.height + 5 &&
                spaceAbove > pickerRect.height + 5
            ) {
                finalTop = triggerRect.top - pickerRect.height - 5;
            }
            if (finalTop + pickerRect.height > menuRect.bottom) {
                finalTop = menuRect.bottom - pickerRect.height - 5;
            }
            if (finalTop < menuRect.top) {
                finalTop = menuRect.top + 5;
            }

            let finalLeft = triggerRect.left;
            if (finalLeft + pickerRect.width > window.innerWidth) {
                finalLeft = window.innerWidth - pickerRect.width - 5;
            }
            if (finalLeft < menuRect.left) {
                finalLeft = menuRect.left + 5;
            }

            pickerEl.style.top = `${finalTop}px`;
            pickerEl.style.left = `${finalLeft}px`;
            pickerEl.style.opacity = '1';
        }
    }, [pickerState]);

    return (
        <div className={styles.sidebar} style={{ right: 0 }}>
            <div
                ref={menuRef}
                className={styles.menu}
                style={{ borderLeft: '1px solid #3c3c3c' }}
            >
                {/* Section Start */}
                <div className={styles.section}>
                    <div className={styles.container}>
                        <div
                            className={`${buttonStyles.button} ${buttonStyles.primary}`}
                        >
                            Publish
                            <GlobeIcon size={20} className={styles.icon} />
                        </div>
                        <div
                            className={`${buttonStyles.button} ${buttonStyles.primary}`}
                        >
                            {/* Share */}
                            <ShareFatIcon
                                weight="fill"
                                size={20}
                                className={styles.icon}
                            />
                        </div>
                    </div>
                </div>

                {selectedElement ? (
                    <>
                        <PositionSection
                            selectedElement={selectedElement}
                            computedStyles={computedStyles}
                            onStyleChange={handleStyleChange}
                        />

                        <LayoutSection
                            selectedElement={selectedElement}
                            computedStyles={computedStyles}
                            onStyleChange={handleStyleChange}
                        />

                        <AppearanceSection
                            selectedElement={selectedElement}
                            computedStyles={computedStyles}
                            onStyleChange={handleStyleChange}
                            onColorControlClick={handleColorControlClick}
                        />
                        <StrokeSection
                            selectedElement={selectedElement}
                            computedStyles={computedStyles}
                            onStyleChange={handleStyleChange}
                            onColorControlClick={handleColorControlClick}
                        />
                        <EffectsSection
                            selectedElement={selectedElement}
                            onStyleChange={handleStyleChange}
                            onColorControlClick={handleColorControlClick}
                        />
                    </>
                ) : (
                    <div className={styles.section}>
                        <p style={{ textAlign: 'center', opacity: 0.5 }}>
                            Selecione um elemento para editar.
                        </p>
                    </div>
                )}
            </div>
            {pickerState && selectedElement && (
                <div
                    ref={pickerRef}
                    style={{
                        position: 'fixed',
                        opacity: 0,
                        top: '-9999px',
                        left: '-9999px',
                        zIndex: 1000,
                        transition: 'opacity 0.1s ease-in-out',
                    }}
                >
                    <ColorPicker
                        key={`${selectedId}-${pickerState.id}`}
                        color={pickerState.initialColor}
                        onChange={(newColor) => {
                            if (pickerState.onChangeCallback) {
                                pickerState.onChangeCallback(newColor);
                            } else {
                                updateElementStyle(selectedId!, {
                                    [pickerState.id]: newColor,
                                });
                            }
                        }}
                        debounceMs={50}
                    />
                </div>
            )}
        </div>
    );
}
