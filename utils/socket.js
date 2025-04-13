const { Server } = require('socket.io');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000", // Your frontend URL
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle admin registration
    socket.on('register-admin', () => {
      console.log('Admin registered:', socket.id);
      socket.join('admins'); // Add admin to "admins" room
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initSocket, getIO };