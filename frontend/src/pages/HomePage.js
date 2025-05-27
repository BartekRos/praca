import React, { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import CreatePostSection from "../components/CreatePostSection";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./styles/HomePage.css";
import AuthContext from "../context/AuthContext";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const { user } = useContext(AuthContext);


  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/posts");
      const data = await response.json();
      if (Array.isArray(data)) {
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(sorted);
      }
    } catch (error) {
      console.error("Błąd pobierania postów:", error);
    }
  };

  const handleCreatePost = async (postData) => {
  try {
    const response = await fetch("http://localhost:5000/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error("Nie udało się dodać posta");
    }

    const newPost = await response.json();

    if (newPost && newPost.User) {
      setPosts((prev) => [newPost, ...prev]); // ← Dodaj od razu na górze
      setShowCreateForm(false);
    } else {
      console.warn("Nowy post nie zawiera użytkownika. Odświeżam z serwera.");
      fetchPosts(); // fallback – pobierz wszystko jeszcze raz
    }
  } catch (error) {
    console.error("Błąd dodawania posta:", error);
    alert("Wystąpił błąd przy dodawaniu posta");
  }
};


  const toggleExpand = (postId) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
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
                <div
                  key={post.id}
                  className={`post ${expandedPostId === post.id ? "expanded" : ""}`}
                  onClick={(e) => {
                    const selection = window.getSelection();
                    if (selection && selection.toString().length === 0) {
                      toggleExpand(post.id);
                    }
                  }}
                >
                  <div className="post-header">
                    <img
                      src={`http://localhost:5000/uploads/${post.User?.profilePicture || "default-profile.jpg"}`}
                      alt="Profil"
                      className="profile-pic"
                    />
                    <span>{post.User?.username || "Użytkownik"}</span>
                  </div>

                  <h3 className="post-title">{post.title}</h3>

                  {expandedPostId === post.id && (
                    <div className="post-description">
                      <p><strong>Opis:</strong><br />{post.description}</p>
                    </div>
                  )}

                      {expandedPostId === post.id && post.locationData?.length > 0 && (
                        <div className="post-map" onClick={(e) => e.stopPropagation()}>
                          <MapContainer
                            center={[post.locationData[0].lat, post.locationData[0].lng]}
                            zoom={5}
                            scrollWheelZoom={true}
                            style={{ height: "220px", width: "100%", borderRadius: "10px" }}
                          >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            {post.locationData.map((loc, i) => (
                              <Marker key={i} position={[loc.lat, loc.lng]} />
                            ))}
                          </MapContainer>
                        </div>
                      )}

                      <p className="post-meta">
                        Wyjazd w dniu: {new Date(post.travelDate).toLocaleDateString("pl-PL")} | Dni: {post.duration} | Cena: {Math.round(post.priceFrom)} - {Math.round(post.priceTo)} PLN | Miejsca: {post.maxPeople}
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
