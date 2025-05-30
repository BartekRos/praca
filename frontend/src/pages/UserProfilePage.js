import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';

const UserProfilePage = () => {
  const { user } = useContext(AuthContext);
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user?.token || !userId) return;

    // 👇 Jeśli próbujesz wejść na swój własny profil przez /profile/:id — przekieruj do /profile
    if (+userId === user.id) {
      navigate('/profile');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setProfile(res.data);
      } catch (error) {
        console.error('❌ Błąd pobierania profilu:', error);
      }
    };

    fetchProfile();
  }, [userId, user?.token, user?.id, navigate]);

  if (!profile) return <div style={{ padding: '20px' }}>Ładowanie profilu...</div>;

  return (
    <>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <h2 style={{ marginBottom: 4 }}>{profile.name || profile.username}</h2>
        <p style={{ marginTop: 0, marginBottom: 12, color: '#666' }}>
          @{profile.username}
        </p>
        <img
          src={`http://localhost:5000/uploads/${profile.profilePicture || 'default-profile.jpg'}`}
          alt="Profilowe"
          style={{ width: '150px', borderRadius: '10px' }}
        />
        {profile.email && <p>Email: {profile.email}</p>}
        {profile.city && <p>Miasto: {profile.city}</p>}
        {profile.age && <p>Wiek: {profile.age}</p>}
        {profile.createdAt && (
          <p>Dołączył: {new Date(profile.createdAt).toLocaleDateString('pl-PL')}</p>
        )}
      </div>
    </>
  );
};

export default UserProfilePage;
