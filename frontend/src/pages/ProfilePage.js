import React, { useEffect, useState, useContext, useCallback} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import Navbar from "../components/Navbar";
import TripPostCard from "../components/TripPostCard";
import TripPostModal from "../components/TripPostModal";
import CompanionPostCard from "../components/CompanionPostCard";
import EditProfileForm from "../components/EditProfileForm";
import "./styles/UserProfilePage.css";

import planeIcon from "../assets/icons/plane.png";
import cameraIcon from "../assets/icons/camera.png";

const ProfilePage = () => {
  const { user, setUser } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("trip");
  const [tripPosts, setTripPosts] = useState([]);
  const [companionPosts, setCompanionPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [scrollToComments, setScrollToComments] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setProfile(res.data);
    } catch (err) {
      console.error("❌ Błąd ładowania profilu:", err);
    }
  }, [user]);

  useEffect(() => {
    if (!user?.token) return;

    fetchProfile();

    const fetchTripPosts = async () => {
      try {
        const res = await axios.get(`/api/trip-posts/user/${user.id}`);
        setTripPosts(res.data);
      } catch (err) {
        console.error("❌ Błąd ładowania trip postów:", err);
      }
    };

    const fetchCompanionPosts = async () => {
      try {
        const res = await axios.get(`/api/posts?userId=${user.id}`);
        setCompanionPosts(res.data);
      } catch (err) {
        console.error("❌ Błąd ładowania companion postów:", err);
      }
    };

    fetchTripPosts();
    fetchCompanionPosts();
  }, [user, fetchProfile]); // ✅ dodane fetchProfile

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
            <button onClick={() => setShowEditModal(true)}>Edytuj dane</button>
            <button onClick={() => setShowDeleteModal(true)}>Usuń konto</button>
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
                await axios.delete("http://localhost:5000/api/auth/delete-account", {
                  headers: {
                    Authorization: `Bearer ${user.token}`,
                  },
                  data: { password: deletePassword },
                });
                localStorage.removeItem("user");
                setUser(null);
                navigate("/login");
              } catch (err) {
                setDeleteError(err?.response?.data?.message || "Błąd podczas usuwania konta");
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

      {showEditModal && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <EditProfileForm
            onClose={() => {
              setShowEditModal(false);
              fetchProfile(); // odśwież lokalnie
            }}
            onProfileUpdated={(updatedUser) => {
              setProfile(updatedUser);      // lokalnie zaktualizuj stan
              setUser((prev) => ({ ...prev, ...updatedUser })); // zaktualizuj AuthContext
            }}
          />
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;
