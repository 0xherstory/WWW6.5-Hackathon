import { ReactElement, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAccount } from "wagmi";

import { OnboardingPage } from "./pages/OnboardingPage";
import { DiscoverPage } from "./pages/DiscoverPage";
import { PersonalHubPage } from "./pages/PersonalHubPage";
import { ComposePage } from "./pages/ComposePage";
import { ReadSignalPage } from "./pages/ReadSignalPage";
import { RespondPage } from "./pages/RespondPage";
import { SignalDetailPage } from "./pages/SignalDetailPage";
import { SeamphoreThresholdPage } from "./pages/SeamphoreThresholdPage";
import { persistLastVisitedRoute } from "./lib/lastVisitedRoute";
import { useAppState } from "./state/useAppState";
import { hasPersistedAuthSession } from "./lib/authSession";

function ProtectedRoute({ children }: { children: ReactElement }) {
  const { address, isConnected } = useAccount();
  const { state, syncPending } = useAppState();
  const hasRestorableSession = isConnected && hasPersistedAuthSession(address ?? state.session.walletAddress);
  if (syncPending && hasRestorableSession && !state.session.inviteVerified) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!state.session.inviteVerified || !state.session.signatureVerified) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

function RouteMemory() {
  const location = useLocation();
  const { state } = useAppState();
  const isAuthenticated = state.session.inviteVerified && state.session.signatureVerified;

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    persistLastVisitedRoute(location.pathname, location.search, location.hash);
  }, [isAuthenticated, location.hash, location.pathname, location.search]);

  return null;
}

function RootRedirect() {
  const { state } = useAppState();
  const isAuthenticated = state.session.inviteVerified && state.session.signatureVerified;

  if (!isAuthenticated) {
    return <OnboardingPage />;
  }

  return <Navigate replace to="/discover" />;
}

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <BrowserRouter>
        <RouteMemory />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route
            path="/discover"
            element={
              <ProtectedRoute>
                <DiscoverPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/threshold"
            element={
              <ProtectedRoute>
                <SeamphoreThresholdPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compose"
            element={
              <ProtectedRoute>
                <ComposePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inbox"
            element={
              <ProtectedRoute>
                <Navigate to="/me" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/signals/:signalId"
            element={
              <ProtectedRoute>
                <SignalDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/signals/:signalId/respond"
            element={
              <ProtectedRoute>
                <RespondPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/signals/:signalId/read"
            element={
              <ProtectedRoute>
                <ReadSignalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/me"
            element={
              <ProtectedRoute>
                <PersonalHubPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
