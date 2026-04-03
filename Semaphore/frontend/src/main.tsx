import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import "./polyfills";
import App from "./App";
import { AppStateProvider } from "./state/AppStateContext";
import { queryClient, wagmiConfig } from "./web3/rainbowkit";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppStateProvider>
          <App />
        </AppStateProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
