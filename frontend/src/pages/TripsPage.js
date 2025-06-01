import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import AuthContext from "../context/AuthContext";
import CreateTripPostSection from "../components/CreateTripPostSection";
import TripPostCard from "../components/TripPostCard";
import "./styles/HomePage.css"; // wspólny styl z HomePage

const TripsPage = () => {
  const { user } = useContext(AuthContext);
  const [tripPosts, setTripPosts] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchTripPosts();
  }, []);

  const fetchTripPosts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/trip-posts");
      const data = await res.json();
      const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTripPosts(sorted);
    } catch (error) {
      console.error("❌ Błąd pobierania relacji:", error);
    }
  };

  const handleCreateTripPost = async (postData) => {
    try {
      const res = await fetch("http://localhost:5000/api/trip-posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: postData,
      });
      

      const newPost = await res.json();
      setTripPosts(prev => [newPost, ...prev]);
      setShowCreateForm(false);
    } catch (err) {
      console.error("❌ Błąd dodawania relacji:", err);
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
            <CreateTripPostSection
              onCancel={() => setShowCreateForm(false)}
              onSubmit={handleCreateTripPost}
            />
          ) : (
            <div className="posts-container">
              {tripPosts.map((post) => (
                <TripPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TripsPage;
