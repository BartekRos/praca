import React, { useState, useContext } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AuthContext from "../context/AuthContext";
import axios from "axios";
import "./styles/CompanionPostCard.css"; // dodaj jeśli masz osobny plik css

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const CompanionPostCard = ({ post }) => {
  const { user } = useContext(AuthContext);
  const [expanded, setExpanded] = useState(false);
  const isOwner = user?.id === post.User?.id;

  const handleToggle = () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) {
      setExpanded((prev) => !prev);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    const confirmed = window.confirm("Czy na pewno chcesz usunąć ten post?");
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:5000/api/posts/${post.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      window.location.reload(); // lub użyj callbacku
    } catch (err) {
      console.error("❌ Błąd usuwania posta:", err);
      alert("Nie udało się usunąć posta");
    }
  };

  return (
    <div className={`post ${expanded ? "expanded" : ""}`} onClick={handleToggle} style={{ position: "relative" }}>
      {isOwner && (
        <div
          className="delete-post1-button"
          title="Usuń post"
          onClick={handleDelete}
        >
          ❌
        </div>
      )}

      <div className="post-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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

        {expanded && post.User?.id !== user?.id && (
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

      {expanded && (
        <>
          <div className="post-description">
            <p><strong>Opis:</strong><br />{post.description}</p>
          </div>

          {post.locationData?.length > 0 && (
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
        </>
      )}

      <p className="post-meta">
        Wyjazd w dniu: {new Date(post.travelDate).toLocaleDateString("pl-PL")} | Dni: {post.duration} | Cena: {Math.round(post.priceFrom)} - {Math.round(post.priceTo)} PLN | Miejsca: {post.maxPeople}
      </p>
    </div>
  );
};

export default CompanionPostCard;
