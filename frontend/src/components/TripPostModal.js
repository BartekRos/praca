import React, { useState, useEffect, useContext } from "react";
import "./styles/TripPostModal.css";
import AuthContext from "../context/AuthContext";
import TripCommentsSection from "./TripCommentsSection";

const TripPostModal = ({ post, onClose }) => {
  const {
    title,
    description,
    photos,
    duration,
    price,
    createdAt,
    User: author,
  } = post;

  const [photoIndex, setPhotoIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { user } = useContext(AuthContext);
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);


  useEffect(() => {
    // Zablokuj scrollowanie strony po otwarciu modala
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto"; // Przy zamknięciu odblokuj
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
  
    const fetchLikes = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/trip-posts/${post.id}/likes-count`);
        const data = await res.json();
        setLikesCount(data.count);
      } catch (err) {
        console.error("❌ Błąd pobierania lajków:", err);
      }
    };
  
    const fetchLiked = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/trip-posts/${post.id}/liked`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json();
        setLiked(data.liked);
      } catch (err) {
        console.error("❌ Błąd sprawdzania lajku:", err);
      }
    };
  
    fetchLikes();
    if (user) fetchLiked();
  
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [post.id, user]);
  

  const handlePrev = () => {
    setPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handleLike = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/trip-posts/${post.id}/like`, {
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
  

  const handleBackdropClick = (e) => {
    const selection = window.getSelection();
    const clickedElement = e.target;

    const isArrow = clickedElement.closest(".modal-arrow");
    const isDot = clickedElement.closest(".dot");
    const isLikeOrComment = clickedElement.closest(".modal-actions button");

    if (
      (selection && selection.toString().length > 0) ||
      isArrow ||
      isDot ||
      isLikeOrComment
    ) {
      return;
    }

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Galeria po lewej */}
        <div className="modal-left">
          <img
            src={`http://localhost:5000/uploads/${photos[photoIndex]}`}
            alt={`Zdjęcie ${photoIndex + 1}`}
            className="modal-photo"
          />
          {photos.length > 1 && (
            <>
              <button className="modal-arrow left" onClick={handlePrev}>
                ‹
              </button>
              <button className="modal-arrow right" onClick={handleNext}>
                ›
              </button>
              <div className="modal-dots">
                {photos.map((_, i) => (
                  <span
                    key={i}
                    className={`dot ${i === photoIndex ? "active" : ""}`}
                    onClick={() => setPhotoIndex(i)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Opis + komentarze po prawej */}
        <div className="modal-right">
          <div className="modal-header">
            <a href={`/profile/${author?.id}`}>
              <img
                src={`http://localhost:5000/uploads/${author?.profilePicture || "default-profile.jpg"}`}
                alt="avatar"
                className="modal-avatar"
              />
            </a>
            <strong>{author?.username}</strong>
            <button onClick={onClose} className="modal-close">×</button>
          </div>

          {/* Scrollowana zawartość */}
          <div className="modal-scrollable">
            <h2 className="modal-title">{title}</h2>

            <div className="modal-description">
              {description ? (
                <>
                  {showFullDescription || description.length < 120
                    ? description
                    : `${description.substring(0, 120)}...`}
                  {description.length >= 120 && (
                    <button
                      className="toggle-description"
                      onClick={() => setShowFullDescription((prev) => !prev)}
                    >
                      {showFullDescription ? "Zwiń" : "Czytaj więcej"}
                    </button>
                  )}
                </>
              ) : (
                <p className="empty-description"><i>Brak opisu</i></p>
              )}
            </div>

            <div className="modal-meta">
              {duration && <span>🕒 {duration} dni</span>}
              {price && <span>💰 {parseFloat(price)} PLN</span>}
              {createdAt && <span>📅 {new Date(createdAt).toLocaleDateString("pl-PL")}</span>}
            </div>

            <div className="modal-comments">
              <TripCommentsSection postId={post.id} postAuthorId={author?.id} />
            </div>
          </div>

          <div className="modal-actions">
            <button
              className={`like-button ${liked ? "liked" : ""}`}
              onClick={handleLike}
            >
              ❤️ {likesCount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPostModal;
