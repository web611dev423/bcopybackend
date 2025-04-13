const Job = require('../models/jobModel');

exports.getAllJobs = async (req, res) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    // console.log(query);
    const jobs = await Job.find(query)
      .populate('recruiter', 'name companyName companyLogo')
      .sort('-createdAt');
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('recruiter');

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.createJob = async (req, res) => {
  try {
    const job = await Job.create(req.body);

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: Date.now(),
        isVisible: false
      },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
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

exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      {
        status,
        approvedAt: status === 'approved' ? Date.now() : null
      },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.acceptJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.body.id,
      {
        status: 'approved',
        updatedAt: Date.now()
      },
      { new: true }
    ).then((job) => {
      res.status(200).json({
        success: true,
        data: job
      });
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.rejectJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.body.id,
      {
        status: 'rejected',
        updatedAt: Date.now()
      },
      { new: true }
    ).then((job) => {
      res.status(200).json({
        success: true,
        data: job
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
    const item = await Job.findById(req.body.id);
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