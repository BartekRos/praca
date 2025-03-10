import React, { useState, useContext } from 'react';
import { Link } from 'react-router';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './styles/LoginPage.css';

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Błąd logowania");
      }

      login(data.user, data.token);
      navigate("/");
    } catch (error) {
      console.error("Błąd logowania:", error);
      alert("Nie udało się zalogować.");
    }
  };

  return (
    <div className="login-container">
      <h1>Logowanie</h1>
      <form onSubmit={handleLogin}>
        <label>Email:</label>
        <input
          type="email"
          placeholder="Wprowadź swój email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label>Hasło:</label>
        <input
          type="password"
          placeholder="Wprowadź swoje hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      <div className="register-link">
          <p>Nie masz jeszcze konta?</p>
          <Link to="/register">Zarejestruj się tutaj</Link>
        </div>
    </div>
  );
};

export default LoginPage;
