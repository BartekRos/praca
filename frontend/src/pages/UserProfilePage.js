// src/pages/UserProfilePage.js
import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios            from "axios";

import AuthContext      from "../context/AuthContext";
import Navbar           from "../components/Navbar";
import TripPostCard     from "../components/TripPostCard";
import TripPostModal    from "../components/TripPostModal";
import CompanionPostCard from "../components/CompanionPostCard";

import planeIcon  from "../assets/icons/plane.png";
import cameraIcon from "../assets/icons/camera.png";
import "./styles/UserProfilePage.css";

const UserProfilePage = () => {
  const { user }   = useContext(AuthContext);
  const { userId } = useParams();
  const navigate   = useNavigate();

  /* ---------- STAN ---------- */
  const [profile,        setProfile]        = useState(null);
  const [activeTab,      setActiveTab]      = useState("trip");

  const [tripPosts,      setTripPosts]      = useState([]);
  const [companionPosts, setCompanionPosts] = useState([]);

  const [likeCounts,     setLikeCounts]     = useState({});

  const [selectedPost,   setSelectedPost]   = useState(null);
  const [scrollToComments,setScrollToComments] = useState(false);

  const [isFriend,       setIsFriend]       = useState(false);

  /* ========== POBIERANIE PROFILU + POSTÓW ========== */
  const fetchData = useCallback(async () => {
    try {
      /* ---- profil ---- */
      const { data: prof } = await axios.get(
        `http://localhost:5000/api/users/${userId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setProfile(prof);

      /* ---- Trip posts ---- */
      const { data: trips } = await axios.get(
        `http://localhost:5000/api/trip-posts/user/${userId}`
      );

      const countsArr = await Promise.all(
        trips.map(async (p) => {
          const r = await axios.get(
            `/api/trip-posts/${p.id}/likes-count`
          );
          return { id: p.id, count: r.data.count };
        })
      );
      setLikeCounts(countsArr.reduce((a,c)=>({ ...a, [c.id]: c.count }), {}));

      // flaga likedByCurrentUser
      await Promise.all(
        trips.map(async (p) => {
          const r = await axios.get(
            `/api/trip-posts/${p.id}/liked`,
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
          p.likedByCurrentUser = r.data.liked;
        })
      );

      setTripPosts(trips);

      /* ---- Companion posts ---- */
      const { data: companions } = await axios.get(
        `http://localhost:5000/api/posts?userId=${userId}`
      );
      setCompanionPosts(companions);

      /* ---- znajomość ---- */
      const { data: friends } = await axios.get(
        "http://localhost:5000/api/friends",
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setIsFriend(friends.map((f) => f.id).includes(+userId));
    } catch (err) {
      console.error("❌ Błąd pobierania danych profilu:", err);
    }
  }, [userId, user]);

  /* ------ init ------ */
  useEffect(() => {
    if (!user?.token || !userId) return;
    if (+userId === user.id) { navigate("/profile"); return; }
    fetchData();
  }, [userId, user, navigate, fetchData]);

  /* ========== AKTUALIZACJA LAJKA ========== */
  const updatePostLike = (postId, newCount, likedFlag) => {
    setLikeCounts((prev) => ({ ...prev, [postId]: newCount }));

    setTripPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, likedByCurrentUser: likedFlag } : p
      )
    );

    if (selectedPost?.id === postId) {
      setSelectedPost((prev) => ({ ...prev, likedByCurrentUser: likedFlag }));
    }
  };

  /* ---------- blokada scrolla przy modal ---------- */
  useEffect(()=>{
    document.body.style.overflow = selectedPost ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  },[selectedPost]);

  /* ================================================= */
  if (!profile) return <div>Ładowanie profilu...</div>;

  const handleSendRequest = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/friends/request",
        { friendId: userId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("Zaproszenie wysłane");
    } catch (err) {
      alert(
        err?.response?.data?.message ||
        "Nie udało się wysłać zaproszenia"
      );
    }
  };

  const handleMessage = () => navigate(`/messages?userId=${userId}`);

  /* ================= RENDER ================= */
  return (
    <>
      <Navbar />

      <div className="profile-page">
        {/* ---------- HEADER ---------- */}
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

        {/* ---------- TABS ---------- */}
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

        {/* ---------- CONTENT ---------- */}
        <div className="profile-content">
          {activeTab === "trip" && (
            tripPosts.length ? (
              tripPosts.map((post) => (
                <TripPostCard
                  key          ={post.id}
                  post         ={post}
                  likes        ={likeCounts[post.id] ?? 0}
                  likedByMe    ={post.likedByCurrentUser ?? false}
                  onClick      ={() => { setSelectedPost(post); setScrollToComments(false); }}
                  onCommentClick={() => { setSelectedPost(post); setScrollToComments(true); }}
                  onUpdateLikes={updatePostLike}
                />
              ))
            ) : (
              <p className="no-posts-message">Brak utworzonych postów</p>
            )
          )}

          {activeTab === "companion" && (
            companionPosts.length ? (
              companionPosts.map((post) => (
                <CompanionPostCard key={post.id} post={post} />
              ))
            ) : (
              <p className="no-posts-message">Brak utworzonych postów</p>
            )
          )}
        </div>
      </div>

      {/* ---------- MODAL ---------- */}
      {selectedPost && (
        <TripPostModal
          post            ={selectedPost}
          onClose         ={() => { setSelectedPost(null); setScrollToComments(false); }}
          scrollToComments={scrollToComments}
          onUpdateLikes   ={updatePostLike}
        />
      )}
    </>
  );
};

export default UserProfilePage;
