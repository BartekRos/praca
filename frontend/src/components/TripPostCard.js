import React from "react";
import "./styles/TripPostCard.css";

const TripPostCard = ({ post }) => {
  const {
    title,
    description,
    duration,
    price,
    photos,
    createdAt,
    User: author,
  } = post;


  return (
    <div className="trippost-card">
      {/* Header: avatar + username + data stworzenia */}
      <div className="trippost-header">
        <img
          src={`http://localhost:5000/uploads/${author?.profilePicture || "default-profile.jpg"}`}
          alt="avatar"
          className="trippost-avatar"
        />
        <div className="trippost-author">
          <span className="trippost-username">{author?.username}</span>
        </div>
      </div>

      {/* Tytuł i zdjęcie główne (jeśli jest) */}
      <h3 className="trippost-title">{title}</h3>

      {Array.isArray(photos) && photos.length > 0 && (
        <img
          src={`http://localhost:5000/uploads/${photos[0]}`}
          alt="relacja"
          className="trippost-main-image"
        />
      )}

      {/* Opis */}
      <p className="trippost-description">{description}</p>

      {/* Podsumowanie – tylko jeśli dane istnieją */}
      <div className="trippost-meta" >
        {duration && <span>Spędzonych dni: {duration}</span>}
        {price && <span>Koszt: {parseFloat(price)} PLN</span>}
        {createdAt && <span>Dodano: {new Date(createdAt).toLocaleDateString("pl-PL")}</span>}
      </div>

      {/* Przyciski interakcji */}
      <div className="trippost-actions">
        <button className="like-button">❤️</button>
        <button className="comment-button">💬</button>
      </div>
    </div>
  );
};

export default TripPostCard;
