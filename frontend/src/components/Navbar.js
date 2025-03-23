import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import AddPostModal from "./AddPostModal";
import AuthContext from "../context/AuthContext";
import "./styles/Navbar.css";

// Import ikon
import planeIcon from "../assets/icons/plane.svg";
import cameraIcon from "../assets/icons/camera.svg";
import friendsIcon from "../assets/icons/friends.svg";

const Navbar = ({ activeTab, setActiveTab }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };
  return (
    <>
      <nav className="navbar">
      <div className="nav-left">
        <h2>Poland Travelers</h2>
      </div>

      <div className="nav-center">
        <div className="nav-tabs">
          <button
            className={`tab-icon-wrapper ${activeTab === "searching" ? "active" : ""}`}
            onClick={() => setActiveTab("searching")}
          >
            <img src={planeIcon} alt="Szukam osób" className="tab-icon" />
          </button>
          <button
            className={`tab-icon-wrapper ${activeTab === "trips" ? "active" : ""}`}
            onClick={() => setActiveTab("trips")}
          >
            <img src={cameraIcon} alt="Podróże" className="tab-icon" />
          </button>
          <button
            className={`tab-icon-wrapper ${activeTab === "friends" ? "active" : ""}`}
            onClick={() => setActiveTab("friends")}
          >
            <img src={friendsIcon} alt="Znajomi" className="tab-icon" />
          </button>
        </div>
      </div>

      <div className="nav-right">
        <div className="profile-menu-wrapper">
              <img
          src={`http://localhost:5000/uploads/${user?.profilePicture || 'default-profile.jpg'}`}
          alt="Profil"
          className={`profile-icon ${isDropdownOpen ? "active" : ""}`}
          onClick={() => setIsDropdownOpen((prev) => !prev)}
        />

        {isDropdownOpen && (
          <div className="dropdown-menu">
            <Link to="/profile" className="dropdown-item">Profil</Link>
            <Link to="/messages" className="dropdown-item">Wiadomości</Link>
            <button onClick={handleLogout} className="dropdown-item">Wyloguj się</button>
          </div>
        )}
      </div>
      </div>
    </nav>

      {isModalOpen && <AddPostModal closeModal={() => setIsModalOpen(false)} />}
    </>
  );
};

export default Navbar;
