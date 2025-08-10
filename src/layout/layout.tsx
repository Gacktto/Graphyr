import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import Rightbar from '../features/editor/Rightbar/Rightbar';
import Leftbar from '../features/editor/Leftbar/Leftbar';
import Canvas from '../features/canvas/Canvas';
import { DataView } from '../features/data/DataView';

export type AppView = 'editor' | 'data';

export default function Layout() {
    const [currentView, setCurrentView] = useState<AppView>('editor');

    const renderView = () => {
        if (currentView === 'data') {
            return <DataView />;
        }
        return (
            <>
                <Canvas />
                <Rightbar />
            </>
        );
    };

    return (
        <div className="layout" style={style}>
            <Leftbar setCurrentView={setCurrentView} currentView={currentView} />
            {renderView()}
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