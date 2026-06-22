import React, { useEffect, useState, useRef } from 'react';
import { getChatHistory, sendChatMessageREST, markChatAsRead } from '../services/supportService';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const socket = io('http://localhost:5000', { withCredentials: true });

const ChatSupport = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  const { user } = useAuth();
  const userId = user ? user._id || user.id : '';

  useEffect(() => {
    if (!userId) return;

    socket.emit('join_room', userId);

    const loadHistory = async () => {
      try {
        const res = await getChatHistory(userId);
        setMessages(res.data);
        await markChatAsRead(userId);
      } catch (err) {
        console.error(err);
      }
    };
    loadHistory();

    socket.on('receive_message', (data) => {
      setMessages(prev => [...prev, data]);
      setTyping(false);
      markChatAsRead(userId);
    });

    socket.on('typing', () => {
      setTyping(true);
      setTimeout(() => setTyping(false), 2000);
    });

    return () => {
      socket.off('receive_message');
      socket.off('typing');
    };
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msgData = {
      senderId: userId,
      senderRole: user ? user.role : 'fresher',
      receiverId: 'admin_general',
      receiverRole: 'admin',
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

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    socket.emit('typing', { receiverId: 'admin_general' });
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white flex flex-col items-center">
      <div className="w-full max-w-3xl flex flex-col h-[80vh] bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
        <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-rose-450">Admin Support Chat</h2>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Admin is online
            </p>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`max-w-[75%] p-3 rounded-lg ${msg.senderRole === 'admin' ? 'bg-slate-700 self-start rounded-tl-none' : 'bg-rose-500 self-end rounded-tr-none'}`}>
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
            onChange={handleTyping}
            placeholder="Type your message here..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-2 text-white focus:outline-none focus:border-rose-450"
          />
          <button type="submit" className="bg-rose-500 hover:bg-rose-600 text-white rounded-full px-6 py-2 font-bold transition-all">Send</button>
        </form>
      </div>
    </div>
  );
};

export default ChatSupport;
