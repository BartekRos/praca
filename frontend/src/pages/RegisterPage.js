import React, { useState } from 'react';
import { Link } from 'react-router';
import './styles/RegisterPage.css';
import cities from '../utils/cities';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    age: '',
    city: '',
    profilePicture: null, // Teraz obsługujemy plik
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profilePicture: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData(); // Używamy FormData do przesyłania plików
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('name', formData.name);
    data.append('age', formData.age);
    data.append('city', formData.city);

    if (formData.profilePicture) {
      data.append('profilePicture', formData.profilePicture);
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        alert('Rejestracja zakończona sukcesem!');
        setFormData({
          email: '',
          password: '',
          name: '',
          age: '',
          city: '',
          profilePicture: null,
        });
      } else {
        const errorData = await response.json();
        alert(`Błąd: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Błąd podczas rejestracji:', error);
      alert('Wystąpił błąd podczas rejestracji.');
    }
  };

  return (
    <div className="register-container">
      <h1>Rejestracja</h1>
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          placeholder="Wprowadź swój email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>Hasło:</label>
        <input
          type="password"
          name="password"
          placeholder="Wprowadź swoje hasło"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <label>Imię:</label>
        <input
          type="text"
          name="name"
          placeholder="Wprowadź swoje imię"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label>Wiek:</label>
        <input
          type="number"
          name="age"
          placeholder="Wprowadź swój wiek"
          value={formData.age}
          onChange={handleChange}
          required
        />
        {/* Wybór miasta */}
        <label>Miasto:</label>
        <select name="city" value={formData.city} onChange={handleChange} required>
          <option value="">Wybierz miasto</option>
          {cities.map((city, index) => (
            <option key={index} value={city}>{city}</option>
          ))}
        </select>

        <label>Zdjęcie profilowe (opcjonalne):</label>
        <input
          type="file"
          name="profilePicture"
          onChange={handleFileChange}
        />

        <button type="submit">Zarejestruj się</button>
      </form>
      <div className="login-link">
          <Link to="/login">Przejdź do logowania</Link>
        </div>
    </div>
  );
};

export default RegisterPage;
