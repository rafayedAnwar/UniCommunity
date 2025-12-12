import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./Components/Navbar";
import LoginPage from "./Pages/LoginPage";
import ProfilePage from "./Pages/ProfilePage";
import ForumPage from "./Pages/ForumPage";
import DiscussionPage from "./Pages/DiscussionPage";

function AppContent() {
  const location = useLocation();
  const hideNavbar =
    location.pathname === "/" || location.pathname === "/login";

  return (
    <div className="App">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/forums" element={<ForumPage />} />
        <Route path="/discussion" element={<DiscussionPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
