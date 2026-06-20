module.exports = (io) => {
  io.on('connection', (socket) => {
    // Send message
    socket.on('send-message', (streamId, message, userId, username) => {
      try {
        if (!streamId || !message) {
          return socket.emit('error', { message: 'streamId and message are required' });
        }
        io.to(`stream-${streamId}`).emit('receive-message', {
          userId,
          username,
          message,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('send-message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Like/React
    socket.on('send-reaction', (streamId, reaction, userId) => {
      try {
        if (!streamId || !reaction) {
          return socket.emit('error', { message: 'streamId and reaction are required' });
        }
        io.to(`stream-${streamId}`).emit('receive-reaction', {
          userId,
          reaction,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('send-reaction error:', error);
        socket.emit('error', { message: 'Failed to send reaction' });
      }
    });
  });
};
