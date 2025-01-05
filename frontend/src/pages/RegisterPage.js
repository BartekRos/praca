import React, { useState } from 'react';
import './styles/RegisterPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    age: '',
    city: '',
    profilePicture: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Rejestracja zakończona sukcesem!');
        setFormData({
          email: '',
          password: '',
          name: '',
          age: '',
          city: '',
          profilePicture: '',
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

        <label>Miasto:</label>
        <input
          type="text"
          name="city"
          placeholder="Wprowadź swoje miasto"
          value={formData.city}
          onChange={handleChange}
          required
        />

        <label>Zdjęcie profilowe (URL):</label>
        <input
          type="text"
          name="profilePicture"
          placeholder="Wklej URL do swojego zdjęcia profilowego"
          value={formData.profilePicture}
          onChange={handleChange}
          required
        />

        <button type="submit">Zarejestruj się</button>
      </form>
    </div>
  );
};

export default RegisterPage;
