import React, { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './styles/FriendsPage.css';

const SearchFriendsPage = () => {
  const { user } = useContext(AuthContext);
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");

  const handleSearch = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/friends/search?q=${query}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setResults(res.data);
    } catch (error) {
      console.error('Błąd wyszukiwania:', error);
    }
  };

  const handleSendRequest = async (friendId) => {
    try {
      await axios.post('http://localhost:5000/api/friends/request', { friendId }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      alert('Zaproszenie wysłane!');
      handleSearch();
    } catch (error) {
      console.error('Błąd wysyłania zaproszenia:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="friends-page">
        <h1>Szukaj znajomych</h1>
        <input
          type="text"
          placeholder="Wpisz nazwę lub imię"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Szukaj</button>

        <div className="friends-list">
          {results.map(user => (
            <div key={user.id} className="friend-card">
              <img src={`http://localhost:5000/uploads/${user.profilePicture}`} alt="Profilowe" />
              <div>
                <strong>{user.name}</strong>
                <p>{user.username}</p>
              </div>
              <div className="friend-actions">
                <button onClick={() => handleSendRequest(user.id)}>Dodaj znajomego</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SearchFriendsPage;
