import React from "react";
import "./styles/PostDetailsModal.css";

const PostDetailsModal = ({ post, onClose }) => {
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{post.title}</h2>
        <p><strong>Opis:</strong> {post.description}</p>
        <p><strong>Kraj:</strong> {post.country}</p>
        <p><strong>Data wyjazdu:</strong> {post.travelDate}</p>
        <p><strong>Czas trwania:</strong> {post.duration} dni</p>
        <p><strong>Cena:</strong> {post.priceFrom} - {post.priceTo} PLN</p>
        <p><strong>Liczba wolnych miejsc:</strong> {post.maxPeople}</p>
        
        <div className="post-author">
        <img
            src={`http://localhost:5000/uploads/${post.User?.profilePicture || 'default-profile.jpg'}`}
            alt="Profil" />
          <strong>{post.User?.name || "Anonimowy użytkownik"}</strong>
        </div>
      </div>
    </div>
  );
};

export default PostDetailsModal;
