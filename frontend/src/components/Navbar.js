import React, { useState } from "react";
import { Link } from "react-router-dom";
import AddPostModal from "./AddPostModal"; // Importujemy nowy komponent
import "./styles/Navbar.css";

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="nav-left">
          <h2>TravelConnect</h2>
        </div>

        <div className="nav-center">
          <button className="add-post-btn" onClick={() => setIsModalOpen(true)}>
            + Dodaj post
          </button>
        </div>

        <div className="nav-right">
          <Link to="/profile">
            <img src="/default-profile.png" alt="Profil" className="profile-icon" />
          </Link>
          <Link to="/messages">
            <span className="icon">🔔</span>
          </Link>
        </div>
      </nav>

      {isModalOpen && <AddPostModal closeModal={() => setIsModalOpen(false)} />}
    </>
  );
};

export default Navbar;
