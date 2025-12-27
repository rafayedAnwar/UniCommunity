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
import UserSearchPage from "./Pages/UserSearchPage";
import PublicProfilePage from "./Pages/PublicProfilePage";
import MessagePage from "./Pages/MessagePage";
import MessagesOverviewPage from "./Pages/MessagesOverviewPage";
import ReviewPage from "./Pages/ReviewPage";
import HOF from "./Pages/HallOfFamePage";
import CgpaPage from "./Pages/CgpaPage";
import EventsPage from "./Pages/EventsPage";
import InstructorReviewsPage from "./Pages/InstructorReviewsPage";
import ProjectPartnersPage from "./Pages/ProjectPartnersPage";

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
        <Route path="/search" element={<UserSearchPage />} />
        <Route path="/profile/:userId" element={<PublicProfilePage />} />
        <Route path="/messages" element={<MessagesOverviewPage />} />
        <Route path="/messages/:userId" element={<MessagePage />} />
        <Route path="/reviews" element={<ReviewPage />}/>
        <Route path="/hof" element={<HOF/>}/>
        <Route path="/cgpa" element={<CgpaPage />}/>
        <Route path="/events" element={<EventsPage />}/>
        <Route path="/instructors" element={<InstructorReviewsPage />}/>
        <Route path="/partners" element={<ProjectPartnersPage />}/>
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
