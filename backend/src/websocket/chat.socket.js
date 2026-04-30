module.exports = (io) => {
  io.on('connection', (socket) => {
    // Send message
    socket.on('send-message', (streamId, message, userId, username) => {
      io.to(`stream-${streamId}`).emit('receive-message', {
        userId,
        username,
        message,
        timestamp: new Date()
      });
    });

    // Like/React
    socket.on('send-reaction', (streamId, reaction, userId) => {
      io.to(`stream-${streamId}`).emit('receive-reaction', {
        userId,
        reaction,
        timestamp: new Date()
      });
    });
  });
};
