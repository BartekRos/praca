// components/NewGroupChat.js
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

export default function NewGroupChat({ onCreated }) {
  const { user } = useContext(AuthContext);
  const [friends, setFriends] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [name, setName] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/friends', {
      headers: { Authorization: `Bearer ${user.token}` }
    }).then(res => setFriends(res.data))
      .catch(console.error);
  }, [user.token]);

  const toggle = id => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const handleCreate = () => {
    axios.post('http://localhost:5000/api/chats', {
      name,
      participantIds: Array.from(selected)
    }, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    .then(res => onCreated(res.data))
    .catch(err => alert('Błąd tworzenia czatu'));
  };

  return (
    <div>
      <h2>Nowa rozmowa grupowa</h2>
      <input
        placeholder="Nazwa grupy"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <h3>Wybierz znajomych:</h3>
      <ul>
        {friends.map(f => (
          <li key={f.id}>
            <label>
              <input
                type="checkbox"
                checked={selected.has(f.id)}
                onChange={() => toggle(f.id)}
              />
              {f.username} ({f.name})
            </label>
          </li>
        ))}
      </ul>
      <button onClick={handleCreate} disabled={!name || selected.size < 1}>
        Stwórz grupę
      </button>
    </div>
  );
}
