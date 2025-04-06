import React from "react";
import Navbar from "../components/Navbar";
import "./styles/HomePage.css";

const TripsPage = () => {
  return (
    <>
      <Navbar />
      <div className="homepage-container">
        <div className="posts-container">
          <h3>📷 W tym miejscu pojawią się relacje z podróży, zdjęcia oraz mapy!</h3>
        </div>
      </div>
    </>
  );
};

export default TripsPage;
