module.exports = (io) => {
  io.on('connection', (socket) => {
    // Send notification
    socket.on('send-notification', (userId, notification) => {
      try {
        if (!userId || !notification) {
          return socket.emit('error', { message: 'userId and notification are required' });
        }
        io.to(`user-${userId}`).emit('receive-notification', {
          ...notification,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('send-notification error:', error);
        socket.emit('error', { message: 'Failed to send notification' });
      }
    });

    // Gift notification
    socket.on('gift-sent', (streamId, gift) => {
      try {
        if (!streamId || !gift) {
          return socket.emit('error', { message: 'streamId and gift are required' });
        }
        io.to(`stream-${streamId}`).emit('gift-received', {
          ...gift,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('gift-sent error:', error);
        socket.emit('error', { message: 'Failed to send gift notification' });
      }
    });
  });
};
