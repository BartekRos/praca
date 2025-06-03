import React, { useState, useEffect, useContext, useCallback } from "react";
import AuthContext from "../context/AuthContext";
import "./styles/TripCommentsSection.css";

const TripCommentsSection = ({ postId, postAuthorId }) => {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [expandedComments, setExpandedComments] = useState({});

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/trip-posts/${postId}/comments`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error("❌ Błąd pobierania komentarzy:", err);
    }
  }, [postId]);
  
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);
  

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (newComment.length > 300) return alert("Komentarz może mieć maksymalnie 300 znaków");
    try {
      const res = await fetch(`http://localhost:5000/api/trip-posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ content: newComment })
      });
      const added = await res.json();
      setComments((prev) => [...prev, added]);
      setNewComment("");
    } catch (err) {
      console.error("❌ Błąd dodawania komentarza:", err);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await fetch(`http://localhost:5000/api/trip-posts/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("❌ Błąd usuwania komentarza:", err);
    }
  };

  const toggleExpand = (id) => {
    setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="trip-comments-section">
      <h4>Komentarze</h4>

      <div className="comment-input">
        <textarea
          placeholder="Napisz komentarz... (max 300 znaków)"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          maxLength={300}
          rows={3}
        />
        <button onClick={handleAddComment}>Dodaj</button>
      </div>

      {comments.map((comment) => {
        const isOwner = comment.userId === user.id || postAuthorId === user.id;
        const expanded = expandedComments[comment.id];
        const lines = comment.content.split("\n");
        const preview = lines.slice(0, 2).join("\n") + (lines.length > 2 ? "..." : "");

        return (
          <div key={comment.id} className="comment">
            <div className="comment-author">
              <img
                src={`http://localhost:5000/uploads/${comment.User.profilePicture || "default-profile.jpg"}`}
                alt="avatar"
              />
              <span>{comment.User.username}</span>
            </div>
            <div className="comment-content">
              <pre>{expanded ? comment.content : preview}</pre>
              {lines.length > 2 && (
                <button className="toggle-button" onClick={() => toggleExpand(comment.id)}>
                  {expanded ? "Zwiń" : "Czytaj więcej"}
                </button>
              )}
            </div>
            {isOwner && (
              <button className="delete-button" onClick={() => handleDelete(comment.id)}>❌</button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TripCommentsSection;
