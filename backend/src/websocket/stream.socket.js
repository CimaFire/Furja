module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join stream room
    socket.on('join-stream', (streamId, userId) => {
      socket.join(`stream-${streamId}`);
      io.to(`stream-${streamId}`).emit('user-joined', { userId, timestamp: new Date() });
    });

    // Leave stream
    socket.on('leave-stream', (streamId, userId) => {
      socket.leave(`stream-${streamId}`);
      io.to(`stream-${streamId}`).emit('user-left', { userId, timestamp: new Date() });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
