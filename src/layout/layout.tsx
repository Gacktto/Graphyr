import type { CSSProperties } from "react"
import Rightbar from "../components/GUI/Rightbar"
import Leftbar from "../components/GUI/Leftbar"
import Canvas from "../components/Canvas/Canvas"

export default function Layout() {
    return (
        <div className="layout" style={style}>
            <Leftbar/>
            <Canvas/>
            <Rightbar/>
        </div>
    )
}

const style: CSSProperties = {
    position: 'relative',
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "start",
    justifyContent: "start",
}