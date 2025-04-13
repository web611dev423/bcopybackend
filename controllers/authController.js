const User = require('../models/userModel');
const Recruiter = require('../models/recruiterModel');
const Contributor = require('../models/contributorModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    // Check if admin exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials(user not found)'
      });
    }

    // Check password
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    const isPasswordValid = (password == user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials(pwd incorrect)'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.userType
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie('token');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

exports.register = async (req, res) => {
  const { companyName,
    comapanyWebsite,
    confirmPassword,
    country,
    description,
    email,
    name,
    password,
    phoneNumber,
    profileLink,
    userType } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: 'User already exists'
    });
  }
  const user = await User.create({
    name,
    email,
    password,
    userType
  }).then(async (user) => {
    if (userType === 'recruiter') {
      const recruiter = await Recruiter.create({
        userId: user._id,
        companyName,
        comapanyWebsite,
        country,
        description,
        email,
        name,
        phoneNumber,
        profileLink,
      }).then((recruiter) => {
        res.status(201).json({
          success: true,
          data: recruiter
        });
      }).catch((error) => {
        console.log(error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      });
    } else {
      const contributor = await Contributor.create({
        userId: user._id,
        email,
        name,
        country,
        phoneNumber,
        profileLink,
      }).then((contributor) => {
        res.status(201).json({
          success: true,
          data: contributor
        });
      }).catch((error) => {
        console.log(error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      });
    }
  }).catch((error) => {
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  });
}