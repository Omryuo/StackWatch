import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ShortenerPage from "./pages/ShortenerPage";
import StatsPage from "./pages/StatsPage";

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 16 }}>
        <nav style={{ marginBottom: 16 }}>
          <Link to="/" style={{ marginRight: 12 }}>Shortener</Link>
          <Link to="/stats">Stats</Link>
        </nav>
        <Routes>
          <Route path="/" element={<ShortenerPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
