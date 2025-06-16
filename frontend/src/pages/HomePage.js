import React, { useEffect, useState, useContext, useRef } from "react";
import Navbar from "../components/Navbar";
import CreatePostSection from "../components/CreatePostSection";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./styles/HomePage.css";
import AuthContext from "../context/AuthContext";
import axios from "axios";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [filters, setFilters] = useState({
    location: "",
    maxPrice: "",
    date: "",
    duration: "",
    maxPeople: "",
  });

  const { user } = useContext(AuthContext);
  const newPostRef = useRef(null);

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
        setFilteredPosts(sorted);
      }
    } catch (error) {
      console.error("Błąd pobierania postów:", error);
    }
  };

  const applyFiltersToList = (list, filters) => {
    return list.filter((post) => {
      const { location, maxPrice, date, duration, maxPeople } = filters;
      const titleMatch = location
        ? post.title.toLowerCase().includes(location.toLowerCase())
        : true;
      const priceMatch = maxPrice
        ? parseFloat(maxPrice) >= post.priceFrom && parseFloat(maxPrice) <= post.priceTo
        : true;
      const dateMatch = date ? post.travelDate?.startsWith(date) : true;
      const durationMatch = duration ? +duration === post.duration : true;
      const peopleMatch = maxPeople ? +maxPeople === post.maxPeople : true;

      return titleMatch && priceMatch && dateMatch && durationMatch && peopleMatch;
    });
  };

  const applyFilters = () => {
    const result = applyFiltersToList(posts, filters);
    setFilteredPosts(result);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
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
  
      if (!response.ok) throw new Error("Nie udało się dodać posta");
  
      const newPost = await response.json();
      const completePost = { ...newPost, User: user };
  
      setPosts((prev) => {
        const updated = [completePost, ...prev];
        const filtered = applyFiltersToList(updated, filters);
        setFilteredPosts(filtered);
        return updated;
      });
  
      setShowCreateForm(false);
  
      // ⬇️ przewiń stronę na samą górę
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Błąd dodawania posta:", error);
      alert("Wystąpił błąd przy dodawaniu posta");
    }
  };
  

  const handleDeletePost = async (e, postId) => {
    e.stopPropagation();
    const confirmed = window.confirm("Czy na pewno chcesz usunąć ten post?");
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setPosts((prev) => {
        const updated = prev.filter((post) => post.id !== postId);
        const filtered = applyFiltersToList(updated, filters);
        setFilteredPosts(filtered);
        return updated;
      });
    } catch (err) {
      console.error("❌ Błąd usuwania posta:", err);
      alert("Nie udało się usunąć posta");
    }
  };

  const toggleExpand = (postId) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  const handleSaveFilters = () => {
    applyFilters();
  };

  return (
    <>
      <Navbar />
      <div className="homepage-container">
        <div className="sidebar-left">
          {!showCreateForm && (
            <>
              <button className="add-post-sidebar" onClick={() => setShowCreateForm(true)}>
                + Dodaj post
              </button>

              <div className="filters-container">
                <h4>Filtry</h4>
                <input
                  type="text"
                  placeholder="Kraj/Miasto"
                  value={filters.location}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Cena do"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                />
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange("date", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Liczba dni"
                  value={filters.duration}
                  onChange={(e) => handleFilterChange("duration", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Liczba szukanych osób"
                  value={filters.maxPeople}
                  onChange={(e) => handleFilterChange("maxPeople", e.target.value)}
                />
                <button className="save-filters-button" onClick={handleSaveFilters}>
                  Szukaj
                </button>
              </div>
            </>
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
              {filteredPosts.map((post, index) => (
                <div
                  key={post.id}
                  ref={index === 0 ? newPostRef : null}
                  className={`post ${expandedPostId === post.id ? "expanded" : ""}`}
                  onClick={(e) => {
                    const selection = window.getSelection();
                    if (selection && selection.toString().length === 0) {
                      toggleExpand(post.id);
                    }
                  }}
                  style={{ position: "relative" }}
                >
                  {user?.id === post.User?.id && (
                    <div
                      className="delete-post2-button"
                      title="Usuń post"
                      onClick={(e) => handleDeletePost(e, post.id)}
                    >
                      ❌
                    </div>
                  )}

                  <div className="post-header" style={{ display: "flex", justifyContent: "space-between" }}>
                    <div
                      className="user-info"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (post.User?.id) {
                          window.location.href = `/profile/${post.User.id}`;
                        }
                      }}
                      style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                    >
                      <img
                        src={`http://localhost:5000/uploads/${post.User?.profilePicture || "default-profile.jpg"}`}
                        alt="Profil"
                        className="profile-pic"
                      />
                      <span style={{ marginLeft: "8px" }}>{post.User?.username || "Użytkownik"}</span>
                    </div>

                    {expandedPostId === post.id && post.User?.id !== user?.id && (
                      <div
                        className="message-icon"
                        title="Napisz wiadomość"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/messages?userId=${post.User.id}`;
                        }}
                        style={{ cursor: "pointer", fontSize: "20px" }}
                      >
                        💬
                      </div>
                    )}
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
                    Wyjazd w dniu: {new Date(post.travelDate).toLocaleDateString("pl-PL")} | Dni: {post.duration} | Cena: {Math.round(post.priceFrom)} - {Math.round(post.priceTo)} PLN | Liczba szukanych osób: {post.maxPeople}
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
