import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

function ChatBox({ streamId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_WS_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('receive-message', (message) => {
      setMessages(prev => [...prev, message].slice(-50));
    });

    return () => newSocket.close();
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim() && user) {
      socket?.emit('send-message', streamId, newMessage, user.id, user.username);
      setNewMessage('');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg h-[600px] flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className="text-sm">
            <span className="font-bold text-pink-500">{msg.username}:</span>
            <span className="text-gray-300 ml-2">{msg.message}</span>
          </div>
        ))}
      </div>

      {/* Input */}
      {user ? (
        <div className="p-4 border-t border-gray-700 space-y-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="اكتب رسالة..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-pink-500"
          />
          <button
            onClick={handleSendMessage}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded text-sm transition"
          >
            إرسال
          </button>
        </div>
      ) : (
        <div className="p-4 border-t border-gray-700 text-center text-gray-400">
          <p>سجل دخول للتفاعل</p>
        </div>
      )}
    </div>
  );
}

export default ChatBox;
