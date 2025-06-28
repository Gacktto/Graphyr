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
    CornersOutIcon
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { useCanvas } from "../../context/CanvasContext";
import type { ElementNode } from "../TreeView/TreeView";

export default function Rightbar() {

    const { elements, setElements, selectedId, elementsRef } = useCanvas();
    const selectedElement = findElementById(elements, selectedId); // função auxiliar abaixo
    const [computedStyles, setComputedStyles] = useState<CSSStyleDeclaration | null>(null);

    useEffect(() => {
        if (selectedId && elementsRef.current[selectedId]) {
            const el = elementsRef.current[selectedId]!;
            const computed = getComputedStyle(el);
            setComputedStyles(computed);
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
            const updateNode = (node: ElementNode): ElementNode => {
            if (node.id === id) {
                return {
                ...node,
                style: {
                    ...node.style,
                    ...newStyle,
                },
                };
            }

            if (node.children) {
                return {
                ...node,
                children: node.children.map(updateNode),
                };
            }

            return node;
            };

            return prevElements.map(updateNode);
        });
    }



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
                                        <input
                                            type="text" 
                                            className={styles.input} 
                                            value={String(selectedElement?.style?.left || "").replace("px", "")}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                updateElementStyle(selectedId!, { left: value ? `${value}px` : undefined });
                                            }}
                                        />
                                    </div>
                                    <div className={styles.groupInput}>
                                        <div className={styles.inputLabel}>Y</div>
                                        <input
                                            type="text" 
                                            className={styles.input} 
                                            value={String(selectedElement?.style?.top || "").replace("px", "")}
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
                                            value={String(selectedElement?.style?.rotate || "").replace("deg", "")}
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
                                        <input type="text" disabled className={styles.input}/>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.group}>
                                <div className={styles.group} style={{flexDirection: "row", gap: "10px"}}>
                                    <div className={`${styles.groupInput} ${styles.disabled}`}>
                                        <div className={styles.inputLabel}>min</div>
                                        <input type="text" disabled className={styles.input}/>
                                    </div>
                                    <div className={`${styles.groupInput} ${styles.disabled}`}>
                                        <div className={styles.inputLabel}>max</div>
                                        <input type="text" disabled className={styles.input}/>
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
                        <div className={styles.row}>
                            <div className={`${styles.group} ${styles.fill}`}>
                                <div className={styles.groupTitle}>Align</div>
                                <div className={`${styles.groupContent} ${styles.buttonOptions}`}>
                                    <AlignLeftIcon className={`${styles.icon} ${styles.button}`}/>
                                    <AlignCenterHorizontalIcon className={`${styles.icon} ${styles.button}`}/>
                                    <AlignRightIcon className={`${styles.icon} ${styles.button}`}/>
                                    <AlignTopIcon className={`${styles.icon} ${styles.button}`}/>
                                    <AlignCenterVerticalIcon className={`${styles.icon} ${styles.button}`}/>
                                    <AlignBottomIcon className={`${styles.icon} ${styles.button}`}/>
                                </div>
                            </div>
                        </div>

                        {/* Row Start */}
                        <div className={styles.row}>
                            <div className={`${styles.group} ${styles.fill}`}>
                                <div className={styles.groupTitle}>Justify</div>
                                <div className={`${styles.groupInput}`}>
                                    <select className={`${styles.input} ${styles.select}`}>
                                        <option value="Start">Start</option>
                                        <option value="Center">Center</option>
                                        <option value="End">End</option>
                                        <option value="Space Between">Space Between</option>
                                        <option value="Space Around">Space Around</option>
                                        <option value="Space Evenly">Space Evenly</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.group}>
                                <div className={styles.groupTitle}>Gap</div>
                                <div className={`${styles.groupInput}`}>
                                    <input type="text" className={styles.input}/>
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
                                            value={String(selectedElement?.style?.paddingBottom || "").replace("px", "")}
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
                                            value={String(selectedElement?.style?.paddingLeft || "").replace("px", "")}
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
                                            value={String(selectedElement?.style?.paddingRight || "").replace("px", "")}
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
                                    <select className={`${styles.input} ${styles.select}`}>
                                        <option value="Auto">Auto</option>
                                        <option value="Hidden">Hidden</option>
                                        <option value="Visible">Visible</option>
                                        <option value="Scroll">Scroll</option>
                                    </select>
                                </div>
                            </div>
                            <div className={`${styles.group} ${styles.fill}`}>
                                <div className={styles.groupTitle}>Overflow Y</div>
                                <div className={`${styles.groupInput}`}>
                                    <select className={`${styles.input} ${styles.select}`}>
                                        <option value="Auto">Auto</option>
                                        <option value="Hidden">Hidden</option>
                                        <option value="Visible">Visible</option>
                                        <option value="Scroll">Scroll</option>
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