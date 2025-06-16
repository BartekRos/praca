import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './styles/FriendsPage.css';

const FriendsPage = () => {
  const { user } = useContext(AuthContext);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friendSearch, setFriendSearch] = useState('');
  const [openMenu, setOpenMenu] = useState(null);

  const navigate = useNavigate();

  const fetchFriends = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/friends', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setFriends(res.data);
    } catch (error) {
      console.error('Błąd pobierania znajomych:', error);
    }
  }, [user.token]);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/friends/requests', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setRequests(res.data);
    } catch (error) {
      console.error('Błąd pobierania zaproszeń:', error);
    }
  }, [user.token]);

  const handleAccept = async (requestId) => {
    try {
      await axios.put(`http://localhost:5000/api/friends/accept/${requestId}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchRequests();
      fetchFriends();
    } catch (error) {
      console.error('Błąd akceptacji zaproszenia:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/friends/search?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSearchResults(res.data);
    } catch (error) {
      console.error('Błąd wyszukiwania użytkowników:', error);
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

  const handleRemoveFriend = async (friendId) => {
    try {
      await axios.delete(`http://localhost:5000/api/friends/${friendId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchFriends();
    } catch (error) {
      console.error('Błąd usuwania znajomego:', error);
      alert(error.response?.data?.message || 'Błąd usuwania znajomego');
    }
  };

  const handleDecline = async (requestId) => {
    try {
      await axios.delete(`http://localhost:5000/api/friends/decline/${requestId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchRequests();
    } catch (error) {
      console.error('Błąd odrzucania zaproszenia:', error);
      alert(error.response?.data?.message || 'Błąd odrzucania zaproszenia');
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, [fetchFriends, fetchRequests]);

  useEffect(() => {
    const handlePageShow = () => {
      fetchFriends();
      fetchRequests();
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [fetchFriends, fetchRequests]);

  useEffect(() => {
    const handleFocus = () => {
      fetchFriends();
      fetchRequests();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchFriends, fetchRequests]);

  return (
    <>
      <Navbar />
      <div className="friends-page">
        <h1>Znajomi</h1>

        {/* WYSZUKIWARKA OGÓLNA */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Wyszukaj użytkownika po nazwie lub imieniu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={handleSearch}>Szukaj</button>
        </div>

        {searchResults.length > 0 && (
          <div>
            <h2>Wyniki wyszukiwania</h2>
            {searchResults.map(user => (
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
        )}

        {/* ZAPROSZENIA */}
        <div>
          <h2>Zaproszenia do znajomych</h2>
          {requests.length === 0 ? (
            <p style={{ color: '#777', fontStyle: 'italic', marginTop: '5px' }}>Brak zaproszeń</p>
          ) : (
            requests.map(r => (
              <div key={r.id} className="friend-card">
                <img src={`http://localhost:5000/uploads/${r.profilePicture}`} alt="Profilowe" />
                <div>
                  <strong>{r.name}</strong>
                  <p>{r.username}</p>
                </div>
                <div className="friend-actions">
                  <button onClick={() => handleAccept(r.requestId)}>Akceptuj</button>
                  <button style={{ color: 'red' }} onClick={() => handleDecline(r.requestId)}>Odrzuć</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ZNAJOMI */}
        <div>
          <h2>Twoi znajomi</h2>

          {/* WYSZUKIWARKA WŚRÓD ZNAJOMYCH */}
          <input
            type="text"
            placeholder="Wyszukaj wśród znajomych..."
            value={friendSearch}
            onChange={(e) => setFriendSearch(e.target.value)}
            className="friend-search-input"
          />

          {friends
            .filter(f => f.name.toLowerCase().includes(friendSearch.toLowerCase()) || f.username.toLowerCase().includes(friendSearch.toLowerCase()))
            .map(f => (
              <div key={f.id} className="friend-card" style={{ position: 'relative' }}>
                <img src={`http://localhost:5000/uploads/${f.profilePicture}`} alt="Profilowe" />
                <div>
                  <strong>{f.name}</strong>
                  <p>{f.username}</p>
                </div>
                <div
                  style={{ marginLeft: 'auto', cursor: 'pointer', fontSize: '20px' }}
                  onClick={() => setOpenMenu(openMenu === f.id ? null : f.id)}
                >
                  ⋮
                </div>
                {openMenu === f.id && (
                  <div className="menu-dropdown">
                    <div onClick={() => navigate(`/profile/${f.id}`)}>Odwiedź profil</div>
                    <div onClick={() => navigate(`/messages?userId=${f.id}`)}>Napisz wiadomość</div>
                    <div style={{ color: 'red' }} onClick={() => handleRemoveFriend(f.id)}>Usuń znajomego</div>
                  </div>
                )}
              </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default FriendsPage;
