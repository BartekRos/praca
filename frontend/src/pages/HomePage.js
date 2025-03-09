import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar"; // Importujemy navbar
import "./styles/HomePage.css";


const HomePage = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/posts");
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Błąd pobierania postów:", error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <>
      <Navbar /> {/* Navbar zawsze na górze */}
      <div className="homepage-container">
        <h2 className="title"> </h2>
        <div className="posts-container">
          {posts.map((post) => (
            <div key={post.id} className="post">
              <div className="post-header">
                <img
                  src={post.User?.profilePicture || "/default-profile.jpg"}
                  alt="Profil"
                  className="profile-pic"
                />
                <span>{post.User?.name || "Anonimowy użytkownik"}</span>
              </div>
              <h3 className="post-title">{post.title}</h3>
              <p className="post-meta">
                Miejsce: {post.country} | Data: {post.travelDate} | Cena: {post.priceFrom} - {post.priceTo} PLN
              </p>
              <button className="expand-btn">Zobacz więcej</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HomePage;
