module.exports = (io) => {
  io.on('connection', (socket) => {
    // Send message — only allow authenticated users
    socket.on('send-message', (streamId, message, userId, username) => {
      if (!socket.userId) {
        return socket.emit('error', { message: 'Authentication required' });
      }
      if (typeof message !== 'string' || message.length === 0 || message.length > 2000) {
        return socket.emit('error', { message: 'Invalid message' });
      }
      io.to(`stream-${streamId}`).emit('receive-message', {
        userId: socket.userId,
        username: socket.username,
        message,
        timestamp: new Date()
      });
    });

    // Like/React
    socket.on('send-reaction', (streamId, reaction, userId) => {
      if (!socket.userId) {
        return socket.emit('error', { message: 'Authentication required' });
      }
      const allowedReactions = ['like', 'love', 'wow', 'haha', 'sad', 'angry'];
      if (!allowedReactions.includes(reaction)) {
        return socket.emit('error', { message: 'Invalid reaction' });
      }
      io.to(`stream-${streamId}`).emit('receive-reaction', {
        userId: socket.userId,
        reaction,
        timestamp: new Date()
      });
    });
  });
};
