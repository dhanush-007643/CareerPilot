import React, { useState, useEffect, useRef } from 'react';
import { fetchConversationsList, fetchConversation, sendMessage } from '../services/api';

const Messaging = () => {
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  
  // Mock logged in user id for basic ownership checks
  const currentUser = JSON.parse(localStorage.getItem('mock_user') || '{}');

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeUser) {
      loadMessages(activeUser._id);
    }
  }, [activeUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      const res = await fetchConversationsList();
      if (res.data.success) {
        setConversations(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load conversations', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (userId) => {
    try {
      const res = await fetchConversation(userId);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load messages', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUser) return;

    try {
      const payload = {
        receiverId: activeUser._id,
        content: newMessage,
        senderModel: currentUser.role === 'startup' ? 'Company' : 'User'
      };
      const res = await sendMessage(payload);
      if (res.data.success) {
        setMessages([...messages, res.data.data]);
        setNewMessage('');
        // Refresh conversations list to bump recent
        loadConversations();
      }
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading messages...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4 h-[calc(100vh-140px)] flex gap-6 pb-6">
      {/* Sidebar - Conversation List */}
      <div className="w-1/3 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-2xl shadow-cyan-900/10">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
          <h2 className="text-xl font-semibold text-white tracking-wide">Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {conversations.length === 0 ? (
            <p className="text-slate-500 text-sm text-center p-4">No active conversations</p>
          ) : (
            conversations.map((user) => (
              <button
                key={user._id}
                onClick={() => setActiveUser(user)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                  activeUser?._id === user._id
                    ? 'bg-cyan-500/10 border-l-4 border-cyan-400 text-white'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="font-medium text-sm">{user.name}</div>
                <div className="text-xs text-slate-500 capitalize">{user.role}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-2xl shadow-cyan-900/10">
        {activeUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900/50 backdrop-blur-md">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-cyan-500/30">
                {activeUser.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-white tracking-wide">{activeUser.name}</h3>
                <p className="text-xs text-cyan-400 capitalize">{activeUser.role}</p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center flex-col text-slate-500">
                  <svg className="w-12 h-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p>Send a message to start chatting</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === currentUser._id;
                  return (
                    <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isMe
                            ? 'bg-cyan-600 text-white rounded-br-sm shadow-md shadow-cyan-900/20'
                            : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <span className={`text-[10px] mt-1 block ${isMe ? 'text-cyan-200' : 'text-slate-500'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-6 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-900/30">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4 shadow-inner">
              <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <p className="text-lg">Select a conversation</p>
            <p className="text-sm opacity-60 mt-1">Connect with freshers and companies</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging;
