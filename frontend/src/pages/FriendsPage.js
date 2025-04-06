import React from "react";
import Navbar from "../components/Navbar";
import "./styles/HomePage.css";

const FriendsPage = () => {
  return (
    <>
      <Navbar />
      <div className="homepage-container">
        <div className="posts-container">
          <h3>🧑‍🤝‍🧑 Twoi znajomi pojawią się tutaj – wkrótce dodamy możliwość wyszukiwania i dodawania!</h3>
        </div>
      </div>
    </>
  );
};

export default FriendsPage;
