import Layout from './layout/layout';
import { CanvasProvider } from './core/context/CanvasContext';

const App = () => {
    return (
        <CanvasProvider>
            <Layout />
        </CanvasProvider>
    );
};

export default App;
