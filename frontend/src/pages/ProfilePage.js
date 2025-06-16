// src/pages/ProfilePage.js
import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import AuthContext     from "../context/AuthContext";
import Navbar          from "../components/Navbar";
import TripPostCard    from "../components/TripPostCard";
import TripPostModal   from "../components/TripPostModal";
import CompanionPostCard from "../components/CompanionPostCard";
import EditProfileForm from "../components/EditProfileForm";

import planeIcon  from "../assets/icons/plane.png";
import cameraIcon from "../assets/icons/camera.png";
import "./styles/UserProfilePage.css";

const ProfilePage = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  /* ---------- STAN ---------- */
  const [profile,         setProfile]         = useState(null);
  const [activeTab,       setActiveTab]       = useState("trip");

  const [tripPosts,       setTripPosts]       = useState([]);
  const [companionPosts,  setCompanionPosts]  = useState([]);

  const [likeCounts,      setLikeCounts]      = useState({});

  const [selectedPost,    setSelectedPost]    = useState(null);
  const [scrollToComments,setScrollToComments]= useState(false);

  const [showEditModal,   setShowEditModal]   = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword,  setDeletePassword]  = useState("");
  const [deleteError,     setDeleteError]     = useState("");

  /* ========== POBIERANIE PROFILU ========== */
  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/users/${user.id}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setProfile(data);
    } catch (err) {
      console.error("❌ Błąd ładowania profilu:", err);
    }
  }, [user]);

  /* ========== POBIERANIE POSTÓW ========== */
  const fetchPosts = useCallback(async () => {
    try {
      /* ---- Trip posts ---- */
      const { data: tripArr } = await axios.get(
        `/api/trip-posts/user/${user.id}`
      );

      /* liczby lajków */
      const countsArr = await Promise.all(
        tripArr.map(async (p) => {
          const r = await axios.get(
            `/api/trip-posts/${p.id}/likes-count`
          );
          return { id: p.id, count: r.data.count };
        })
      );
      setLikeCounts(
        countsArr.reduce((a, c) => ({ ...a, [c.id]: c.count }), {})
      );

      /* flaga likedByCurrentUser */
      await Promise.all(
        tripArr.map(async (p) => {
          const r = await axios.get(
            `/api/trip-posts/${p.id}/liked`,
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
          p.likedByCurrentUser = r.data.liked;
        })
      );

      setTripPosts(tripArr);

      /* ---- Companion posts ---- */
      const { data: compArr } = await axios.get(
        `/api/posts?userId=${user.id}`
      );
      setCompanionPosts(compArr);
    } catch (err) {
      console.error("❌ Błąd ładowania postów:", err);
    }
  }, [user]);

  /* ------ INIT ------ */
  useEffect(() => {
    if (!user?.token) return;
    fetchProfile();
    fetchPosts();
  }, [user, fetchProfile, fetchPosts]);

  /* ========== SYNCHRONIZACJA LAJKA ========== */
  const updatePostLike = (postId, newCount, liked) => {
    setLikeCounts((prev) => ({ ...prev, [postId]: newCount }));

    setTripPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, likedByCurrentUser: liked } : p
      )
    );

    // jeśli modal jest otwarty i dotyczy tego posta – też odśwież
    if (selectedPost?.id === postId) {
      setSelectedPost((prev) => ({
        ...prev,
        likedByCurrentUser: liked,
      }));
    }
  };

  /* ---------- blokada scrolla przy modal ---------- */
  useEffect(() => {
    document.body.style.overflow = selectedPost ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [selectedPost]);

  /* ========== RENDER ========== */
  if (!profile) return <div>Ładowanie profilu...</div>;

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
            <button onClick={() => setShowEditModal(true)}>Edytuj dane</button>
            <button onClick={() => setShowDeleteModal(true)}>Usuń konto</button>
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

      {/* ---------- DELETE MODAL ---------- */}
      {showDeleteModal && (
        <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="edit-profile-form">
              <h3>Czy na pewno chcesz usunąć konto?</h3>
              <p>Ta akcja jest nieodwracalna.</p>

              <label>Potwierdź hasłem:</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
              {deleteError && <p className="edit-message error">{deleteError}</p>}

              <div className="edit-form-buttons">
                <button
                  onClick={async () => {
                    try {
                      await axios.delete(
                        "http://localhost:5000/api/auth/delete-account",
                        {
                          headers: { Authorization: `Bearer ${user.token}` },
                          data   : { password: deletePassword },
                        }
                      );
                      localStorage.removeItem("user");
                      setUser(null);
                      navigate("/login");
                    } catch (err) {
                      setDeleteError(
                        err?.response?.data?.message ||
                          "Błąd podczas usuwania konta"
                      );
                    }
                  }}
                >
                  Potwierdź usunięcie
                </button>
                <button onClick={() => setShowDeleteModal(false)}>Anuluj</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- EDIT MODAL ---------- */}
      {showEditModal && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <EditProfileForm
              onClose={() => {
                setShowEditModal(false);
                fetchProfile();                 // odśwież dane profilu
              }}
              onProfileUpdated={(updated) => {
                setProfile(updated);
                setUser((prev) => ({ ...prev, ...updated }));
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;
