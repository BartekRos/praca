// src/components/EditProfileForm.js
import React, { useState, useContext } from "react";
import axios          from "axios";
import cities         from "../utils/cities";
import AuthContext    from "../context/AuthContext";
import "./styles/EditProfileForm.css";

const API = "http://localhost:5000/api";

const EditProfileForm = ({ onClose, onProfileUpdated }) => {
  const { user, login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    age:             user.age  || "",
    city:            user.city || "",
    currentPassword: "",
    newPassword:     "",
    profilePicture:  null,
  });

  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState("");

  /* ---------- zmiany pól ---------- */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePicture") {
      setFormData((p) => ({ ...p, profilePicture: files[0] || null }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  /* ---------- wysyłka ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setMsg("");

    const { age, city, currentPassword, newPassword, profilePicture } = formData;

    let payload;
    const headers = { Authorization: `Bearer ${user.token}` };

    if (profilePicture) {
      /* multipart (plik) */
      payload = new FormData();
      payload.append("currentPassword", currentPassword);
      if (newPassword) payload.append("newPassword", newPassword);
      if (age)         payload.append("age",  age);
      if (city)        payload.append("city", city);
      payload.append("profilePicture", profilePicture);
      /* Content-Type ustawia przeglądarka */
    } else {
      /* JSON (bez pliku) */
      payload = {
        currentPassword,
        newPassword : newPassword || undefined,
        age         : age  || undefined,
        city        : city || undefined,
      };
      headers["Content-Type"] = "application/json";
    }

    try {
      const res      = await axios.put(`${API}/auth/update-profile`, payload, { headers });
      const updated  = res.data?.user;

      if (updated) {
        /* odśwież kontekst i localStorage */
        login({ ...user, ...updated }, user.token);
        onProfileUpdated?.(updated);
        onClose();
      }
    } catch (err) {
      console.error("❌ Błąd aktualizacji profilu:", err);
      setMsg(err?.response?.data?.message || "Wystąpił błąd.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="edit-profile-form">
      <h3>Edycja profilu</h3>

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
          {cities.map((c, i) => (
            <option key={i} value={c}>{c}</option>
          ))}
        </select>

        <label>Nowe zdjęcie profilowe:</label>
        <input
          type="file"
          name="profilePicture"
          accept="image/*"
          onChange={handleChange}
        />

        <label>Aktualne hasło (wymagane):</label>
        <input
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          required
        />

        {msg && <p className="edit-message">{msg}</p>}

        <div className="edit-form-buttons">
          <button type="submit" disabled={loading}>
            {loading ? "Zapisywanie…" : "Zapisz zmiany"}
          </button>
          <button type="button" onClick={onClose}>Anuluj</button>
        </div>
      </form>
    </div>
  );
};

export default EditProfileForm;
