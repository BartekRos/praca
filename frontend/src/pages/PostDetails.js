import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./styles/PostDetails.css";

const PostDetails = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/posts/${id}`);
        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error("Błąd pobierania posta:", error);
      }
    };

    fetchPost();
  }, [id]);

  if (!post) return <p>Ładowanie...</p>;

  return (
    <div className="post-details-container">
      <h1>{post.title}</h1>
      <div className="post-info">
        <img
          src={post.User.profilePicture || "/default-avatar.png"}
          alt="Profil"
          className="profile-pic"
        />
        <span>{post.User.name}</span>
      </div>
      <p><strong>Opis podróży:</strong> {post.description}</p>
      <p><strong>Kierunek:</strong> {post.country}</p>
      <p><strong>Data wyjazdu:</strong> {post.travelDate}</p>
      <p><strong>Długość podróży:</strong> {post.duration} dni</p>
      <p><strong>Cena:</strong> {post.priceFrom} - {post.priceTo} PLN</p>
      <p><strong>Maks. liczba osób:</strong> {post.maxPeople}</p>

      <button className="contact-btn">Napisz do organizatora</button>
    </div>
  );
};

export default PostDetails;
