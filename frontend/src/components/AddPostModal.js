import React, { useState } from "react";
import "./styles/AddPostModal.css";

const AddPostModal = ({ closeModal }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    country: "",
    travelDate: "",
    duration: "",
    priceFrom: "",
    priceTo: "",
    maxPeople: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Błąd podczas dodawania posta");
      }

      alert("Post dodany!");
      closeModal(); // Zamknięcie okna
      window.location.reload(); // Odświeżenie strony, żeby zobaczyć nowy post
    } catch (error) {
      console.error("Błąd dodawania posta:", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Dodaj nowy post</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="title" placeholder="Tytuł" required onChange={handleChange} />
          <textarea name="description" placeholder="Opis" required onChange={handleChange} />
          <input type="text" name="country" placeholder="Kraj" required onChange={handleChange} />
          <input type="date" name="travelDate" required onChange={handleChange} />
          <input type="number" name="duration" placeholder="Liczba dni" required onChange={handleChange} />
          <input type="number" name="priceFrom" placeholder="Cena od" required onChange={handleChange} />
          <input type="number" name="priceTo" placeholder="Cena do" required onChange={handleChange} />
          <input type="number" name="maxPeople" placeholder="Maksymalna liczba osób" required onChange={handleChange} />
          <button type="submit">Dodaj</button>
          <button type="button" onClick={closeModal}>Anuluj</button>
        </form>
      </div>
    </div>
  );
};

export default AddPostModal;
