import React, { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "./styles/Navbar.css";

// Import ikon
import planeIcon from "../assets/icons/plane.png";
import cameraIcon from "../assets/icons/camera.png";
import friendsIcon from "../assets/icons/friends.png";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // czyści token i usera
    navigate("/login");
  };

  return (
    
    <nav className="navbar">
      <div className="nav-left">
          <h2>Poland Travelers</h2>
      </div>

      <div className="nav-center">
        <div className="nav-tabs">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `tab-icon-wrapper ${isActive ? "active" : ""}`
            }
          >
            <img src={planeIcon} alt="Szukam osób" className="tab-icon" />
          </NavLink>

          <NavLink
            to="/trips"
            className={({ isActive }) =>
              `tab-icon-wrapper ${isActive ? "active" : ""}`
            }
          >
            <img src={cameraIcon} alt="Podróże" className="tab-icon" />
          </NavLink>

          <NavLink
            to="/friends"
            className={({ isActive }) =>
              `tab-icon-wrapper ${isActive ? "active" : ""}`
            }
          >
            <img src={friendsIcon} alt="Znajomi" className="tab-icon" />
          </NavLink>
        </div>
      </div>

      <div className="nav-right">
        <div className="profile-menu-wrapper">
          <img
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            src={`http://localhost:5000/uploads/${user?.profilePicture || "default-profile.jpg"}`}
            alt="Profil"
            className={`profile-icon ${isDropdownOpen ? "active" : ""}`}
          />
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <NavLink to="/profile" className="dropdown-item">Profil</NavLink>
              <NavLink to="/messages" className="dropdown-item">Wiadomości</NavLink>
              <button onClick={handleLogout} className="dropdown-item">Wyloguj się</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
