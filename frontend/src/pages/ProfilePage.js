import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/Navbar';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  console.log('Zalogowany użytkownik:', user);


  useEffect(() => {
    const fetchProfile = async () => {
        console.log('⏳ Wywołuję zapytanie do /api/users/profile');
      try {
        const res = await axios.get('/api/users/profile', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        console.log('✅ Odpowiedź profilu:', res.data);
        setProfile(res.data);
      } catch (err) {
        console.error('❌ Błąd przy pobieraniu profilu:', err.message);
        console.error('📦 Szczegóły:', err.response?.status, err.response?.data);
      }
    };

    if (user?.token) fetchProfile();
  }, [user]);

  if (!profile) return <div style={{ padding: '40px' }}>Ładowanie profilu...</div>;

  return (
    <>
      <Navbar /> {}
    <div style={{ padding: '40px' }}>
      <h2>Twój profil</h2>
      <p><strong>Nazwa użytkownika:</strong> {profile.username}</p>
      <p><strong>Email:</strong> {profile.email}</p>
    </div>
    </>
  );
};

export default ProfilePage;
