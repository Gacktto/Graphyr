import type { CSSProperties } from "react";

export default function PropertiesBar() {
    return (
        <div className="properties-bar" style={style}>
        </div>
    );
}

const style: CSSProperties = {
    width: "15vw",
    height: "100vh",
    backgroundColor: "#282828",
    borderLeft: "1px solid #3C3C3C"
}