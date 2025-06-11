import React, { useState, useEffect, useContext } from "react";
import "./styles/TripPostCard.css";
import AuthContext from "../context/AuthContext";
import axios from "axios";

const TripPostCard = ({ post, onClick, onCommentClick }) => {
  const {
    title,
    description,
    duration,
    price,
    photos,
    createdAt,
    User: author,
    id: postId,
  } = post;

  const { user } = useContext(AuthContext);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const isOwner = user?.id === author?.id;

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/trip-posts/${postId}/likes-count`);
        const data = await res.json();
        setLikesCount(data.count);
      } catch (err) {
        console.error("❌ Błąd pobierania lajków:", err);
      }
    };

    const fetchLiked = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/trip-posts/${postId}/liked`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const data = await res.json();
        setLiked(data.liked);
      } catch (err) {
        console.error("❌ Błąd sprawdzania lajku:", err);
      }
    };

    fetchLikes();
    if (user) fetchLiked();
  }, [postId, user]);

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`http://localhost:5000/api/trip-posts/${postId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setLiked(data.liked);
      setLikesCount((prev) => prev + (data.liked ? 1 : -1));
    } catch (err) {
      console.error("❌ Błąd lajkowania:", err);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    const confirmed = window.confirm("Czy na pewno chcesz usunąć ten post?");
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:5000/api/trip-posts/${postId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      window.location.reload();
    } catch (err) {
      console.error("❌ Błąd usuwania posta:", err);
      alert("Nie udało się usunąć posta");
    }
  };

  const handlePrev = () => {
    setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handleClick = (e) => {
    const selection = window.getSelection();
    const clickedEl = e.target;
    const isControl = clickedEl.closest("button, .gallery-arrow, .dot, a");
    const isSelecting = selection && selection.toString().length > 0;

    if (!isControl && !isSelecting) {
      onClick();
    }
  };

  return (
    <div className="trippost-card" onClick={handleClick} style={{ position: "relative" }}>
  {isOwner && (
    <div
      className="delete-post-button"
      title="Usuń post"
      onClick={handleDelete}
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        cursor: "pointer",
        fontSize: "22px",
        color: "crimson",
        fontWeight: "bold",
        zIndex: 10, // może być więcej jeśli trzeba
      }}
    >
      ❌
    </div>
  )}


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
      <p className="trippost-description">{description}</p>

      {Array.isArray(photos) && photos.length > 0 && (
        <div className="trippost-gallery">
          <img
            src={`http://localhost:5000/uploads/${photos[currentPhotoIndex]}`}
            alt={`relacja ${currentPhotoIndex + 1}`}
            className="trippost-main-image"
          />
          {photos.length > 1 && (
            <>
              <button className="gallery-arrow left" onClick={(e) => { e.stopPropagation(); handlePrev(); }}>
                ‹
              </button>
              <button className="gallery-arrow right" onClick={(e) => { e.stopPropagation(); handleNext(); }}>
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
        {price && <span>Koszt: {parseFloat(price)} PLN</span>} |{" "}
        {createdAt && <span>Dodano: {new Date(createdAt).toLocaleDateString("pl-PL")}</span>}
      </div>

      <div className="trippost-actions">
        <button
          className={`like-button ${liked ? "liked" : ""}`}
          onClick={handleLike}
        >
          ❤️ {likesCount}
        </button>
        <button
          className="comment-button"
          onClick={(e) => {
            e.stopPropagation();
            onCommentClick?.();
          }}
        >
          💬
        </button>
      </div>
    </div>
  );
};

export default TripPostCard;
