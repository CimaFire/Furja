module.exports = (io) => {
  io.on('connection', (socket) => {
    // Send notification
    socket.on('send-notification', (userId, notification) => {
      io.to(`user-${userId}`).emit('receive-notification', {
        ...notification,
        timestamp: new Date()
      });
    });

    // Gift notification
    socket.on('gift-sent', (streamId, gift) => {
      io.to(`stream-${streamId}`).emit('gift-received', {
        ...gift,
        timestamp: new Date()
      });
    });
  });
};
