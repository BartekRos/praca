import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import CreatePostSection from "../components/CreatePostSection";
import "./styles/HomePage.css";


const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch postów z backendu
  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/posts");
      const data = await response.json();
      if (Array.isArray(data)) {
        // sortowanie najnowsze na górze
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(sorted);
      }
    } catch (error) {
      console.error("Błąd pobierania postów:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (postData) => {
    try {
      console.log("Dane wysyłane do backendu:", postData);
      const response = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const newPost = await response.json();
        setPosts((prev) => [newPost, ...prev]);
        setShowCreateForm(false);
      } else {
        
        console.error("Nie udało się dodać posta");
      }
    } catch (error) {
      console.error("Błąd dodawania posta:", error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="homepage-container">
        <div className="sidebar-left">
          {!showCreateForm && (
            <button className="add-post-sidebar" onClick={() => setShowCreateForm(true)}>
              + Dodaj post
            </button>
          )}
        </div>

        <div className="main-content">
          {showCreateForm ? (
            <CreatePostSection
              onCancel={() => setShowCreateForm(false)}
              onSubmit={handleCreatePost}
            />
          ) : (
            <div className="posts-container">
              {posts.map((post) => (
                <div key={post.id} className="post">
                  <div className="post-header">
                    <img
                      src={`http://localhost:5000/uploads/${post.User?.profilePicture || "default-profile.jpg"}`}
                      alt="Profil"
                      className="profile-pic"
                    />
                    <span>{post.User?.username || "Użytkownik"}</span>
                  </div>
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-meta">
                  Data: {new Date(post.travelDate).toLocaleDateString("pl-PL")} | Dni: {post.duration} | Cena: {post.priceFrom} - {post.priceTo} PLN | Miejsca: {post.maxPeople}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HomePage;
