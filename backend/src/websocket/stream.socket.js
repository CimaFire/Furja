module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join stream room
    socket.on('join-stream', (streamId, userId) => {
      try {
        if (!streamId) {
          return socket.emit('error', { message: 'streamId is required' });
        }
        socket.join(`stream-${streamId}`);
        io.to(`stream-${streamId}`).emit('user-joined', { userId, timestamp: new Date() });
      } catch (error) {
        console.error('join-stream error:', error);
        socket.emit('error', { message: 'Failed to join stream' });
      }
    });

    // Leave stream
    socket.on('leave-stream', (streamId, userId) => {
      try {
        if (!streamId) {
          return socket.emit('error', { message: 'streamId is required' });
        }
        socket.leave(`stream-${streamId}`);
        io.to(`stream-${streamId}`).emit('user-left', { userId, timestamp: new Date() });
      } catch (error) {
        console.error('leave-stream error:', error);
        socket.emit('error', { message: 'Failed to leave stream' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};
