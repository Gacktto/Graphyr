import type { CSSProperties } from 'react';
import Rightbar from '../features/editor/Rightbar/Rightbar';
import Leftbar from '../features/editor/Leftbar/Leftbar';
import Canvas from '../features/canvas/Canvas';

export default function Layout() {
    return (
        <div className="layout" style={style}>
            <Leftbar />
            <Canvas />
            <Rightbar />
        </div>
    );
}

const style: CSSProperties = {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'start',
    justifyContent: 'start',
};
