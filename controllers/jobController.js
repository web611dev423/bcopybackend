const Job = require('../models/jobModel');
const Contributor = require('../models/contributorModel');
const Recruiter = require('../models/recruiterModel');
const tmp = require('tmp');
const fs = require('fs');
const transporter = require('../utils/sendMailer');
const axios = require('axios');
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ isVisible: true })
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
      req.body.id,
      {
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
      data: job
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
    ).then(async (job) => {
      await Recruiter.aggregate([
        {
          $match: {
            _id: job._id
          }
        },
        {
          $addFields: {
            CaretPositions: {
              $concatArrays: [
                { $ifNull: ['$positions', []] },
                [job._id]
              ]
            }
          }
        },
        {
          $merge: {
            into: 'recruiters',
            on: '_id',
            whenMatched: 'replace',
            whenNotMatched: 'discard'
          }
        }
      ]);
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

exports.applyJob = async (req, res) => {
  const { userId, jobId, coverLetter } = req.body;
  const fileUrl = req.file?.path;

  if (!fileUrl) {
    return res.status(400).json({
      success: false,
      error: 'Resume file is required.'
    });
  }

  try {
    // Fetch job and user details
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    console.log(job.recruiter);
    const recruiter = await Recruiter.findOne({ userId: job.recruiter });
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        error: 'Recruiter not found'
      });
    }
    const contributor = await Contributor.findOne({ userId });
    if (!contributor) {
      return res.status(404).json({
        success: false,
        error: 'Contributor not found'
      });
    }

    // Download file from Cloudinary with timeout and retry
    let response;
    try {
      response = await axios.get(fileUrl, {
        responseType: 'arraybuffer',
        timeout: 200000, // 10 second timeout
        maxRedirects: 5,
        // validateStatus: function (status) {
        //   return status >= 200 && status < 300;
        // }
      });
    } catch (downloadError) {
      console.error('Error downloading file:', downloadError);
      return res.status(500).json({
        success: false,
        error: 'Failed to download resume file',
        details: downloadError.message
      });
    }
    console.log('download success');


    // Step 2: Save to a temporary file
    const tempFile = tmp.fileSync({ postfix: '.pdf' });
    fs.writeFileSync(tempFile.name, response.data);

    // Prepare email content
    const subject = `New Application for Job ID: ${job.title} from ${contributor.name}`;
    console.log('Preparing email with subject:', subject);

    const html = `
      Dear ${recruiter.name},
      I hope this message finds you well. 
      I recently came across the ${job.title} position at ${job.company} and was immediately drawn to the opportunity.
      I have attached my resume for your review.
      ${coverLetter}
      I would welcome the chance to further discuss how I can contribute to ${job.company} and this role.
      Thank you for considering my application. 
      I look forward to the possibility of connecting with you.
      
      Best regards,
      ${contributor.name}

      ${contributor.email} | ${contributor.profileLink}`;

    console.log('Email content prepared, attempting to send...');

    // Send email with attachment
    await transporter.sendMail({
      from: contributor.email,
      to: recruiter.email,
      subject,
      html,
      attachments: [
        {
          filename: "resume.pdf",
          content: tempFile,
          contentType: "application/pdf"
        }
      ]
    });

    console.log('Email sent successfully');

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully.'
    });

  } catch (error) {
    console.error('Error in applyJob:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process application.  ',
      details: error.message
    });
  }
};
