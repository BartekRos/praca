import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const MessageView = ({ conversation }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const isGroup = conversation?.isGroup;

  useEffect(() => {
    if (!user || !user.token || !conversation) return;

    const fetchMessages = async () => {
      try {
        const url = isGroup
          ? `http://localhost:5000/api/chats/${conversation.id}/messages`
          : `http://localhost:5000/api/messages/${conversation.conversationId}`;

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setMessages(res.data);
      } catch (error) {
        console.error('❌ Błąd pobierania wiadomości:', error);
      }
    };

    fetchMessages();
  }, [user, conversation, isGroup]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      if (isGroup) {
        const res = await axios.post(
          `http://localhost:5000/api/chats/${conversation.id}/messages`,
          { content: newMessage },
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setMessages((prev) => [
          ...prev,
          {
            ...res.data,
            User: {
              id: user.id,
              username: user.username,
              profilePicture: user.profilePicture,
            },
          },
        ]);
        
      } else {
        const res = await axios.post(
          'http://localhost:5000/api/messages',
          {
            conversationId: conversation.conversationId,
            receiverId: conversation.userId,
            content: newMessage,
          },
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setMessages((prev) => [
          ...prev,
          {
            ...res.data,
            User: {
              id: user.id,
              username: user.username,
              profilePicture: user.profilePicture,
            },
          },
        ]);
        
      }

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
        className={m.senderId === user.id ? 'my-message' : 'their-message'}
      >
        {isGroup || m.senderId !== user.id ? (
          <img
            src={`http://localhost:5000/uploads/${(m.User || m.Sender)?.profilePicture || 'default.png'}`}
            alt="avatar"
            className="message-avatar"
          />
        ) : null}
        <div className="message-content">
          {isGroup && m.senderId !== user.id && (
            <strong>{m.User?.username || m.senderId}: </strong>
          )}
          {m.content}
        </div>
      </div>
      
      ))}
      <div className="message-input">
      <textarea
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Napisz wiadomość..."
        rows={1}
        onInput={(e) => {
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight + 'px';
        }}
      />
        <button onClick={handleSend}>Wyślij</button>
      </div>
    </div>
  );
};

export default MessageView;
