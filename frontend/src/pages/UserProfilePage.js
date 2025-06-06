import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import Navbar from "../components/Navbar";
import TripPostCard from "../components/TripPostCard";
import TripPostModal from "../components/TripPostModal";
import "./styles/UserProfilePage.css";

import planeIcon from "../assets/icons/plane.png";
import cameraIcon from "../assets/icons/camera.png";

const UserProfilePage = () => {
  const { user } = useContext(AuthContext);
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("trip"); // "trip" | "companion"
  const [tripPosts, setTripPosts] = useState([]);
  const [companionPosts, setCompanionPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [scrollToComments, setScrollToComments] = useState(false); // ⬅️ Dodane

  useEffect(() => {
    if (!user?.token || !userId) return;
    if (+userId === user.id) {
      navigate("/profile");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.error("❌ Błąd ładowania profilu:", err);
      }
    };

    const fetchTripPosts = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/trip-posts/user/${userId}`);
        setTripPosts(res.data);
      } catch (err) {
        console.error("❌ Błąd ładowania trip postów:", err);
      }
    };

    const fetchCompanionPosts = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/posts?userId=${userId}`);
        setCompanionPosts(res.data);
      } catch (err) {
        console.error("❌ Błąd ładowania companion postów:", err);
      }
    };

    fetchProfile();
    fetchTripPosts();
    fetchCompanionPosts();
  }, [userId, user, navigate]);

  if (!profile) return <div>Ładowanie profilu...</div>;

  return (
    <>
      <Navbar />
      <div className="profile-page">
        <div className="profile-header">
          <div className="bio-box">
            <p><strong>Imię:</strong> {profile.name || "-"}</p>
            <p><strong>Wiek:</strong> {profile.age || "-"}</p>
            <p><strong>Miasto:</strong> {profile.city || "-"}</p>
            <p><strong>Dołączył:</strong> {new Date(profile.createdAt).toLocaleDateString("pl-PL")}</p>
          </div>

          <div className="profile-avatar">
            <img
              src={`http://localhost:5000/uploads/${profile.profilePicture || "default-profile.jpg"}`}
              alt="Profil"
            />
          </div>

          <div className="profile-actions">
            <button>Dodaj do znajomych</button>
            <button>Napisz wiadomość</button>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={activeTab === "trip" ? "active" : ""}
            onClick={() => setActiveTab("trip")}
          >
            <img src={cameraIcon} alt="Relacje" />
          </button>
          <button
            className={activeTab === "companion" ? "active" : ""}
            onClick={() => setActiveTab("companion")}
          >
            <img src={planeIcon} alt="Towarzysze" />
          </button>
        </div>

        <div className="profile-content">
          {activeTab === "trip" &&
            tripPosts.map((post) => (
              <TripPostCard
                key={post.id}
                post={post}
                onClick={() => {
                  setSelectedPost(post);
                  setScrollToComments(false);
                }}
                onCommentClick={() => {
                  setSelectedPost(post);
                  setScrollToComments(true);
                }}
              />
            ))}

          {activeTab === "companion" &&
            companionPosts.map((post) => (
              <div key={post.id} className="companion-post">
                <h3>{post.title}</h3>
                <p>{post.description}</p>
              </div>
            ))}
        </div>
      </div>

      {selectedPost && (
        <TripPostModal
          post={selectedPost}
          onClose={() => {
            setSelectedPost(null);
            setScrollToComments(false);
          }}
          scrollToComments={scrollToComments} // ⬅️ kluczowy prop
        />
      )}
    </>
  );
};

export default UserProfilePage;
