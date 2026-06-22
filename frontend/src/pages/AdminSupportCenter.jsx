import React, { useEffect, useState, useRef } from 'react';
import { getConversations, getChatHistory, sendChatMessageREST, markChatAsRead } from '../services/supportService';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const socket = io('http://localhost:5000', { withCredentials: true });

const AdminSupportCenter = () => {
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  const { user } = useAuth();
  const adminId = user ? user._id || user.id : '';

  useEffect(() => {
    const loadConvos = async () => {
      try {
        const res = await getConversations();
        setConversations(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadConvos();

    socket.emit('join_room', 'admin_general');

    socket.on('receive_message', (data) => {
      if (activeUser && data.senderId === activeUser.userId) {
        setMessages(prev => [...prev, data]);
        markChatAsRead(activeUser.userId);
      }
      loadConvos();
    });

    socket.on('typing', (data) => {
      if (activeUser && data.senderId === activeUser.userId) {
        setTyping(true);
        setTimeout(() => setTyping(false), 2000);
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('typing');
    };
  }, [activeUser]);

  useEffect(() => {
    if (!activeUser) return;
    const loadHistory = async () => {
      try {
        const res = await getChatHistory(activeUser.userId);
        setMessages(res.data);
        await markChatAsRead(activeUser.userId);
        
        setConversations(prev => prev.map(c => c.userId === activeUser.userId ? {...c, unreadCount: 0} : c));
      } catch (err) {
        console.error(err);
      }
    };
    loadHistory();
  }, [activeUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUser) return;

    const msgData = {
      senderId: adminId,
      senderRole: 'admin',
      receiverId: activeUser.userId,
      receiverRole: activeUser.role,
      message: newMessage,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, msgData]);
    setNewMessage('');

    try {
      const res = await sendChatMessageREST(msgData);
      socket.emit('send_message', res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-slate-900 text-white p-4 gap-4">
      <div className="w-1/3 bg-slate-800 rounded-xl border border-slate-700 overflow-y-auto custom-scrollbar flex flex-col">
        <div className="p-4 bg-slate-900 border-b border-slate-700 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-rose-450">Active Chats</h2>
          <p className="text-xs text-slate-400 mt-1">Manage user & company support queries</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
             <p className="text-slate-500 text-center mt-10">No active conversations.</p>
          ) : conversations.map(c => (
            <div 
              key={c.userId} 
              onClick={() => setActiveUser(c)}
              className={`p-4 border-b border-slate-700/50 cursor-pointer transition-all hover:bg-slate-700/50 ${activeUser?.userId === c.userId ? 'bg-slate-700 border-l-4 border-l-rose-500' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-slate-200">{c.name}</span>
                <span className="text-xs text-slate-500">{new Date(c.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-400 truncate max-w-[80%]">{c.lastMessage}</p>
                {c.unreadCount > 0 && <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{c.unreadCount}</span>}
              </div>
              <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-400 capitalize">{c.role}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden relative">
        {activeUser ? (
          <>
            <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center z-10">
              <div>
                <h2 className="font-bold text-lg">{activeUser.name}</h2>
                <p className="text-xs text-slate-400">{activeUser.email}</p>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`max-w-[75%] p-3 rounded-lg ${msg.senderRole === 'admin' ? 'bg-rose-500 self-end rounded-tr-none' : 'bg-slate-700 self-start rounded-tl-none'}`}>
                  <p className="text-sm">{msg.message}</p>
                  <span className="text-[10px] text-slate-300 mt-1 block text-right">
                    {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              ))}
              {typing && (
                <div className="bg-slate-700 self-start p-3 rounded-lg rounded-tl-none flex items-center gap-1 w-16">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-slate-900 border-t border-slate-700 flex gap-3">
              <input 
                type="text" 
                value={newMessage}
                onChange={e => {
                  setNewMessage(e.target.value);
                  socket.emit('typing', { receiverId: activeUser.userId, senderId: 'admin_general' });
                }}
                placeholder={`Message ${activeUser.name}...`}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-2 text-white focus:outline-none focus:border-rose-450"
              />
              <button type="submit" className="bg-rose-500 hover:bg-rose-600 text-white rounded-full px-6 py-2 font-bold transition-all">Send</button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <svg className="w-16 h-16 mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSupportCenter;
