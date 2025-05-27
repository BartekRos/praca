import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import MessageView from './MessageView';
import './styles/MessagePage.css';
import Navbar from '../components/Navbar';
import { useLocation } from 'react-router-dom';

const ChatPage = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const userIdFromQuery = query.get('userId');

  useEffect(() => {
    console.log("🧠 user:", user);
    if (!user || !user.token) return; // 👈 ważne!
  
    const fetchConversationsAndOpen = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/messages/list', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        console.log("💬 Pobrane rozmowy:", data);
        setConversations(data);
  
        if (userIdFromQuery) {
          const existing = data.find(c => c.userId === +userIdFromQuery);
          if (existing) {
            setSelectedChat(existing);
          } else {
            const { data: conv } = await axios.post(
              'http://localhost:5000/api/messages/start',
              { recipientId: +userIdFromQuery },
              { headers: { Authorization: `Bearer ${user.token}` } }
            );
            const newConv = {
              conversationId: conv.id,
              userId: +userIdFromQuery,
              username: `Użytkownik ${userIdFromQuery}`,
              profilePicture: ''
            };
            setConversations(prev => [...prev, newConv]);
            setSelectedChat(newConv);
          }
        }
      } catch (err) {
        console.error('❌ Błąd pobierania lub tworzenia rozmowy:', err);
      }
    };
  
    fetchConversationsAndOpen();
  }, [user, userIdFromQuery]);
  

  return (
    <>
      <Navbar />
      <div className="messages-page">
        <div className="sidebar">
          <h3>Rozmowy</h3>
          {conversations.length === 0 && <p>Brak rozmów.</p>}
          {conversations.map((conv) => (
            <div
              key={conv.conversationId}
              className={`conversation ${selectedChat?.conversationId === conv.conversationId ? 'active' : ''}`}
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
