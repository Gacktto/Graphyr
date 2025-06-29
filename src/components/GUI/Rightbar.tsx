import styles from "../../styles/Sidebar.module.css"
import buttonStyles from "../../styles/Buttons.module.css"
import { 
    GlobeIcon, 
    ShareFatIcon,
    AlignBottomIcon,
    AlignLeftIcon,
    AlignRightIcon,
    AlignTopIcon,
    AlignCenterHorizontalIcon,
    AlignCenterVerticalIcon,
    FlipHorizontalIcon,
    FlipVerticalIcon,
    AngleIcon,
    ArrowFatLinesDownIcon,
    ArrowFatLinesUpIcon,
    ArrowFatLinesLeftIcon,
    ArrowFatLinesRightIcon,
    NetworkIcon,
    NetworkSlashIcon,
    CornersOutIcon,
    EyeIcon,
    DiceFiveIcon,
    EyeClosedIcon
} from "@phosphor-icons/react";
import { useEffect, useState, useCallback } from "react";

import { useCanvas } from "../../context/CanvasContext";
import type { ElementNode } from "../TreeView/TreeView";

import { ColorPicker } from "../ColorPicker/ColorPicker";

export default function Rightbar() {
    const { elements, setElements, selectedId, elementsRef } = useCanvas();
    const selectedElement = findElementById(elements, selectedId);
    const [computedStyles, setComputedStyles] = useState<CSSStyleDeclaration | null>(null);

    useEffect(() => {
        if (selectedId && elementsRef.current[selectedId]) {
            const el = elementsRef.current[selectedId]!;
            const computed = getComputedStyle(el);
            setComputedStyles(computed);
        } else {
            setComputedStyles(null);
        }
    }, [selectedId, elementsRef]);

    function findElementById(nodes: ElementNode[], id: string | null): ElementNode | null {
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
            const found = findElementById(node.children, id);
            if (found) return found;
            }
        }
        return null;
    }

    function updateElementStyle(id: string, newStyle: React.CSSProperties) {
  setElements((prevElements: ElementNode[]) => {
    let changed = false;

    const updateNode = (node: ElementNode): ElementNode => {
      if (node.id === id) {
        const currentStyle = node.style || {};
        const styleChanged = Object.entries(newStyle).some(([key, value]) => {
        return currentStyle[key as keyof React.CSSProperties] !== value;
        });
        if (!styleChanged) return node;
        changed = true;
        return {
          ...node,
          style: {
            ...currentStyle,
            ...newStyle,
          },
        };
      }

      if (node.children) {
        const newChildren = node.children.map(updateNode);
        if (newChildren.some((c, i) => c !== node.children![i])) {
          changed = true;
          return {
            ...node,
            children: newChildren,
          };
        }
      }

      return node;
    };

    const next = prevElements.map(updateNode);
    return changed ? next : prevElements;
  });
}



    const handleBackgroundColorChange = useCallback((newColor: string) => {
        if (selectedId) {
            updateElementStyle(selectedId, { backgroundColor: newColor });
        }
    }, [selectedId, updateElementStyle]);

    return (
        <div className={styles.sidebar} style={{right: 0}}>
            <div className={styles.menu} style={{borderLeft: "1px solid #3c3c3c"}}>
                
                {/* Section Start */}
                <div className={styles.section}>
                    <div className={styles.container}>
                        <div className={`${buttonStyles.button} ${buttonStyles.primary}`}>
                            Publish
                            <GlobeIcon size={20} className={styles.icon}/>
                        </div>
                        <div className={`${buttonStyles.button} ${buttonStyles.primary}`}>
                            {/* Share */}
                            <ShareFatIcon weight="fill" size={20} className={styles.icon}/>
                        </div>
                    </div>
                </div>

                {/* Section Start */}
                <div className={styles.section}>
                    <div className={styles.container} style={{flexDirection: "column"}}>
                        Position

                        {/* Row Start */}
                        <div className={styles.row}>
                            <div className={styles.group}>
                                <div className={styles.groupTitle}>Vertical Align</div>
                                <div className={styles.groupContent}>
                                    <AlignBottomIcon className={`${styles.icon} ${styles.button}`}/>
                                    <AlignCenterVerticalIcon className={`${styles.icon} ${styles.button}`}/>
                                    <AlignTopIcon className={`${styles.icon} ${styles.button}`}/>
                                </div>
                            </div>
                            <div className={styles.group}>
                                <div className={styles.groupTitle}>Horizontal Align</div>
                                <div className={styles.groupContent}>
                                    <AlignLeftIcon className={`${styles.icon} ${styles.button}`}/>
                                    <AlignCenterHorizontalIcon className={`${styles.icon} ${styles.button}`}/>
                                    <AlignRightIcon className={`${styles.icon} ${styles.button}`}/>
                                </div>
                            </div>
                            <div className={styles.group}>
                                <div className={styles.groupTitle}>Flip</div>
                                <div className={styles.groupContent}>
                                    <FlipHorizontalIcon className={`${styles.icon} ${styles.button}`}/>
                                    <FlipVerticalIcon className={`${styles.icon} ${styles.button}`}/>
                                </div>
                            </div>
                        </div>

                        {/* Row Start */}
                        <div className={styles.row}>
                            <div className={styles.group}>
                                <div className={styles.groupTitle}>Position</div>
                                <div className={styles.group} style={{flexDirection: "row", gap: "10px"}}>
                                    <div className={styles.groupInput}>
                                        <div className={styles.inputLabel}>X</div>
                                        <input type="text" className={styles.input}
                                            value={
                                                selectedElement?.style?.left !== undefined
                                                    ? String(selectedElement.style.left).replace("px", "")
                                                    : ""
                                            }
                                            placeholder={computedStyles?.left?.replace("px", "")}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                updateElementStyle(selectedId!, { left: value ? `${value}px` : undefined });
                                            }}
                                        />
                                    </div>
                                    <div className={styles.groupInput}>
                                        <div className={styles.inputLabel}>Y</div>
                                        <input type="text" className={styles.input}
                                            value={
                                                selectedElement?.style?.top !== undefined
                                                    ? String(selectedElement.style.top).replace("px", "")
                                                    : ""
                                            }
                                            placeholder={computedStyles?.top?.replace("px", "")}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                updateElementStyle(selectedId!, { top: value ? `${value}px` : undefined });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.group}>
                                <div className={styles.groupTitle}>Rotation</div>
                                <div className={styles.group} style={{flexDirection: "row"}}>
                                    <div className={styles.groupInput}>
                                        <div className={styles.inputLabel}><AngleIcon/></div>
                                        <input
                                            type="text" 
                                            className={styles.input}
                                            value={
                                                selectedElement?.style?.rotate !== undefined
                                                    ? String(selectedElement.style.rotate).replace("deg", "")
                                                    : ""
                                            }
                                            placeholder={computedStyles?.rotate?.replace("deg", "")}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                updateElementStyle(selectedId!, { rotate: value ? `${value}deg` : undefined });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Row Start */}
                        <div className={styles.row}>
                            <div className={styles.group}>
                                <div className={styles.groupTitle}>Type</div>
                                <div className={styles.groupContent}>
                                    <NetworkIcon className={`${styles.icon} ${styles.button}`}
                                        onClick={() => {
                                            const currentType = selectedElement?.style?.position;
                                            console.log(currentType);

                                            updateElementStyle(selectedId!, {
                                                position: currentType === "relative" ? currentType : "relative",
                                            });
                                        }}
                                    />
                                    <NetworkSlashIcon className={`${styles.icon} ${styles.button}`}
                                        onClick={() => {
                                            const currentType = selectedElement?.style?.position;
                                            console.log(currentType);

                                            updateElementStyle(selectedId!, {
                                                position: currentType === "absolute" ? currentType : "absolute",
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Start */}
                 <div className={styles.section}>
                    <div className={styles.container} style={{flexDirection: "column"}}>
                        Layout

                        {/* Row Start */}
                        <div className={styles.row}>
                            <div className={styles.group}>
                                <div className={styles.groupTitle}>Size</div>
                                <div className={styles.group} style={{flexDirection: "row", gap: "10px"}}>
                                    <div className={styles.groupInput}>
                                        <div className={styles.inputLabel}>W</div>
                                        <input 
                                            type="text" 
                                            className={styles.input}
                                            value={
                                                selectedElement?.style?.width !== undefined
                                                    ? String(selectedElement.style.width).replace("px", "")
                                                    : ""
                                            }
                                            placeholder={computedStyles?.width?.replace("px", "")}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                updateElementStyle(selectedId!, { width: value ? `${value}px` : undefined });
                                            }}
                                        />
                                    </div>
                                    <div className={styles.groupInput}>
                                        <div className={styles.inputLabel}>H</div>
                                        <input 
                                            type="text" 
                                            className={styles.input} 
                                            value={
                                                selectedElement?.style?.height !== undefined
                                                    ? String(selectedElement.style.height).replace("px", "")
                                                    : ""
                                            }
                                            placeholder={computedStyles?.height?.replace("px", "")}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                updateElementStyle(selectedId!, { height: value ? `${value}px` : undefined });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Row Start */}
                        <div className={styles.row}>
                            <div className={styles.group}>
                                <div className={styles.group} style={{flexDirection: "row", gap: "10px"}}>
                                    <div className={`${styles.groupInput} ${styles.disabled}`}>
                                        <div className={styles.inputLabel}>min</div>
                                        <input type="text" disabled className={styles.input}
                                            value={
                                                selectedElement?.style?.minWidth !== undefined
                                                    ? String(selectedElement.style.minWidth).replace("px", "")
                                                    : ""
                                            }
                                            placeholder={computedStyles?.minWidth?.replace("px", "")}
                                        />
                                    </div>
                                    <div className={`${styles.groupInput} ${styles.disabled}`}>
                                        <div className={styles.inputLabel}>max</div>
                                        <input type="text" disabled className={styles.input}
                                            value={
                                                selectedElement?.style?.maxWidth !== undefined
                                                    ? String(selectedElement.style.maxWidth).replace("px", "")
                                                    : ""
                                            }
                                            placeholder={computedStyles?.maxWidth?.replace("px", "")}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.group}>
                                <div className={styles.group} style={{flexDirection: "row", gap: "10px"}}>
                                    <div className={`${styles.groupInput} ${styles.disabled}`}>
                                        <div className={styles.inputLabel}>min</div>
                                        <input type="text" disabled className={styles.input}
                                            value={
                                                selectedElement?.style?.minHeight !== undefined
                                                    ? String(selectedElement.style.minHeight).replace("px", "")
                                                    : ""
                                            }
                                            placeholder={computedStyles?.minHeight?.replace("px", "")}
                                        />
                                    </div>
                                    <div className={`${styles.groupInput} ${styles.disabled}`}>
                                        <div className={styles.inputLabel}>max</div>
                                        <input type="text" disabled className={styles.input}
                                            value={
                                                selectedElement?.style?.maxHeight !== undefined
                                                    ? String(selectedElement.style.maxHeight).replace("px", "")
                                                    : ""
                                            }
                                            placeholder={computedStyles?.maxHeight?.replace("px", "")}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Row Start */}
                        <div className={styles.row}>
                            <div className={`${styles.group} ${styles.fill}`}>
                                <div className={styles.groupTitle}>Display Direction</div>
                                <div className={`${styles.groupContent} ${styles.buttonOptions}`}>
                                    <ArrowFatLinesDownIcon className={`${styles.icon} ${styles.button}`} 
                                        onClick={() => {
                                            const currentDisplay = selectedElement?.style?.display;
                                            console.log(currentDisplay);

                                            updateElementStyle(selectedId!, {
                                                display: currentDisplay === "flex" ? currentDisplay : "flex",
                                                flexDirection: "column"
                                            });
                                        }}
                                    />
                                    <ArrowFatLinesUpIcon className={`${styles.icon} ${styles.button}`}
                                        onClick={() => {
                                            const currentDisplay = selectedElement?.style?.display;

                                            updateElementStyle(selectedId!, {
                                                display: currentDisplay === "flex" ? currentDisplay : "flex",
                                                flexDirection: "column-reverse"
                                            });
                                        }}
                                    />
                                    <ArrowFatLinesRightIcon className={`${styles.icon} ${styles.button}`}
                                        onClick={() => {
                                            const currentDisplay = selectedElement?.style?.display;

                                            updateElementStyle(selectedId!, {
                                                display: currentDisplay === "flex" ? currentDisplay : "flex",
                                                flexDirection: "row"
                                            });
                                        }}
                                    />
                                    <ArrowFatLinesLeftIcon className={`${styles.icon} ${styles.button}`}
                                        onClick={() => {
                                            const currentDisplay = selectedElement?.style?.display;

                                            updateElementStyle(selectedId!, {
                                                display: currentDisplay === "flex" ? currentDisplay : "flex",
                                                flexDirection: "row-reverse"
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row Start */}
                        {["column", "column-reverse", "row", "row-reverse"].includes(selectedElement?.style?.flexDirection || "") && (
                        <div className={styles.row}>
                            <div className={`${styles.group} ${styles.fill}`}>
                                <div className={styles.groupTitle}>Align</div>

                                <div className={`${styles.groupContent} ${styles.buttonOptions}`}>
                                {/* Horizontal alignment (aparece se for column ou column-reverse) */}
                                {["column", "column-reverse"].includes(selectedElement?.style?.flexDirection || "") && (
                                    <>
                                    <AlignLeftIcon
                                        className={`${styles.icon} ${styles.button}`}
                                        onClick={() =>
                                            updateElementStyle(selectedId!, { alignItems: "flex-start" })
                                        }
                                    />
                                    <AlignCenterHorizontalIcon
                                        className={`${styles.icon} ${styles.button}`}
                                        onClick={() =>
                                            updateElementStyle(selectedId!, { alignItems: "center" })
                                        }
                                    />
                                    <AlignRightIcon
                                        className={`${styles.icon} ${styles.button}`}
                                        onClick={() =>
                                            updateElementStyle(selectedId!, { alignItems: "flex-end" })
                                        }
                                    />
                                    </>
                                )}

                                {/* Vertical alignment (aparece se for row ou row-reverse) */}
                                {["row", "row-reverse"].includes(selectedElement?.style?.flexDirection || "") && (
                                    <>
                                    <AlignTopIcon
                                        className={`${styles.icon} ${styles.button}`}
                                        onClick={() =>
                                            updateElementStyle(selectedId!, { alignItems: "flex-start" })
                                        }
                                    />
                                    <AlignCenterVerticalIcon
                                        className={`${styles.icon} ${styles.button}`}
                                        onClick={() =>
                                            updateElementStyle(selectedId!, { alignItems: "center" })
                                        }
                                    />
                                    <AlignBottomIcon
                                        className={`${styles.icon} ${styles.button}`}
                                        onClick={() =>
                                            updateElementStyle(selectedId!, { alignItems: "flex-end" })
                                        }
                                    />
                                    </>
                                )}
                                </div>

                            </div>
                        </div>
                        )}

                        {/* Row Start */}
                        <div className={styles.row}>
                            <div className={`${styles.group} ${styles.fill}`}>
                                <div className={styles.groupTitle}>Justify</div>
                                <div className={`${styles.groupInput}`}>
                                    <select
                                        className={`${styles.input} ${styles.select}`}
                                        value={selectedElement?.style?.justifyContent || ""}
                                        onChange={(e) =>
                                            updateElementStyle(selectedId!, {
                                                justifyContent: e.target.value || undefined,
                                            })
                                        }
                                    >
                                        <option value="">Default</option>
                                        <option value="flex-start">Start</option>
                                        <option value="center">Center</option>
                                        <option value="flex-end">End</option>
                                        <option value="space-between">Space Between</option>
                                        <option value="space-around">Space Around</option>
                                        <option value="space-evenly">Space Evenly</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.group}>
                                <div className={styles.groupTitle}>Gap</div>
                                <div className={`${styles.groupInput} ${["column", "column-reverse", "row", "row-reverse"].includes(selectedElement?.style?.flexDirection || "") ? "" : styles.disabled}`}>
                                    <input
                                        type="text" 
                                        disabled={
                                            ["column", "column-reverse", "row", "row-reverse"].includes(selectedElement?.style?.flexDirection || "") ? false : true
                                        } 
                                        className={styles.input}
                                        value={
                                            selectedElement?.style?.gap !== undefined
                                                ? String(selectedElement.style.gap).replace("px", "")
                                                : ""
                                        }
                                        placeholder={computedStyles?.gap?.replace("px", "")}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            updateElementStyle(selectedId!, { gap: value ? `${value}px` : undefined });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row Start */}
                        <div className={styles.row}>
                            <div className={styles.group}>
                                <div className={styles.groupTitle}>Padding</div>
                                <div className={styles.group} style={{flexDirection: "row", gap: "10px"}}>
                                    <div className={`${styles.groupInput}`}>
                                        <div className={styles.inputLabel}>T</div>
                                        <input
                                            type="text" 
                                            className={styles.input} 
                                            value={
                                                selectedElement?.style?.paddingTop !== undefined
                                                    ? String(selectedElement.style.paddingTop).replace("px", "")
                                                    : ""
                                            }
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                updateElementStyle(selectedId!, { paddingTop: value ? `${value}px` : undefined });
                                            }}
                                        />
                                    </div>
                                    <div className={`${styles.groupInput}`}>
                                        <div className={styles.inputLabel}>B</div>
                                        <input
                                            type="text" 
                                            className={styles.input} 
                                            value={
                                                selectedElement?.style?.paddingBottom !== undefined
                                                    ? String(selectedElement.style.paddingBottom).replace("px", "")
                                                    : ""
                                            }
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                updateElementStyle(selectedId!, { paddingBottom: value ? `${value}px` : undefined });
                                            }}
                                        />
                                    </div>
                                    <div className={`${styles.groupInput}`}>
                                        <div className={styles.inputLabel}>L</div>
                                        <input
                                            type="text" 
                                            className={styles.input} 
                                            value={
                                                selectedElement?.style?.paddingLeft !== undefined
                                                    ? String(selectedElement.style.paddingLeft).replace("px", "")
                                                    : ""
                                            }
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                updateElementStyle(selectedId!, { paddingLeft: value ? `${value}px` : undefined });
                                            }}
                                        />
                                    </div>
                                    <div className={`${styles.groupInput}`}>
                                        <div className={styles.inputLabel}>R</div>
                                        <input
                                            type="text" 
                                            className={styles.input} 
                                            value={
                                                selectedElement?.style?.paddingRight !== undefined
                                                    ? String(selectedElement.style.paddingRight).replace("px", "")
                                                    : ""
                                            }
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                updateElementStyle(selectedId!, { paddingRight: value ? `${value}px` : undefined });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Row Start */}
                        <div className={styles.row}>
                            <div className={`${styles.group} ${styles.fill}`}>
                                <div className={styles.groupTitle}>Overflow X</div>
                                <div className={`${styles.groupInput}`}>
                                    <select className={`${styles.input} ${styles.select}`}
                                        value={selectedElement?.style?.overflowX || ""}
                                        onChange={(e) =>
                                            updateElementStyle(selectedId!, {
                                                overflowX: e.target.value as React.CSSProperties["overflowX"] || "auto",
                                            })
                                        }
                                    >
                                        <option value="auto">Auto</option>
                                        <option value="hidden">Hidden</option>
                                        <option value="visible">Visible</option>
                                        <option value="scroll">Scroll</option>
                                    </select>
                                </div>
                            </div>
                            <div className={`${styles.group} ${styles.fill}`}>
                                <div className={styles.groupTitle}>Overflow Y</div>
                                <div className={`${styles.groupInput}`}>
                                    <select className={`${styles.input} ${styles.select}`}
                                        value={selectedElement?.style?.overflowY || ""}
                                        onChange={(e) =>
                                            updateElementStyle(selectedId!, {
                                                overflowY: e.target.value as React.CSSProperties["overflowY"] || "auto",
                                            })
                                        }
                                    >
                                        <option value="auto">Auto</option>
                                        <option value="hidden">Hidden</option>
                                        <option value="visible">Visible</option>
                                        <option value="scroll">Scroll</option>
                                    </select>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>

                {/* Section Start */}
                 <div className={styles.section}>
                    <div className={styles.container} style={{flexDirection: "column"}}>
                        Appearence

                        {/* Row Start */}
                        <div className={styles.row}>
                            <div className={`${styles.group} ${styles.fill}`}>
                                <div className={styles.groupTitle}>Visibility</div>
                                <div className={`${styles.group} ${styles.fill}`} style={{flexDirection: "row", gap: "10px"}}>
                                    <div className={styles.groupInput}>
                                        <DiceFiveIcon className={`${styles.inputIcon}`}/>
                                        <input 
                                            type="text" 
                                            className={styles.input}
                                            value={
                                                selectedElement?.style?.opacity !== undefined
                                                    ? selectedElement.style.opacity
                                                    : ""
                                            }
                                            placeholder={computedStyles?.opacity}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                updateElementStyle(selectedId!, { opacity: value ? value : undefined });
                                            }}
                                        />
                                    </div>
                                    <div className={`${styles.groupContent} ${styles.buttonOptions}`}>
                                        <EyeIcon
                                            className={`${styles.icon} ${styles.button}`}
                                            onClick={() => {
                                                const currentDisplay = selectedElement?.style?.display;

                                                updateElementStyle(selectedId!, {
                                                    display: currentDisplay === "flex" ? currentDisplay : "flex",
                                                });
                                            }}
                                        />
                                        <EyeClosedIcon
                                            className={`${styles.icon} ${styles.button}`}
                                            onClick={() => {
                                                const currentDisplay = selectedElement?.style?.display;

                                                updateElementStyle(selectedId!, {
                                                    display: currentDisplay === "none" ? currentDisplay : "none",
                                                });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Row Start */}
                        <div className={styles.row}>
                            <div className={`${styles.group} ${styles.fill}`}>
                                <div className={styles.groupTitle}>Background</div>
                                <div className={`${styles.groupContent}`}>
                                    {selectedElement && (
                                        <ColorPicker
                                            color={selectedElement.style?.backgroundColor || 'rgba(255, 255, 255, 1)'}
                                            key={selectedId}
                                            onChange={handleBackgroundColorChange}
                                            debounceMs={200}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Row Start */}
                        {["column", "column-reverse", "row", "row-reverse"].includes(selectedElement?.style?.flexDirection || "") && (
                        <div className={styles.row}>
                            <div className={`${styles.group} ${styles.fill}`}>
                                <div className={styles.groupTitle}>Align</div>

                                <div className={`${styles.groupContent} ${styles.buttonOptions}`}>
                                {/* Horizontal alignment (aparece se for column ou column-reverse) */}
                                {["column", "column-reverse"].includes(selectedElement?.style?.flexDirection || "") && (
                                    <>
                                    <AlignLeftIcon
                                        className={`${styles.icon} ${styles.button}`}
                                        onClick={() =>
                                            updateElementStyle(selectedId!, { alignItems: "flex-start" })
                                        }
                                    />
                                    <AlignCenterHorizontalIcon
                                        className={`${styles.icon} ${styles.button}`}
                                        onClick={() =>
                                            updateElementStyle(selectedId!, { alignItems: "center" })
                                        }
                                    />
                                    <AlignRightIcon
                                        className={`${styles.icon} ${styles.button}`}
                                        onClick={() =>
                                            updateElementStyle(selectedId!, { alignItems: "flex-end" })
                                        }
                                    />
                                    </>
                                )}

                                {/* Vertical alignment (aparece se for row ou row-reverse) */}
                                {["row", "row-reverse"].includes(selectedElement?.style?.flexDirection || "") && (
                                    <>
                                    <AlignTopIcon
                                        className={`${styles.icon} ${styles.button}`}
                                        onClick={() =>
                                            updateElementStyle(selectedId!, { alignItems: "flex-start" })
                                        }
                                    />
                                    <AlignCenterVerticalIcon
                                        className={`${styles.icon} ${styles.button}`}
                                        onClick={() =>
                                            updateElementStyle(selectedId!, { alignItems: "center" })
                                        }
                                    />
                                    <AlignBottomIcon
                                        className={`${styles.icon} ${styles.button}`}
                                        onClick={() =>
                                            updateElementStyle(selectedId!, { alignItems: "flex-end" })
                                        }
                                    />
                                    </>
                                )}
                                </div>

                            </div>
                        </div>
                        )}

                        {/* Row Start */}
                        <div className={styles.row}>
                            <div className={`${styles.group} ${styles.fill}`}>
                                <div className={styles.groupTitle}>Justify</div>
                                <div className={`${styles.groupInput}`}>
                                    <select
                                        className={`${styles.input} ${styles.select}`}
                                        value={selectedElement?.style?.justifyContent || ""}
                                        onChange={(e) =>
                                            updateElementStyle(selectedId!, {
                                                justifyContent: e.target.value || undefined,
                                            })
                                        }
                                    >
                                        <option value="">Default</option>
                                        <option value="flex-start">Start</option>
                                        <option value="center">Center</option>
                                        <option value="flex-end">End</option>
                                        <option value="space-between">Space Between</option>
                                        <option value="space-around">Space Around</option>
                                        <option value="space-evenly">Space Evenly</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.group}>
                                <div className={styles.groupTitle}>Gap</div>
                                <div className={`${styles.groupInput} ${["column", "column-reverse", "row", "row-reverse"].includes(selectedElement?.style?.flexDirection || "") ? "" : styles.disabled}`}>
                                    <input
                                        type="text" 
                                        disabled={
                                            ["column", "column-reverse", "row", "row-reverse"].includes(selectedElement?.style?.flexDirection || "") ? false : true
                                        } 
                                        className={styles.input}
                                        value={
                                            selectedElement?.style?.gap !== undefined
                                                ? String(selectedElement.style.gap).replace("px", "")
                                                : ""
                                        }
                                        placeholder={computedStyles?.gap?.replace("px", "")}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            updateElementStyle(selectedId!, { gap: value ? `${value}px` : undefined });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row Start */}
                        <div className={styles.row}>
                            <div className={styles.group}>
                                <div className={styles.groupTitle}>Padding</div>
                                <div className={styles.group} style={{flexDirection: "row", gap: "10px"}}>
                                    <div className={`${styles.groupInput}`}>
                                        <div className={styles.inputLabel}>T</div>
                                        <input
                                            type="text" 
                                            className={styles.input} 
                                            value={
                                                selectedElement?.style?.paddingTop !== undefined
                                                    ? String(selectedElement.style.paddingTop).replace("px", "")
                                                    : ""
                                            }
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                updateElementStyle(selectedId!, { paddingTop: value ? `${value}px` : undefined });
                                            }}
                                        />
                                    </div>
                                    <div className={`${styles.groupInput}`}>
                                        <div className={styles.inputLabel}>B</div>
                                        <input
                                            type="text" 
                                            className={styles.input} 
                                            value={
                                                selectedElement?.style?.paddingBottom !== undefined
                                                    ? String(selectedElement.style.paddingBottom).replace("px", "")
                                                    : ""
                                            }
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                updateElementStyle(selectedId!, { paddingBottom: value ? `${value}px` : undefined });
                                            }}
                                        />
                                    </div>
                                    <div className={`${styles.groupInput}`}>
                                        <div className={styles.inputLabel}>L</div>
                                        <input
                                            type="text" 
                                            className={styles.input} 
                                            value={
                                                selectedElement?.style?.paddingLeft !== undefined
                                                    ? String(selectedElement.style.paddingLeft).replace("px", "")
                                                    : ""
                                            }
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                updateElementStyle(selectedId!, { paddingLeft: value ? `${value}px` : undefined });
                                            }}
                                        />
                                    </div>
                                    <div className={`${styles.groupInput}`}>
                                        <div className={styles.inputLabel}>R</div>
                                        <input
                                            type="text" 
                                            className={styles.input} 
                                            value={
                                                selectedElement?.style?.paddingRight !== undefined
                                                    ? String(selectedElement.style.paddingRight).replace("px", "")
                                                    : ""
                                            }
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                updateElementStyle(selectedId!, { paddingRight: value ? `${value}px` : undefined });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Row Start */}
                        <div className={styles.row}>
                            <div className={`${styles.group} ${styles.fill}`}>
                                <div className={styles.groupTitle}>Overflow X</div>
                                <div className={`${styles.groupInput}`}>
                                    <select className={`${styles.input} ${styles.select}`}
                                        value={selectedElement?.style?.overflowX || ""}
                                        onChange={(e) =>
                                            updateElementStyle(selectedId!, {
                                                overflowX: e.target.value as React.CSSProperties["overflowX"] || "auto",
                                            })
                                        }
                                    >
                                        <option value="auto">Auto</option>
                                        <option value="hidden">Hidden</option>
                                        <option value="visible">Visible</option>
                                        <option value="scroll">Scroll</option>
                                    </select>
                                </div>
                            </div>
                            <div className={`${styles.group} ${styles.fill}`}>
                                <div className={styles.groupTitle}>Overflow Y</div>
                                <div className={`${styles.groupInput}`}>
                                    <select className={`${styles.input} ${styles.select}`}
                                        value={selectedElement?.style?.overflowY || ""}
                                        onChange={(e) =>
                                            updateElementStyle(selectedId!, {
                                                overflowY: e.target.value as React.CSSProperties["overflowY"] || "auto",
                                            })
                                        }
                                    >
                                        <option value="auto">Auto</option>
                                        <option value="hidden">Hidden</option>
                                        <option value="visible">Visible</option>
                                        <option value="scroll">Scroll</option>
                                    </select>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>

                {/* Section Start */}
            </div>
        </div>
    );
}