import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';

const UserProfilePage = () => {
  const { user } = useContext(AuthContext);
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/profile/${userId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setProfile(res.data);
      } catch (error) {
        console.error('Błąd pobierania profilu:', error);
      }
    };

    if (userId) fetchProfile();
  }, [userId]);

  if (!profile) return <div>Ładowanie profilu...</div>;

  return (
    <>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <h2>{profile.name}</h2>
        <img src={`http://localhost:5000/uploads/${profile.profilePicture}`} alt="Profilowe" style={{ width: '150px' }} />
        <p>Email: {profile.email}</p>
        <p>Miasto: {profile.city}</p>
        <p>Wiek: {profile.age}</p>
        <p>Dołączył: {new Date(profile.createdAt).toLocaleDateString()}</p>
      </div>
    </>
  );
};

export default UserProfilePage;
