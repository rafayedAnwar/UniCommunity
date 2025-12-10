import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

//importing pages
import LoginPage from './Pages/LoginPage'
import ProfilePage from './Pages/ProfilePage'
import DiscussionPage from './Pages/DiscussionPage'


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/discussion" element={<DiscussionPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
