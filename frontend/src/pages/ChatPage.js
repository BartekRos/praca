import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import MessageView from './MessageView';
import './styles/MessagePage.css';
import Navbar from '../components/Navbar';

const ChatPage = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/messages/list', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setConversations(res.data);
      } catch (err) {
        console.error('❌ Błąd pobierania rozmów:', err);
      }
    };

    fetchConversations();
  }, [user]);

  return (
    <>
      <Navbar /> {}
      <div className="messages-page">
        <div className="sidebar">
          <h3>Rozmowy</h3>
          {conversations.length === 0 && <p>Brak rozmów.</p>}
          {conversations.map((conv) => (
            <div
              key={conv.userId}
              className={`conversation ${selectedChat?.userId === conv.userId ? 'active' : ''}`}
              onClick={() => setSelectedChat(conv)}
            >
              {conv.username}
            </div>
          ))}
        </div>

        <div className="chat-window">
          {selectedChat ? (
            <MessageView conversation={selectedChat} />
          ) : (
            <div className="empty-chat">Wybierz rozmowę</div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatPage;
