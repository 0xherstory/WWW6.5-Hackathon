import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

import CloudAdoption from "./pages/CloudAdoption";
import Home from "./pages/Home";
import Donations from "./pages/Donations";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cloud-adoption" element={<CloudAdoption />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
