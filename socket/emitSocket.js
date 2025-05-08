const { getIO } = require('./initSocket');
require('events').EventEmitter.defaultMaxListeners = 20; // Increase the limit to 20

const emitToAdmins = (type, data) => {
  const io = getIO(); // Get the initialized io instance
  io.to('admins').emit('admin-notification', {
    type,
    data,
    timestamp: new Date(),
  });
};

module.exports = { emitToAdmins };