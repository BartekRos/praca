import React, { useState } from "react";
import "./styles/TripPostCard.css";

const TripPostCard = ({ post, onClick }) => {
  const {
    title,
    description,
    duration,
    price,
    photos,
    createdAt,
    User: author,
  } = post;

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handleClick = (e) => {
    const selection = window.getSelection();
    const clickedEl = e.target;

    const isControl = clickedEl.closest("button, .gallery-arrow, .dot, a");
    const isSelecting = selection && selection.toString().length > 0;

    if (!isControl && !isSelecting) {
      onClick(); // tylko jeśli nie kliknięto w kontrolkę ani nie zaznaczano tekstu
    }
  };

  return (
    <div className="trippost-card" onClick={handleClick}>
      <div className="trippost-header">
        <a href={`/profile/${author?.id}`} onClick={(e) => e.stopPropagation()}>
          <img
            src={`http://localhost:5000/uploads/${author?.profilePicture || "default-profile.jpg"}`}
            alt="avatar"
            className="trippost-avatar"
          />
        </a>
        <div className="trippost-author">
          <span className="trippost-username">{author?.username}</span>
        </div>
      </div>

      <h3 className="trippost-title">{title}</h3>

      <p className="trippost-description">
        {description}
      </p>

      {Array.isArray(photos) && photos.length > 0 && (
        <div className="trippost-gallery">
          <img
            src={`http://localhost:5000/uploads/${photos[currentPhotoIndex]}`}
            alt={`relacja ${currentPhotoIndex + 1}`}
            className="trippost-main-image"
          />
          {photos.length > 1 && (
            <>
              <button className="gallery-arrow left" onClick={handlePrev}>
                ‹
              </button>
              <button className="gallery-arrow right" onClick={handleNext}>
                ›
              </button>
              <div className="gallery-dots">
                {photos.map((_, i) => (
                  <span
                    key={i}
                    className={`dot ${i === currentPhotoIndex ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPhotoIndex(i);
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="trippost-meta">
        {duration && <span>Spędzonych dni: {duration}</span>}
        {price && <span>Koszt: {parseFloat(price)} PLN</span>}
        {createdAt && <span>Dodano: {new Date(createdAt).toLocaleDateString("pl-PL")}</span>}
      </div>

      <div className="trippost-actions">
        <button className="like-button" onClick={(e) => e.stopPropagation()}>❤️</button>
        <button className="comment-button" onClick={(e) => e.stopPropagation()}>💬</button>
      </div>
    </div>
  );
};

export default TripPostCard;
