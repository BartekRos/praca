// src/pages/MessageView.js
import React, {
  useEffect, useState, useContext, useRef, useCallback
}                                   from 'react';
import axios                         from 'axios';
import AuthContext                   from '../context/AuthContext';

const API    = 'http://localhost:5000/api';
const UPLOAD = 'http://localhost:5000/uploads';

const MessageView = ({ conversation }) => {
  const { user }          = useContext(AuthContext);
  const [messages, setMsg] = useState([]);

  const [newMsg, setNew]   = useState('');
  const isGroup            = !!conversation?.isGroup;

  const bottomRef = useRef(null);
  const lastIdRef = useRef(null);         // do wykrywania nowych wpisów

  /* ---------- pobieranie (jako funkcja) ---------- */
  const fetchHistory = useCallback(async () => {
    if (!user?.token || !conversation) return;

    const url = isGroup
      ? `${API}/chats/${conversation.id}/messages`
      : `${API}/messages/${conversation.conversationId}`;

    try {
      const { data } = await axios.get(url, {
        headers:{ Authorization:`Bearer ${user.token}` }
      });

      /* scroll tylko gdy doszły nowe wiadomości */
      if (data.length !== messages.length ||
          (data.length > 0 && data.at(-1).id !== lastIdRef.current)) {
        setMsg(data);
        lastIdRef.current = data.length ? data.at(-1).id : null;
      }
    } catch (e) {
      console.error('❌ fetch messages:', e);
    }
  }, [user, conversation, isGroup, messages.length]);

  /* ---------- pierwszy fetch + polling ---------- */
  useEffect(() => {
    fetchHistory();                             // start
    const id = setInterval(fetchHistory, 300); // co 0,3 s
    return () => clearInterval(id);
  }, [fetchHistory]);

  /* ---------- auto-scroll przy zmianach ---------- */
  useEffect(() => { bottomRef.current?.scrollIntoView({ behaviour:'smooth' }); },
             [messages]);

  /* ---------- wysyłanie ---------- */
  const send = async () => {
    if (!newMsg.trim()) return;
    try {
      let data;
      if (isGroup) {
        ({ data } = await axios.post(
          `${API}/chats/${conversation.id}/messages`,
          { content:newMsg },
          { headers:{ Authorization:`Bearer ${user.token}` }}));
      } else {
        ({ data } = await axios.post(
          `${API}/messages`,
          {
            conversationId: conversation.conversationId,
            receiverId    : conversation.userId,
            content       : newMsg
          },
          { headers:{ Authorization:`Bearer ${user.token}` }}));
      }

      /* dopinamy własną wiadomość lokalnie, by nie czekać na polling */
      setMsg(prev => [...prev, {
        ...data,
        User:{ id:user.id, username:user.username, profilePicture:user.profilePicture }
      }]);
      setNew('');
    } catch (e) {
      console.error('❌ send:', e);
    }
  };

  /* ---------- render ---------- */
  return (
    <div className="message-view">

      {messages.map(m => (
        m.system ? (
          /* ─── komunikat systemowy ─── */
          <div key={m.id} className="system-message">
            {m.content}
          </div>
        ) : (
          /* ─── zwykła wiadomość ─── */
          <div key={m.id}
               className={m.senderId === user.id ? 'my-message' : 'their-message'}>

            {(isGroup || m.senderId !== user.id) && (
              <img
                src={`${UPLOAD}/${(m.User || m.Sender)?.profilePicture ||'default-profile.jpg'}`}
                className="message-avatar" alt="av"
              />
            )}

            <div className="message-content">
              {isGroup && m.senderId !== user.id && (
                <strong>{m.User?.username || m.senderId}: </strong>
              )}
              {m.content.split('\n').map((ln,i)=>(
                <React.Fragment key={i}>{ln}<br/></React.Fragment>
              ))}
            </div>
          </div>
        )
      ))}

      <div ref={bottomRef} />

      {/* pole wprowadzania */}
      <div className="message-input">
        <textarea
          className="expanding-textarea"
          rows={1}
          value={newMsg}
          onChange={e => setNew(e.target.value)}
          placeholder="Napisz wiadomość…"
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button onClick={send}>Wyślij</button>
      </div>
    </div>
  );
};

export default MessageView;
