import { useEffect, useRef, useState } from "react"
import type { CSSProperties } from "react"
import { Stage, Layer, Text, Rect } from "react-konva"
import useMeasure from "react-use-measure"
import Tk from "../konva"

export default function Canvas() {
    const [ref, bounds] = useMeasure();

    return (
        <div ref={ref} className="canvas" style={style}>
            <Stage width={bounds.width} height={bounds.height}>
                <Layer>
                    <Text text="Canvas" fill={"white"} width={bounds.width} height={bounds.height} align="center" fontSize={20}/>
                </Layer>
            </Stage>
        </div>
    )
}

const style: CSSProperties = {
    position: "absolute",
    left:0,
    width: "100%",
    backgroundColor: "rgb(29, 29, 29)",
    height: "100%",
    zIndex: 2,
}