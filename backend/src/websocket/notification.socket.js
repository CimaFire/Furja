module.exports = (io) => {
  io.on('connection', (socket) => {
    // Join personal notification room on connect
    if (socket.userId) {
      socket.join(`user-${socket.userId}`);
    }

    // Gift notification — only authenticated users
    socket.on('gift-sent', (streamId, gift) => {
      if (!socket.userId) {
        return socket.emit('error', { message: 'Authentication required' });
      }
      io.to(`stream-${streamId}`).emit('gift-received', {
        ...gift,
        senderId: socket.userId,
        timestamp: new Date()
      });
    });
  });
};
