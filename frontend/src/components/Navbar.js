import React, { useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext"; // Pobieramy dane użytkownika
import "./styles/Navbar.css";

const Navbar = () => {
  const { user } = useContext(AuthContext); // Pobieramy zalogowanego użytkownika

  return (
    <nav className="navbar">
      <div className="nav-left">
        <h2>TravelConnect</h2>
      </div>
      <div className="nav-center">
        <input type="text" placeholder="Szukaj podróży..." />
      </div>
      <div className="nav-right">
      <Link to="/messages">
          <span className="icon">🔔</span>
        </Link>
        <Link to="/profile">
          <img
            src={user?.profilePicture || "/default-profile.png"} // Jeśli użytkownik ma zdjęcie, używamy jego, w przeciwnym razie domyślne
            alt="Profil"
            className="profile-icon"
          />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
