import type { CSSProperties } from "react"
import PropertiesBar from "../components/GUI/PropertiesBar"
import Sidebar from "../components/GUI/Sidebar"
import Canvas from "../components/GUI/Canvas"

export default function Layout() {
    return (
        <div className="layout" style={style}>
            <Sidebar/>
            <Canvas/>
            <PropertiesBar/>
        </div>
    )
}

const style: CSSProperties = {
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "start",
    justifyContent: "start",

}