import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import TripsPage from "./pages/TripsPage";
import FriendsPage from "./pages/FriendsPage";
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import UserProfilePage from './pages/UserProfilePage';
import ProtectedRoute from './routes/ProtectedRoute'; // ← odkomentuj

import 'leaflet/dist/leaflet.css';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Publiczne */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Zabezpieczone */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/trips" element={<TripsPage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/messages" element={<ChatPage />} />
            <Route path="/profile/:userId" element={<UserProfilePage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
