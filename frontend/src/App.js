import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Import kontekstu
import ProtectedRoute from './routes/ProtectedRoute'; // Import zabezpieczenia tras
import LoginPage from './pages/LoginPage';
import TripsPage from "./pages/TripsPage";
import FriendsPage from "./pages/FriendsPage";
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import 'leaflet/dist/leaflet.css';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';



const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />}/>
          {/* Zabezpieczona trasa dla HomePage */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/messages" element={<ChatPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
