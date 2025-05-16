import React, { useState, useEffect, useContext, useCallback } from 'react';
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
  const [openMenu, setOpenMenu] = useState(null);

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
    console.log('Usuwany friendId:', friendId);
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

  return (
    <>
      <Navbar />
      <div className="friends-page">
        <h1>Znajomi</h1>

        {/* WYSZUKIWARKA */}
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
          {requests.map(r => (
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
          ))}
        </div>

        {/* ZNAJOMI */}
        <div>
          <h2>Twoi znajomi</h2>
            {friends.map(f => {
            console.log('Znajomy:', f);
            return (
            <div key={f.id} className="friend-card" style={{ position: 'relative' }}>
              <img src={`http://localhost:5000/uploads/${f.profilePicture}`} alt="Profilowe" />
              <div>
                <strong>{f.name}</strong>
                <p>{f.username}</p>
              </div>
              <div style={{ marginLeft: 'auto', cursor: 'pointer', fontSize: '20px' }} onClick={() => setOpenMenu(openMenu === f.id ? null : f.id)}>
                ⋮
              </div>
              {openMenu === f.id && (
                <div style={{
                  position: 'absolute',
                  right: '10px',
                  top: '60px',
                  background: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  zIndex: 10
                }}>
                  <div style={{ padding: '10px', cursor: 'pointer' }} onClick={() => window.location.href = `/profile/${f.id}`}>Odwiedź profil</div>
                  <div style={{ padding: '10px', cursor: 'pointer' }} onClick={() => window.location.href = `/messages?userId=${f.id}`}>Napisz wiadomość</div>
                  <div style={{ padding: '10px', cursor: 'pointer', color: 'red' }} onClick={() => handleRemoveFriend(f.id)}>Usuń znajomego</div>
                </div>
              )}
            </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default FriendsPage;
