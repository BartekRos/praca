import React, { useState, useContext } from "react";
import axios from "axios";
import cities from "../utils/cities";
import "./styles/EditProfileForm.css";
import AuthContext from "../context/AuthContext";

const EditProfileForm = ({ onClose, onProfileUpdated }) => {
  const { user, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    age: "",
    city: "",
    currentPassword: "",
    newPassword: "",
    profilePicture: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePicture") {
      setFormData((prev) => ({ ...prev, profilePicture: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const data = new FormData();
    data.append("currentPassword", formData.currentPassword);
    if (formData.newPassword) data.append("newPassword", formData.newPassword);
    if (formData.age) data.append("age", formData.age);
    if (formData.city) data.append("city", formData.city);
    if (formData.profilePicture) data.append("profilePicture", formData.profilePicture);

    try {
      const response = await axios.put("http://localhost:5000/api/auth/update-profile", data, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const updatedUser = response.data?.user;
      if (updatedUser) {
        // Zapisz w localStorage i kontekście
        localStorage.setItem("user", JSON.stringify({ ...user, ...updatedUser }));
        setUser((prev) => ({ ...prev, ...updatedUser }));

        if (onProfileUpdated) onProfileUpdated(updatedUser); // np. dla ProfilePage
        setMessage("Dane zostały zaktualizowane.");
        onClose();
      }
    } catch (err) {
      console.error("❌ Błąd aktualizacji profilu:", err);
      setMessage(err?.response?.data?.message || "Wystąpił błąd.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-form">
      <h3>Edytuj dane</h3>
      <form onSubmit={handleSubmit}>
        <label>Nowe hasło:</label>
        <input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          placeholder="Pozostaw puste, jeśli bez zmian"
        />

        <label>Wiek:</label>
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          min="18"
        />

        <label>Miasto:</label>
        <select name="city" value={formData.city} onChange={handleChange}>
          <option value="">Wybierz miasto</option>
          {cities.map((city, index) => (
            <option key={index} value={city}>{city}</option>
          ))}
        </select>

        <label>Nowe zdjęcie profilowe:</label>
        <input type="file" name="profilePicture" accept="image/*" onChange={handleChange} />

        <label>Aktualne hasło (wymagane):</label>
        <input
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          required
        />

        {message && <p className="edit-message">{message}</p>}

        <div className="edit-form-buttons">
          <button type="submit" disabled={loading}>
            {loading ? "Zapisywanie..." : "Zapisz zmiany"}
          </button>
          <button type="button" onClick={onClose}>Anuluj</button>
        </div>
      </form>
    </div>
  );
};

export default EditProfileForm;
