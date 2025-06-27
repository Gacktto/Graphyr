import { useRef, useState } from "react";
import styles from "../../styles/Canvas.module.css";
import { useCanvasTransform } from "./useCanvasTransform";
import useMeasure from "react-use-measure";

export default function Canvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const mainFrameRef = useRef<HTMLDivElement>(null);
  const [ref, bounds] = useMeasure();

  const [frameWidth, setFrameWidth] = useState(1300);

  const { scale, offset } = useCanvasTransform(canvasRef as React.RefObject<HTMLDivElement>, innerRef as React.RefObject<HTMLDivElement>);

  return (
    <div ref={canvasRef} className={styles.canvas}>
      <div
        ref={innerRef}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: "top left",
          width: "100%",
          height: "100%",
          position: "absolute",
        }}
      >
        <div ref={ref} className={styles.frame} data-canvas-element>
          <div className={styles.frameInfo}>
            <p>Default - {frameWidth}px</p>
          </div>
          <div
            ref={mainFrameRef}
            data-frame
            style={{
              width: frameWidth,
              minHeight: 600,
              margin: "0 auto",
              background: "#fff",
              position: "relative"
            }}
          >
            <div className="rect" style={{backgroundColor: "red", width: 200, height: 200}}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
