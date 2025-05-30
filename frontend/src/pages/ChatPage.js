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
  const [groupChats, setGroupChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [friends, setFriends] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const userIdFromQuery = query.get('userId');

  useEffect(() => {
    if (!user || !user.token) return;

    const fetchData = async () => {
      try {
        const privateRes = await axios.get('http://localhost:5000/api/messages/list', {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const groupRes = await axios.get('http://localhost:5000/api/chats', {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        setConversations(privateRes.data);
        setGroupChats(groupRes.data);

        if (userIdFromQuery) {
          const existing = privateRes.data.find(c => c.userId === +userIdFromQuery);
          if (existing) {
            setSelectedChat(existing);
          } else {
            const { data: conv } = await axios.post(
              'http://localhost:5000/api/messages/start',
              { recipientId: +userIdFromQuery },
              { headers: { Authorization: `Bearer ${user.token}` } }
            );

            const { data: userInfo } = await axios.get(
              `http://localhost:5000/api/users/${userIdFromQuery}`,
              { headers: { Authorization: `Bearer ${user.token}` } }
            );

            const newConv = {
              conversationId: conv.id,
              userId: +userIdFromQuery,
              username: userInfo.username,
              profilePicture: userInfo.profilePicture || ''
            };

            setConversations(prev => [...prev, newConv]);
            setSelectedChat(newConv);
          }
        }
      } catch (err) {
        console.error('❌ Błąd pobierania rozmów:', err);
      }
    };

    fetchData();
  }, [user, userIdFromQuery]);

  const openGroupModal = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/friends', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setFriends(res.data);
      setShowGroupModal(true);
    } catch (err) {
      console.error('❌ Błąd pobierania znajomych:', err);
    }
  };

  const confirmAndRemoveConversation = (convId) => {
    if (window.confirm('Czy na pewno chcesz usunąć tę konwersację?')) {
      setConversations(prev => prev.filter(c => c.conversationId !== convId));
      if (selectedChat?.conversationId === convId) setSelectedChat(null);
    }
  };
  
  const confirmAndRemoveGroup = (chatId) => {
    if (window.confirm('Czy na pewno chcesz usunąć tę rozmowę grupową?')) {
      setGroupChats(prev => prev.filter(c => c.id !== chatId));
      if (selectedChat?.id === chatId) setSelectedChat(null);
    }
  };  
  
  
  const handleCreateGroup = async () => {
    try {
      if (selectedFriends.length === 1) {
        const recipientId = selectedFriends[0];

        const existing = conversations.find(c => c.userId === recipientId);
        if (existing) {
          setSelectedChat(existing);
        } else {
          const { data: conv } = await axios.post(
            'http://localhost:5000/api/messages/start',
            { recipientId },
            {
              headers: { Authorization: `Bearer ${user.token}` }
            }
          );

          const { data: userInfo } = await axios.get(
            `http://localhost:5000/api/users/${recipientId}`,
            { headers: { Authorization: `Bearer ${user.token}` } }
          );

          const newConv = {
            conversationId: conv.id,
            userId: recipientId,
            username: userInfo.username,
            profilePicture: userInfo.profilePicture || ''
          };

          setConversations(prev => [...prev, newConv]);
          setSelectedChat(newConv);
        }
      } else if (selectedFriends.length > 1) {
        const { data: chat } = await axios.post(
          'http://localhost:5000/api/chats',
          {
            name: groupName || 'Nowa grupa',
            participantIds: selectedFriends
          },
          {
            headers: { Authorization: `Bearer ${user.token}` }
          }
        );
        const newGroup = {
          id: chat.id,
          name: chat.name,
          isGroup: true
        };
        setGroupChats(prev => [...prev, newGroup]);
        setSelectedChat(newGroup);
      }

      setShowGroupModal(false);
      setGroupName('');
      setSelectedFriends([]);
    } catch (err) {
      console.error('❌ Błąd tworzenia konwersacji:', err);
    }
  };

  const toggleFriend = (id) => {
    setSelectedFriends(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  return (
    <>
      <Navbar />
      <div className="messages-page">
        <div className="sidebar">
          <h3>Rozmowy</h3>

          <button onClick={openGroupModal} className="add-group-button">
            ➕ Utwórz konwersację
          </button>

          {conversations.length === 0 && groupChats.length === 0 && <p>Brak rozmów.</p>}

          {conversations.map((conv) => (
        <div
          key={`dm-${conv.conversationId}`}
          className={`conversation ${selectedChat?.conversationId === conv.conversationId ? 'active' : ''}`}
        >
          <div className="conversation-item" onClick={() => setSelectedChat(conv)}>
            <img
              src={`http://localhost:5000/uploads/${conv.profilePicture || 'default.png'}`}
              alt="avatar"
              className="avatar"
            />
            <span>{conv.username}</span>
          </div>
          <button
            onClick={() => confirmAndRemoveConversation(conv.conversationId)}
            className="delete-btn"
            title="Usuń konwersację"
          >
            ❌
          </button>
        </div>
      ))}

          {groupChats.map((chat) => (
          <div
            key={`group-${chat.id}`}
            className={`conversation ${selectedChat?.id === chat.id ? 'active' : ''}`}
          >
            <div className="conversation-item" onClick={() => setSelectedChat({ ...chat, isGroup: true })}>
              💬 {chat.name}
            </div>
            <button
              onClick={() => confirmAndRemoveGroup(chat.id)}
              className="delete-btn"
              title="Usuń grupę"
            >
              ❌
            </button>
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

      {showGroupModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Utwórz konwersację</h3>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Nazwa grupy (opcjonalna)"
              disabled={selectedFriends.length <= 1}
            />
            <div className="friends-list">
              {friends.map((f) => (
                <div key={f.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(f.id)}
                      onChange={() => toggleFriend(f.id)}
                    />
                    {f.name} ({f.username})
                  </label>
                </div>
              ))}
            </div>
            <button onClick={handleCreateGroup}>Utwórz</button>
            <button onClick={() => setShowGroupModal(false)}>Anuluj</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatPage;
