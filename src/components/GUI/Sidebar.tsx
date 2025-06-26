import type { CSSProperties } from "react";

export default function Sidebar() {
    return (
        <div className="sidebar" style={style}>
        </div>
    );
}

const style: CSSProperties = {
    width: "15vw",
    height: "100vh",
    backgroundColor: "#282828",
    borderRight: "1px solid #3C3C3C"
}