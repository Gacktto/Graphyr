import Layout from "./layout/layout";
import { CanvasProvider } from "./context/CanvasContext";

const App = () => {
  return (
    <CanvasProvider>
      <Layout />
    </CanvasProvider>
  );
};

export default App;
