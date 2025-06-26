import type { CSSProperties } from "react"
import ActionBar from "./ActionBar"
import { Stage, Layer, Text } from "react-konva"
import Tk from "../konva"

export default function Canvas() {
    return (
        <div className="canvas" style={style}>
            <Tk/>
        </div>
    )
}

const style: CSSProperties = {
    position: "relative",
    flex: 1,
    backgroundColor: "#282828",
    height: "100%"
}

// const actionBarStyle: CSSProperties = {
//     position: "absolute",
//     bottom: "20px",
//     left: "0",
//     right: "0",
//     margin: "auto"
// }