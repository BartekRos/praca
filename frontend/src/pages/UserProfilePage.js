import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import Navbar from "../components/Navbar";
import TripPostCard from "../components/TripPostCard";
import TripPostModal from "../components/TripPostModal";
import CompanionPostCard from "../components/CompanionPostCard";
import "./styles/UserProfilePage.css";

import planeIcon from "../assets/icons/plane.png";
import cameraIcon from "../assets/icons/camera.png";

const UserProfilePage = () => {
  const { user } = useContext(AuthContext);
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("trip");
  const [tripPosts, setTripPosts] = useState([]);
  const [companionPosts, setCompanionPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [scrollToComments, setScrollToComments] = useState(false);
  const [isFriend, setIsFriend] = useState(false); // ⬅️ nowy stan

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

    const checkFriendship = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/friends", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const friendIds = res.data.map((f) => f.id);
        setIsFriend(friendIds.includes(+userId));
      } catch (err) {
        console.error("❌ Błąd sprawdzania znajomości:", err);
      }
    };

    fetchProfile();
    fetchTripPosts();
    fetchCompanionPosts();
    checkFriendship(); // ⬅️ sprawdzenie czy znajomy
  }, [userId, user, navigate]);

  const handleSendRequest = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/friends/request",
        { friendId: userId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("Zaproszenie wysłane");
    } catch (err) {
      const msg = err?.response?.data?.message || "Nie udało się wysłać zaproszenia";
      alert(msg);
      console.error("❌ Błąd wysyłania zaproszenia:", err);
    }
  };

  const handleMessage = () => {
    navigate(`/messages?userId=${userId}`);
  };

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
            {!isFriend && (
              <button onClick={handleSendRequest}>Dodaj do znajomych</button>
            )}
            <button onClick={handleMessage}>Napisz wiadomość</button>
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
          {activeTab === "trip" && (
            tripPosts.length > 0 ? (
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
              ))
            ) : (
              <p className="no-posts-message">Brak utworzonych postów</p>
            )
          )}

          {activeTab === "companion" && (
            companionPosts.length > 0 ? (
              companionPosts.map((post) => (
                <CompanionPostCard key={post.id} post={post} />
              ))
            ) : (
              <p className="no-posts-message">Brak utworzonych postów</p>
            )
          )}
        </div>
      </div>

      {selectedPost && (
        <TripPostModal
          post={selectedPost}
          onClose={() => {
            setSelectedPost(null);
            setScrollToComments(false);
          }}
          scrollToComments={scrollToComments}
        />
      )}
    </>
  );
};

export default UserProfilePage;
