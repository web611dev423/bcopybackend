// const Program = require('../models/programModel');
const Contribution = require('../models/contributionModel');
const Contributor = require('../models/contributorModel');
const mongoose = require('mongoose');
const { emitToAdmins } = require('../utils/socketManager');

// Get all contributions (programs)
exports.getAllContributions = async (req, res) => {
  try {
    const contributions = await Contribution.find({ isVisible: true });
    res.status(200).json({
      success: true,
      count: contributions.length,
      data: contributions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single contribution
exports.getContribution = async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id)
      .populate('programId', 'name')
      .populate('submittedBy', 'name');

    if (!contribution) {
      return res.status(404).json({
        success: false,
        error: 'Contribution not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contribution
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create new contribution
exports.createContribution = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const contributor = await Contributor.findOne({ email: req.body.useremail });

    const contribution = new Contribution({
      code: {
        java: req.body.code.javacode,
        python: req.body.code.pythoncode,
        html: req.body.code.htmlcode
      },
      description: req.body.description,
      type: req.body.type,
      programId: req.body.programId,
      submittedBy: contributor._id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }).save().then(
      (contribution) => {
        console.log('SOCKET');
        // Emit notification to admin
        emitToAdmins('new-contribution', {
          id: contribution.id,
          type: contribution.type,
          useremail: contribution.useremail,
          message: `New ${contribution.type} contribution from ${contribution.useremail}`
        });

        res.status(201).json({
          success: true,
          data: contribution
        });
      }
    )
      .catch((error) => {
        res.status(400).json({
          success: false,
          error: error.message
        });
      });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update contribution
exports.updateContribution = async (req, res) => {
  try {
    const contribution = await Contribution.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!contribution) {
      return res.status(404).json({
        success: false,
        error: 'Contribution not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contribution
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete contribution
exports.deleteContribution = async (req, res) => {
  try {
    const contribution = await Contribution.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: Date.now()
      },
      { new: true }
    );

    if (!contribution) {
      return res.status(404).json({
        success: false,
        error: 'Contribution not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update contribution status
exports.updateContributionStatus = async (req, res) => {
  try {
    const contribution = await Contribution.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!contribution) {
      return res.status(404).json({
        success: false,
        error: 'Contribution not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contribution
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.acceptContribution = async (req, res) => {
  try {
    await Contribution.findByIdAndUpdate(
      req.body.id,
      {
        status: 'approved',
        updatedAt: Date.now()
      },
      { new: true }
    ).then((contribution) => {
      res.status(200).json({
        success: true,
        data: contribution
      });
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.rejectContribution = async (req, res) => {
  try {
    await Contribution.findByIdAndUpdate(
      req.body.id,
      {
        status: 'rejected',
        updatedAt: Date.now()
      },
      { new: true }
    ).then((contribution) => {
      res.status(200).json({
        success: true,
        data: contribution
      });
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.fetchStatus = async (req, res) => {
  try {
    const item = await Contribution.findById(req.body.id);
    console.log(item);
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};