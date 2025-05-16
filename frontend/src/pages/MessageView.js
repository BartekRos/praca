import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const MessageView = ({ conversation }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/messages/${conversation.userId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setMessages(res.data);
      } catch (err) {
        console.error('❌ Błąd pobierania wiadomości:', err);
      }
    };

    fetchMessages();
  }, [conversation, user]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await axios.post('http://localhost:5000/api/messages', {
        receiverId: conversation.userId,
        content: newMessage,
      }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('❌ Błąd wysyłania wiadomości:', err);
    }
  };

  return (
    <div className="message-view">
      <div className="messages-list">
        {messages.map((msg) => (
          <div key={msg.id} className={msg.senderId === user.id ? 'my-message' : 'their-message'}>
            {msg.content}
          </div>
        ))}
      </div>
      <div className="send-message">
        <input
          type="text"
          placeholder="Napisz wiadomość..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={handleSend}>Wyślij</button>
      </div>
    </div>
  );
};

export default MessageView;
