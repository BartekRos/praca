import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./styles/PostDetails.css";

const PostDetails = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/posts/${id}`);

        if (!response.ok) {
          throw new Error("Błąd pobierania posta");
        }

        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error("Błąd pobierania posta:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) return <p>Ładowanie...</p>;
  if (!post) return <p>Nie znaleziono posta</p>;

  return (
    <div className="post-details-container">
      <div className="post-details-card">
        <h2>{post.title}</h2>
        <p><strong>Opis:</strong> {post.description}</p>
        <p><strong>Kraj:</strong> {post.country}</p>
        <p><strong>Data wyjazdu:</strong> {post.travelDate}</p>
        <p><strong>Czas trwania:</strong> {post.duration} dni</p>
        <p><strong>Cena:</strong> {post.priceFrom} - {post.priceTo} PLN</p>
        <p><strong>Liczba miejsc:</strong> {post.maxPeople}</p>
        
        <div className="post-author">
          <img src={post.User?.profilePicture || "/default-profile.jpg"} alt="Profil" />
          <strong>{post.User?.name || "Anonimowy użytkownik"}</strong>
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
