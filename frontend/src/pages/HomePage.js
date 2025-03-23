import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "./styles/HomePage.css";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("searching");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/posts");
        const data = await response.json();
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          console.error("Błędny format danych:", data);
        }
      } catch (error) {
        console.error("Błąd pobierania postów:", error);
      }
    };

    fetchPosts();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "searching":
        return (
          <div className="posts-container">
            {posts.map((post) => (
              <div key={post.id} className="post">
                <div className="post-header">
                  <img
                    src={
                      post.User?.profilePicture
                        ? `http://localhost:5000/uploads/${post.User.profilePicture}`
                        : "/default-profile.jpg"
                    }
                    alt="Profil"
                    className="profile-pic"
                  />
                  <span>{post.User?.name || "Anonimowy użytkownik"}</span>
                </div>
                <h3 className="post-title">{post.title}</h3>
                <p className="post-meta">
                  Kraj: {post.country} | Data: {post.travelDate} | Dni: {post.days} | Cena: {post.priceFrom} - {post.priceTo} PLN | Liczba wolnych miejsc: {post.maxPeople}
                </p>
                <button className="expand-btn">Zobacz więcej</button>
              </div>
            ))}
          </div>
        );
      case "trips":
        return <div className="posts-container"><h3>Tu będą posty podróżnicze z mapą i zdjęciami</h3></div>;
      case "friends":
        return <div className="posts-container"><h3>Tu będą znajomi</h3></div>;
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="homepage-container">
        {renderContent()}
      </div>
    </>
  );
};

export default HomePage;
