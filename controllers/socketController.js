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
    const { quizId, inviteeIds } = data.data;
    const participantsToAdd = inviteeIds.map((inviteeId) => ({
      userId: inviteeId,
      status: 'pending',
    }));
    const quiz = await Quiz.findByIdAndUpdate(quizId,
      { $addToSet: { participants: { $each: participantsToAdd } } }, // Add multiple participants
      { new: true }
    )

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
      });
    });
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