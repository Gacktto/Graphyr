import Layout from './layout/layout';
import { CanvasProvider } from './core/context/CanvasContext';
import { DataProvider } from './core/context/DataContext';

const App = () => {
    return (
        <DataProvider>
            <CanvasProvider>
                <Layout />
            </CanvasProvider>
        </DataProvider>
    );
};

export default App;