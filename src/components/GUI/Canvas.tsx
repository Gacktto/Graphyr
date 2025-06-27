import { useEffect, useRef, useState } from "react"
import styles from "../../styles/Canvas.module.css"
import type { CSSProperties } from "react"
import useMeasure from "react-use-measure"

export default function Canvas() {
    const [ref, bounds] = useMeasure();

    return (
        <div ref={ref} className={styles.canvas}>
            background
        </div>
    )
}

