const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: false,
  auth: {
    user: 'felixrhodes1212@gmail.com',
    pass: '!@#QWE123qwe'
  }
})

module.exports = transporter;