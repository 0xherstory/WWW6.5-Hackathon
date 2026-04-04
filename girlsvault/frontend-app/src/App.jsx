import { useState } from "react";
import IntroPage from "./pages/IntroPage";
import DemoPage from "./pages/DemoPage";

function App() {
  const [page, setPage] = useState("intro");

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a" }}>
      {page === "intro" ? (
        <IntroPage onEnterDemo={() => setPage("demo")} />
      ) : (
        <DemoPage onBack={() => setPage("intro")} />
      )}
    </div>
  );
}

export default App;
