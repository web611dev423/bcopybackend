const Quiz = require('../models/quizModel');
const User = require('../models/userModel');

const socketController = (io, socket) => {
  const userId = socket.handshake.auth.userId;
  User.findByIdAndUpdate(
    userId,
    { $set: { connected: true, socketId: socket.id } }, // Set connected to true and store the socket ID
    { new: true }
  )
    .then(() => {
      console.log(`User connected: ${userId}, Socket ID: ${socket.id}`);
    })
    .catch((error) => {
      console.error('Error updating connection status:', error);
    });

  socket.on('quiz:invitation', async (data) => {
    console.log('new Invitation');
    const userId = socket.handshake.auth.userId;
    const { quizId, inviteeIds } = data.data;

    try {
      // Find the user to get their name
      const user = await User.findById(userId);
      if (!user) {
        return socket.emit('error', { message: 'User not found' });
      }

      const participantsToAdd = inviteeIds.map((inviteeId) => ({
        userId: inviteeId,
        status: 'pending',
      }));

      const quiz = await Quiz.findByIdAndUpdate(quizId,
        { $addToSet: { participants: { $each: participantsToAdd } } },
        { new: true }
      );

      const socketIds = await User.find(
        { _id: { $in: inviteeIds } },
        { socketId: 1 }
      ).then((users) => users.map((user) => user.socketId));

      if (socketIds.length === 0) {
        return socket.emit('error', { message: 'No users found' });
      }

      socketIds.forEach((socketId) => {
        io.to(socketId).emit('quiz:invitation', {
          quizId,
          quizTitle: quiz.title,
          quizDescription: quiz.description,
          inviterId: userId,
          inviterName: user.name,
        });
      });
    } catch (error) {
      console.error('Error sending quiz invitation:', error);
      socket.emit('error', { message: 'Failed to send quiz invitation' });
    }
  });

  socket.on('quiz:invitation:response', async (data) => {
    const userId = socket.handshake.auth.userId;
    const quizId = data.data.quizId; // Extract quizId from the data
    const status = data.data.status; // Extract status from the data

    try {
      // Find the quiz and update the participant's status
      const quiz = await Quiz.findOneAndUpdate(
        { _id: quizId, 'participants.userId': userId }, // Match the quiz and the participant
        { $set: { 'participants.$.status': status } }, // Update the status of the matched participant
        { new: true } // Return the updated document
      );
      if (!quiz) {
        return socket.emit('error', { message: 'Quiz or participant not found' });
      }

      // Optionally, notify the user about the successful update
      socket.emit('quiz:invitation:response:success', {
        quizId,
        status,
      });
    } catch (error) {
      console.error('Error updating participant status:', error);
      socket.emit('error', { message: 'Failed to update participant status' });
    }
  });

  socket.on('quiz:start', async (data) => {
    const userId = socket.handshake.auth.userId;
    const { quizId, time } = data.data;

    try {
      // Find the user to get their name
      const user = await User.findById(userId);
      if (!user) {
        return socket.emit('error', { message: 'User not found' });
      }

      // Update the participant's status to 'started'
      const quiz = await Quiz.findOneAndUpdate(
        { _id: quizId, 'participants.userId': userId },
        { $set: { 'participants.$.status': 'started' } },
        { new: true }
      ).populate('participants.userId', 'socketId name');

      if (!quiz) {
        return socket.emit('error', { message: 'Quiz or participant not found' });
      }

      // Notify all participants that this user has started the quiz
      const participantSocketIds = quiz.participants
        .filter(p => p.userId && p.userId.socketId)
        .map(p => p.userId.socketId);

      participantSocketIds.forEach(socketId => {
        if (socketId) {
          io.to(socketId).emit('quiz:user_started', {
            quizId,
            quizTitle: quiz.title,
            userId,
            userName: user.name,
            startTime: time
          });
        }
      });

      // Notify the user that the quiz has started successfully
      socket.emit('quiz:start:success', {
        quizId,
        startTime: time
      });
    } catch (error) {
      console.error('Error starting quiz:', error);
      socket.emit('error', { message: 'Failed to start quiz' });
    }
  });

  socket.on('quiz:complete', async (data) => {
    const userId = socket.handshake.auth.userId;
    const { quizId, completedAt } = data.data;

    try {
      // Find the user to get their name
      const user = await User.findById(userId);
      if (!user) {
        return socket.emit('error', { message: 'User not found' });
      }

      // Update the participant's status to 'completed'
      const quiz = await Quiz.findOneAndUpdate(
        { _id: quizId, 'participants.userId': userId },
        { $set: { 'participants.$.status': 'completed' } },
        { new: true }
      ).populate('participants.userId', 'socketId name');

      if (!quiz) {
        return socket.emit('error', { message: 'Quiz or participant not found' });
      }

      // Check if all participants have completed the quiz
      const allCompleted = quiz.participants.every(p => p.status === 'completed' || p.status === 'declined');

      // Notify all participants that this user has completed the quiz
      const participantSocketIds = quiz.participants
        .filter(p => p.userId && p.userId.socketId)
        .map(p => p.userId.socketId);

      participantSocketIds.forEach(socketId => {
        if (socketId) {
          io.to(socketId).emit('quiz:user_completed', {
            quizId,
            quizTitle: quiz.title,
            userId,
            userName: user.name,
            completedAt
          });
        }
      });

      // If all participants have completed, emit an additional event
      if (allCompleted) {
        participantSocketIds.forEach(socketId => {
          if (socketId) {
            io.to(socketId).emit('quiz:all_complete', {
              quizId,
              quizTitle: quiz.title,
              completedAt
            });
          }
        });
      }

      // Notify the user that the quiz has been completed successfully
      socket.emit('quiz:complete:success', {
        quizId,
        completedAt
      });
    } catch (error) {
      console.error('Error completing quiz:', error);
      socket.emit('error', { message: 'Failed to complete quiz' });
    }
  });

  socket.on('disconnect', () => {
    User.findByIdAndUpdate(
      userId,
      { $set: { connected: false }, $unset: { socketId: '' } }, // Set connected to false and remove the socket ID
      { new: true }
    )
      .then(() => {
        console.log(`User disconnected: ${userId}, Socket ID: ${socket.id}`);
      })
      .catch((error) => {
        console.error('Error updating disconnection status:', error);
      });
  });
}

module.exports = socketController;
