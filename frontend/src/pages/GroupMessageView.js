// src/pages/GroupMessageView.js
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const GroupMessageView = ({ chat }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!user?.token) return;
    const fetch = async () => {
      const res = await axios.get(
        `http://localhost:5000/api/chats/${chat.id}/messages`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setMessages(res.data);
    };
    fetch();
  }, [chat, user]);

  const send = async () => {
    if (!newMessage.trim()) return;
    const res = await axios.post(
      `http://localhost:5000/api/chats/${chat.id}/messages`,
      { content: newMessage },
      { headers: { Authorization: `Bearer ${user.token}` } }
    );
    setMessages(m => [...m, res.data]);
    setNewMessage('');
  };

  return (
    <div className="message-view">
      {messages.map(m => (
        <div key={m.id} className={m.senderId === user.id ? 'my-message' : 'their-message'}>
          {m.content}
        </div>
      ))}
      <div className="message-input">
        <input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Napisz wiadomość..."
        />
        <button onClick={send}>Wyślij</button>
      </div>
    </div>
  );
};

export default GroupMessageView;
