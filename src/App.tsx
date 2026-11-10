// CSS is linked via index.html (./public/app.css) compiled by Tailwind
import { Layout } from "./components/generic/layout";
import Home from "./pages/home";

export function App() {
  return (
    <Layout>
      <Home />
    </Layout>
  );
}

export default App;
