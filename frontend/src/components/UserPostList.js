import React, { useEffect, useState } from "react";
import TripPostCard from "./TripPostCard";
import "./styles/UserPostsList.css";
import planeIcon from "../assets/icons/plane.png";
import cameraIcon from "../assets/icons/camera.png";

const UserPostsList = ({ userId }) => {
  const [type, setType] = useState("trip"); // 'trip' albo 'travelmate'
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const fetchPosts = async () => {
      try {
        const endpoint =
          type === "trip"
            ? `http://localhost:5000/api/trip-posts?userId=${userId}`
            : `http://localhost:5000/api/posts?userId=${userId}`;

        const res = await fetch(endpoint);
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("❌ Błąd ładowania postów:", err);
      }
    };

    fetchPosts();
  }, [userId, type]);

  return (
    <div className="user-posts-section">
      <div className="post-switcher">
        <img
          src={cameraIcon}
          alt="TripPosts"
          className={`switch-icon ${type === "trip" ? "active" : ""}`}
          onClick={() => setType("trip")}
        />
        <img
          src={planeIcon}
          alt="CompanionPosts"
          className={`switch-icon ${type === "travelmate" ? "active" : ""}`}
          onClick={() => setType("travelmate")}
        />
      </div>

      <div className="user-posts-list">
        {posts.length === 0 ? (
          <p className="no-posts">Brak postów do wyświetlenia.</p>
        ) : type === "trip" ? (
          posts.map((post) => (
            <TripPostCard key={post.id} post={post} />
          ))
        ) : (
          posts.map((post) => (
            <div key={post.id} className="travelmate-post">
              <h3>{post.title}</h3>
              <p><strong>Data:</strong> {new Date(post.travelDate).toLocaleDateString("pl-PL")}</p>
              <p><strong>Miejsca:</strong> {post.maxPeople}</p>
              <p>{post.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserPostsList;
