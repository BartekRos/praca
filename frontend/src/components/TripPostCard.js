import React, { useState, useEffect, useContext } from "react";
import "./styles/TripPostCard.css";
import AuthContext from "../context/AuthContext";
import axios from "axios";

/**
 * TripPostCard
 * ------------
 * props:
 *   post           – pełny obiekt posta
 *   likes          – (opc.) liczba lajków przekazana z TripsPage
 *   likedByMe      – (opc.) czy bieżący user polubił (z TripsPage)
 *   onClick
 *   onCommentClick
 *   onUpdateLikes  – callback (postId, newLikeCount, likedFlag)  ← KOLEJNOŚĆ!
 */
const TripPostCard = ({
  post,
  likes,
  likedByMe,
  onClick,
  onCommentClick,
  onUpdateLikes,
}) => {
  const {
    title,
    description,
    duration,
    price,
    photos = [],
    createdAt,
    User: author,
    id: postId,
  } = post;

  const { user } = useContext(AuthContext);

  /* ---------- LOCAL STATE ---------- */
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [likesCount, setLikesCount]               = useState(likes ?? 0);
  const [liked,      setLiked]                    = useState(likedByMe ?? false);

  const isOwner = user?.id === author?.id;

  /* ------ synchronizacja z props ------ */
  useEffect(() => { setLikesCount(likes ?? 0); },   [likes]);
  useEffect(() => {
    if (likedByMe !== undefined) setLiked(!!likedByMe);
  }, [likedByMe]);

  /* ------ fallback: pobranie z API (gdy TripsPage nie poda) ------ */
  useEffect(() => {
    if (likes === undefined) {
      fetch(`http://localhost:5000/api/trip-posts/${postId}/likes-count`)
        .then((r) => r.json())
        .then(({ count }) => setLikesCount(count))
        .catch((err) => console.error("❌ Błąd pobierania lajków:", err));
    }

    if (user && likedByMe === undefined) {
      fetch(`http://localhost:5000/api/trip-posts/${postId}/liked`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
        .then((r) => r.json())
        .then(({ liked }) => setLiked(liked))
        .catch((err) => console.error("❌ Błąd sprawdzania lajku:", err));
    }
  }, [postId, user, likes, likedByMe]);

  /* ---------- HANDLERY ---------- */
  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const res  = await fetch(
        `http://localhost:5000/api/trip-posts/${postId}/like`,
        { method: "POST", headers: { Authorization: `Bearer ${user.token}` } }
      );
      const { liked: newLiked } = await res.json(); // { liked: boolean }

      const newCount = likesCount + (newLiked ? 1 : -1);
      setLiked(newLiked);
      setLikesCount(newCount);

      // 👉 informujemy TripsPage: (postId, newCount, newLiked)
      onUpdateLikes?.(postId, newCount, newLiked);
    } catch (err) {
      console.error("❌ Błąd lajkowania:", err);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Czy na pewno chcesz usunąć ten post?")) return;

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

  const handlePrev = () =>
    setCurrentPhotoIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  const handleNext = () =>
    setCurrentPhotoIndex((i) => (i === photos.length - 1 ? 0 : i + 1));

  const handleCardClick = (e) => {
    const selection = window.getSelection();
    const clicked   = e.target;
    const isCtrl    =
      clicked.closest("button, .gallery-arrow, .dot, a") ||
      (selection && selection.toString().length);
    if (!isCtrl) onClick?.();
  };

  /* ---------- RENDER ---------- */
  return (
    <div className="trippost-card" onClick={handleCardClick}>
      {isOwner && (
        <div className="delete-post3-button" title="Usuń post" onClick={handleDelete}>
          ❌
        </div>
      )}

      {/* header */}
      <div className="trippost-header">
        <a href={`/profile/${author?.id}`} onClick={(e) => e.stopPropagation()}>
          <img
            src={`http://localhost:5000/uploads/${
              author?.profilePicture || "default-profile.jpg"
            }`}
            alt="avatar"
            className="trippost-avatar"
          />
        </a>
        <span className="trippost-username">{author?.username}</span>
      </div>

      <h3 className="trippost-title">{title}</h3>
      <p className="trippost-description">{description}</p>

      {/* gallery */}
      {!!photos.length && (
        <div className="trippost-gallery">
          <img
            src={`http://localhost:5000/uploads/${photos[currentPhotoIndex]}`}
            alt={`relacja ${currentPhotoIndex + 1}`}
            className="trippost-main-image"
          />
          {photos.length > 1 && (
            <>
              <button
                className="gallery-arrow left"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
              >
                ‹
              </button>
              <button
                className="gallery-arrow right"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
              >
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

      {/* meta */}
      <div className="trippost-meta">
        {duration && <span>Spędzonych dni: {duration}</span>}
        {price && <span>Koszt: {parseFloat(price)} PLN</span>} |{" "}
        {createdAt && (
          <span>Dodano: {new Date(createdAt).toLocaleDateString("pl-PL")}</span>
        )}
      </div>

      {/* actions */}
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
