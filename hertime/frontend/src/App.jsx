import { useState } from "react"
import IntroPage from "./pages/IntroPage"
import DemoPage from "./pages/DemoPage"
import MapPage from "./pages/MapPage"

function App() {
  const [page, setPage] = useState("intro")
  const [account, setAccount] = useState(null)

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a" }}>
      {page === "intro" && (
        <IntroPage onEnterDemo={() => setPage("demo")} />
      )}
      {page === "demo" && (
        <DemoPage
          onBack={() => setPage("intro")}
          onOpenMap={(acc) => { setAccount(acc); setPage("map") }}
        />
      )}
      {page === "map" && (
        <MapPage account={account} onBack={() => setPage("demo")} />
      )}
    </div>
  )
}

export default App
