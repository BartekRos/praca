import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const MessageView = ({ conversation }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!user || !conversation?.conversationId) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/${conversation.conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        setMessages(res.data);
      } catch (error) {
        console.error('❌ Błąd pobierania wiadomości:', error);
      }
    };

    fetchMessages();
  }, [user, conversation?.conversationId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      const res = await axios.post(
        'http://localhost:5000/api/messages',
        {
          conversationId: conversation.conversationId,
          receiverId: conversation.userId,
          content: newMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
    } catch (error) {
      console.error('❌ Błąd wysyłania wiadomości:', error);
    }
  };

  return (
    <div className="message-view">
      {messages.map((m) => (
        <div
          key={m.id}
          className={m.senderId === user?.id ? 'my-message' : 'their-message'}
        >
          {m.content}
        </div>
      ))}
      <div className="message-input">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Napisz wiadomość..."
        />
        <button onClick={handleSend}>Wyślij</button>
      </div>
    </div>
  );
};

export default MessageView;
