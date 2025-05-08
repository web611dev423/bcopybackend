const { Server } = require('socket.io');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const socketController = require('../controllers/socketController');
require('events').EventEmitter.defaultMaxListeners = 20; // Increase the limit to 20

let io;
require('dotenv').config();
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors:
    {
      // origin: process.env.ADMIN_PANEL_URL, // Your frontend URL
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // io.use(async (socket, next) => {

  //   const userId = socket.handshake.auth.userId;
  //   console.log('userId');
  //   if (!mongoose.Types.ObjectId.isValid(userId)) {
  //     return next(new Error('Invalid user ID'));
  //   }

  //   const user = await User.findById(userId);
  //   if (!user) return next(new Error('User not found'));

  //   socket.user = user; // Attach user to socket
  //   next();
  // });

  // Handle socket connections
  io.on('connection', (socket) => {
    socketController(io, socket);

    socket.on('register-admin', () => {
      // console.log('Admin registered:', socket.user._id);
      socket.join('admins'); // Add admin to "admins" room
    });
    // 
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