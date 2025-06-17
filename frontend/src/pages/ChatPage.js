// src/pages/ChatPage.js
import React, {
  useState, useEffect, useContext,
  useCallback, useRef
} from 'react';
import axios           from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

import AuthContext  from '../context/AuthContext';
import Navbar       from '../components/Navbar';
import MessageView  from './MessageView';

import './styles/MessagePage.css';   // zawiera też .member-chip itd.

const API = 'http://localhost:5000/api';

const ChatPage = () => {
  const { user }   = useContext(AuthContext);
  const location   = useLocation();
  const navigate   = useNavigate();

  /* ----------------- STATE ----------------- */
  const [dmConvs,    setDmConvs]    = useState([]);
  const [groupChats, setGroupChats] = useState([]);
  const [selected,   setSelected]   = useState(null);

  const dmConvsRef   = useRef([]);
  const fetchDataRef = useRef(() => {});

  /* członkowie aktualnie wybranej grupy */
  const [groupMembers, setGroupMembers] = useState([]);

  /* ---------- MODALE ---------- */
  const [friends,          setFriends]       = useState([]);
  const [showCreateModal,  setShowCreate]    = useState(false);
  const [groupName,        setGroupName]     = useState('');
  const [chosenFriends,    setChosenFriends] = useState([]);

  const [showInviteModal,  setShowInvite]    = useState(false);
  const [inviteChosen,     setInviteChosen]  = useState([]);

  /* ?userId=... w URL-u */
  const peerIdFromQuery =
    +new URLSearchParams(location.search).get('userId') || null;

  /* blokada scrolla globalnie */
  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => document.body.classList.remove('no-scroll');
  }, []);

  /* ------------- helpers ------------- */
  const uniqDM = (arr) => {
    const m = new Map();
    arr.forEach(c => {
      if (!m.has(c.userId) || m.get(c.userId).conversationId > c.conversationId) {
        m.set(c.userId, c);
      }
    });
    return [...m.values()];
  };

  /* ========== utwórz / otwórz DM ========== */
  const createOrOpenDM = useCallback(async (friendId) => {
    if (!user?.token) return;

    await axios.post(`${API}/messages/start`,
      { recipientId: friendId },
      { headers:{ Authorization:`Bearer ${user.token}` }});

    await fetchDataRef.current(true);
    const conv = dmConvsRef.current.find(c => c.userId === friendId);
    if (conv) setSelected(conv);
  }, [user]);

  /* ========== pobieranie listy rozmów ========== */
  const fetchData = useCallback(async (skipQuery = false) => {
    if (!user?.token) return;

    const [dmRes, chatsRes] = await Promise.all([
      axios.get(`${API}/messages/list`, { headers:{ Authorization:`Bearer ${user.token}` }}),
      axios.get(`${API}/chats`,         { headers:{ Authorization:`Bearer ${user.token}` }})
    ]);

    const uniq = uniqDM(dmRes.data);
    setDmConvs(uniq);
    dmConvsRef.current = uniq;
    setGroupChats(chatsRes.data);

    /* obsługa ?userId=... tylko przy pierwszym wejściu */
    if (!skipQuery && peerIdFromQuery) {
      const existing = uniq.find(c => c.userId === peerIdFromQuery);
      if (existing) setSelected(existing);
      else          await createOrOpenDM(peerIdFromQuery);
      navigate('/messages', { replace:true });
    }
  }, [user, peerIdFromQuery, navigate, createOrOpenDM]);

  useEffect(()=>{ fetchDataRef.current = fetchData; },[fetchData]);
  useEffect(()=>{ fetchData(); },[fetchData]);

  /* ========== członkowie grupy ========== */
  const fetchMembers = useCallback(async (chatId) => {
    if (!chatId || !user?.token) return;
    try {
      const { data } = await axios.get(`${API}/chats/${chatId}/participants`,
        { headers:{ Authorization:`Bearer ${user.token}` }});
      setGroupMembers(data);
    } catch (e) {
      console.error('❌ get participants:', e);
      setGroupMembers([]);
    }
  }, [user]);

  useEffect(()=>{
    if (selected?.isGroup) {
      if (selected.participants) {
        setGroupMembers(selected.participants);
      } else {
        fetchMembers(selected.id);
      }
    } else {
      setGroupMembers([]);
    }
  }, [selected, fetchMembers]);

  /* ---------- akcje usuń / wyjdź ---------- */
  const removeDM = async (conversationId) => {
    if (!window.confirm('Usunąć tę konwersację?')) return;
    await axios.delete(`${API}/messages/${conversationId}`,
      { headers:{ Authorization:`Bearer ${user.token}` }});
    setSelected(s => s?.conversationId === conversationId ? null : s);
    setDmConvs(prev => prev.filter(c => c.conversationId !== conversationId));
    dmConvsRef.current =
      dmConvsRef.current.filter(c => c.conversationId !== conversationId);
    navigate('/messages', { replace:true });
  };

  const removeGroup = async (chatId) => {
    if (!window.confirm('Usunąć grupę?')) return;
    await axios.delete(`${API}/chats/${chatId}`,
      { headers:{ Authorization:`Bearer ${user.token}` }});
    setSelected(null);
    setGroupChats(prev => prev.filter(g => g.id !== chatId));
  };

  const leaveGroup = async (chatId) => {
    if (!window.confirm('Opuścić grupę?')) return;
    await axios.delete(`${API}/chats/${chatId}/leave`,
      { headers:{ Authorization:`Bearer ${user.token}` }});
    setSelected(null);
    setGroupChats(prev => prev.filter(g => g.id !== chatId));
  };

  /* ---------- wyrzucenie członka ---------- */
  const kickMember = async (uid) => {
    if (!window.confirm('Usunąć użytkownika z grupy?')) return;
    await axios.delete(`${API}/chats/${selected.id}/members/${uid}`,
      { headers:{ Authorization:`Bearer ${user.token}` }});
    setGroupMembers(prev => prev.filter(m => m.id !== uid));
  };

  /* ---------- MODAL: tworzenie ---------- */
  const openCreateModal = async () => {
    const { data } = await axios.get(`${API}/friends`,
      { headers:{ Authorization:`Bearer ${user.token}` }});
    setFriends(data);
    setShowCreate(true);
  };

  const createConversation = async () => {
    try {
      if (chosenFriends.length === 1) {
        await createOrOpenDM(chosenFriends[0]);
      } else if (chosenFriends.length > 1) {
        const { data: chat } = await axios.post(`${API}/chats`,
          { name: groupName || 'Nowa grupa', participantIds: chosenFriends },
          { headers:{ Authorization:`Bearer ${user.token}` }});
        setGroupChats(prev => [...prev, chat]);
        setSelected({ ...chat, isGroup:true });
      }
    } finally {
      setShowCreate(false);
      setGroupName('');
      setChosenFriends([]);
    }
  };

  /* ---------- MODAL: zaproś ---------- */
  const openInviteModal = async () => {
    const { data } = await axios.get(`${API}/friends`,
      { headers:{ Authorization:`Bearer ${user.token}` }});
    const participantIds = groupMembers.map(m => m.id);
    setFriends(data.filter(f => !participantIds.includes(f.id)));
    setInviteChosen([]);
    setShowInvite(true);
  };

  const sendInvites = async () => {
    await Promise.all(inviteChosen.map(uid =>
      axios.post(`${API}/chats/${selected.id}/invite`,
        { userId: uid },
        { headers:{ Authorization:`Bearer ${user.token}` }} )
    ));
    await fetchMembers(selected.id);     // refresh
    setShowInvite(false);
  };

  /* =====================  RENDER  ===================== */
  return (
    <>
      <Navbar/>
      <div className="messages-page">

        {/* ----------- SIDEBAR ----------- */}
        <div className="sidebar">
          <h3>Rozmowy</h3>
          <button className="add-group-button" onClick={openCreateModal}>
            ➕ Utwórz konwersację
          </button>

          {dmConvs.length===0 && groupChats.length===0 && <p>Brak rozmów.</p>}

          {/* DM-y */}
          {dmConvs.map(c=>(
            <div key={c.userId}
                 className={`conversation ${selected?.conversationId===c.conversationId?'active':''}`}>
              <div className="conversation-item" onClick={()=>setSelected(c)}>
                <img
                  src={`${API.replace('/api','')}/uploads/${c.profilePicture||'default-profile.jpg'}`}
                  className="avatar" alt="av"
                />
                <span>{c.username}</span>
              </div>
              <button className="delete-btn" onClick={()=>removeDM(c.conversationId)}>❌</button>
            </div>
          ))}

          {/* Grupy */}
          {groupChats.map(g=>(
            <div key={g.id}
                 className={`conversation ${selected?.id===g.id?'active':''}`}>
              <div className="conversation-item"
                   onClick={()=>setSelected({...g,isGroup:true})}>
                💬 {g.name}
              </div>
              {g.createdBy===user.id
                ? <button className="delete-btn" title="Usuń grupę" onClick={()=>removeGroup(g.id)}>❌</button>
                : <button className="delete-btn" title="Opuść grupę" onClick={()=>leaveGroup(g.id)}>➖</button>}
            </div>
          ))}
        </div>

        {/* ----------- CHAT WINDOW ----------- */}
        <div className="chat-window">
          {selected ? (
            <>
              {/* Pasek z członkami dla grup */}
              {selected.isGroup && (
                <div style={{padding:'6px 12px', borderBottom:'1px solid #ddd'}}>
                  <div className="members-row">
                    {groupMembers.map(m => (
                      <span key={m.id} className="member-chip">
                        {m.username}
                        {selected.createdBy === user.id && m.id !== user.id && (
                          <span
                            className="remove-icon"
                            title="Usuń"
                            onClick={()=>kickMember(m.id)}
                          >
                            ×
                          </span>
                        )}
                      </span>
                    ))}

                    {/* kafelek „Dodaj” tylko dla twórcy grupy */}
                    {selected.createdBy === user.id && (
                      <span
                        className="member-chip add"
                        onClick={openInviteModal}
                      >
                        Dodaj
                      </span>
                    )}
                  </div>
                </div>
              )}

              <MessageView conversation={selected}/>
            </>
          ) : (
            <div className="empty-chat">Wybierz rozmowę</div>
          )}
        </div>
      </div>

      {/* ---------- MODAL: NOWA ROZMOWA ---------- */}
      {showCreateModal && (
        <Modal title="Utwórz konwersację" onClose={()=>setShowCreate(false)}>
          <input
            value={groupName}
            onChange={e=>setGroupName(e.target.value)}
            placeholder="Nazwa grupy (opcjonalna)"
            disabled={chosenFriends.length<=1}
          />
          <FriendChecklist
            friends={friends}
            chosen={chosenFriends}
            setChosen={setChosenFriends}
          />
          <ModalActions
            confirmText="Utwórz"
            confirmDisabled={chosenFriends.length===0}
            onConfirm={createConversation}
            onCancel={()=>setShowCreate(false)}
          />
        </Modal>
      )}

      {/* ---------- MODAL: ZAPROŚ ---------- */}
      {showInviteModal && (
        <Modal title="Zaproś uczestników" onClose={()=>setShowInvite(false)}>
          <FriendChecklist
            friends={friends}
            chosen={inviteChosen}
            setChosen={setInviteChosen}
          />
          {friends.length===0 && <p style={{color:'#777'}}>Brak osób do zaproszenia</p>}
          <ModalActions
            confirmText="Dodaj"
            confirmDisabled={inviteChosen.length===0}
            onConfirm={sendInvites}
            onCancel={()=>setShowInvite(false)}
          />
        </Modal>
      )}
    </>
  );
};

/* ================  POMOCNICZE KOMPONENTY  ================ */
const Modal = ({ title, children, onClose }) => (
  <div className="modal-overlay">
    <div className="modal">
      <h3>{title}</h3>
      {children}
      <button className="close-x" onClick={onClose}>✖</button>
    </div>
  </div>
);

const FriendChecklist = ({ friends, chosen, setChosen }) => (
  <div className="friends-list" style={{maxHeight:300,overflowY:'auto'}}>
    {friends.map(f=>(
      <label key={f.id} className="friend-checkbox">
        <input type="checkbox"
               checked={chosen.includes(f.id)}
               onChange={()=>setChosen(prev=>prev.includes(f.id)
                 ? prev.filter(x=>x!==f.id)
                 : [...prev,f.id])}/>
        {f.name} ({f.username})
      </label>
    ))}
  </div>
);

const ModalActions = ({ confirmText, confirmDisabled, onConfirm, onCancel }) => (
  <div className="modal-actions">
    <button className="confirm" disabled={confirmDisabled} onClick={onConfirm}>
      {confirmText}
    </button>
    <button className="cancel" onClick={onCancel}>Anuluj</button>
  </div>
);

export default ChatPage;
