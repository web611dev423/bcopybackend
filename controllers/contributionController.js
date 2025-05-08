// const Program = require('../models/programModel');
const Contribution = require('../models/contributionModel');
const Contributor = require('../models/contributorModel');
const User = require('../models/userModel');
const { emitToAdmins } = require('../socket/emitSocket');

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

exports.getSavedContributions = async (req, res) => {
  try {
    const _id = req.params.id;
    const user = await User.findOne({ _id });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials(user not found)'
      });
    }
    let savedContributions = [];

    if (user.userType === "user") {
      // Find contributor and their saved contributions using aggregation
      const contributorWithContributions = await Contributor.aggregate([
        // Match the contributor by userId
        { $match: { userId: user._id } },
        // Lookup contributions
        {
          $lookup: {
            from: 'contributions',
            localField: 'contributions',
            foreignField: '_id',
            as: 'contributionDetails'
          }
        },
        // Unwind the contributions array
        { $unwind: '$contributionDetails' },
        // Match only saved contributions
        {
          $match: {
            'contributionDetails.status': 'saved'
          }
        },
        // Group back to get array of saved contributions
        {
          $group: {
            _id: '$_id',
            savedContributions: { $push: '$contributionDetails' }
          }
        }
      ]);

      if (contributorWithContributions.length > 0) {
        savedContributions = contributorWithContributions[0].savedContributions;
      }
    }

    res.status(200).json({
      success: true,
      data: savedContributions
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

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
    const contributor = await Contributor.findOne({ email: req.body.useremail });
    if (!contributor) {
      return res.status(404).json({
        success: false,
        error: 'Contributor not found'
      });
    }

    // First check if contribution exists for this program and contributor
    let contribution = await Contribution.findOne({
      programId: req.body.programId,
      submittedBy: contributor._id
    });

    if (contribution) {
      // Update existing contribution
      contribution = await Contribution.findByIdAndUpdate(
        contribution._id,
        {
          code: {
            java: req.body.code.javacode,
            python: req.body.code.pythoncode,
            html: req.body.code.htmlcode
          },
          description: req.body.description,
          type: req.body.type,
          status: req.body.status,
          updatedAt: Date.now()
        },
        { new: true }
      );

      // Emit notification for update
      emitToAdmins('update-contribution', {
        id: contribution.id,
        type: contribution.type,
        useremail: req.body.useremail,
        message: `Updated ${contribution.type} contribution from ${req.body.useremail}`
      });

    } else {
      // Create new contribution
      contribution = await new Contribution({
        code: {
          java: req.body.code.javacode,
          python: req.body.code.pythoncode,
          html: req.body.code.htmlcode
        },
        description: req.body.description,
        type: req.body.type,
        status: req.body.status,
        programId: req.body.programId,
        submittedBy: contributor._id,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }).save();

      // Update contributor's contributions array using aggregation
      await Contributor.aggregate([
        {
          $match: {
            _id: contributor._id
          }
        },
        {
          $addFields: {
            contributions: {
              $concatArrays: [
                { $ifNull: ['$contributions', []] },
                [contribution._id]
              ]
            }
          }
        },
        {
          $merge: {
            into: 'contributors',
            on: '_id',
            whenMatched: 'replace',
            whenNotMatched: 'discard'
          }
        }
      ]);

      // Emit notification for new contribution
      emitToAdmins('new-contribution', {
        id: contribution.id,
        type: contribution.type,
        useremail: req.body.useremail,
        message: `New ${contribution.type} contribution from ${req.body.useremail}`
      });
    }

    res.status(201).json({
      success: true,
      data: contribution,
      isNew: !contribution
    });

  } catch (error) {
    console.error('Create/Update contribution error:', error);
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
      req.body.id,
      {
        isVisible: false,
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


exports.pinContribution = async (req, res) => {

  try {
    const contribution = await Contribution.findById(req.body.id);

    if (!contribution) {
      return res.status(404).json({
        success: false,
        error: 'Contribution not found',
      });
    }

    // Pin the contribution and set its featureRank
    const featureRank = await Contribution.countDocuments({ isFeatured: true }) + 1;
    const updatedContribution = await Contribution.findByIdAndUpdate(
      req.body.id,
      {
        isFeatured: true,
        featureRank,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Contribution pinned.',
      data: [updatedContribution], // Return only the updated contribution
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Pin Contribution Failed',
      details: error.message,
    });
  }
};

exports.unPinContribution = async (req, res) => {
  try {
    const { id } = req.body;

    const contributionToUnpin = await Contribution.findById(id);

    if (!contributionToUnpin) {
      return res.status(404).json({
        success: false,
        error: 'Contribution not found',
      });
    }

    // Unpin the contribution and reset its featureRank
    const unpinnedContribution = await Contribution.findByIdAndUpdate(
      id,
      {
        isFeatured: false,
        featureRank: 0,
      },
      { new: true }
    );

    // Decrease the featureRank of contributions below the unpinned contribution
    const affectedContributions = await Contribution.find({
      isFeatured: true,
      featureRank: { $gt: contributionToUnpin.featureRank },
    });

    await Contribution.updateMany(
      { isFeatured: true, featureRank: { $gt: contributionToUnpin.featureRank } },
      { $inc: { featureRank: -1 } }
    );

    // Fetch the updated contributions
    const updatedContributions = await Contribution.find({
      _id: { $in: affectedContributions.map((contribution) => contribution._id) },
    });

    res.status(200).json({
      success: true,
      message: 'Contribution unpinned and ranks updated.',
      data: [unpinnedContribution, ...updatedContributions], // Return only the updated contributions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Unpin Contribution Failed',
      details: error.message,
    });
  }
};

exports.upRankContribution = async (req, res) => {
  try {
    const { id } = req.body;

    const contribution = await Contribution.findById(id);

    if (!contribution) {
      return res.status(404).json({
        success: false,
        error: 'Contribution not found',
      });
    }

    const currentRank = contribution.featureRank;

    const contributionAbove = await Contribution.findOne({
      isFeatured: true,
      featureRank: currentRank - 1,
    });

    if (contributionAbove) {
      // Swap ranks with the contribution above
      await Contribution.findByIdAndUpdate(contributionAbove._id, { featureRank: currentRank });
    }

    const updatedContribution = await Contribution.findByIdAndUpdate(
      id,
      { featureRank: currentRank - 1 },
      { new: true }
    );

    // Fetch the updated contributions
    const updatedContributions = await Contribution.find({
      _id: { $in: [contributionAbove?._id, updatedContribution._id] },
    });

    res.status(200).json({
      success: true,
      message: 'Contribution rank increased.',
      data: updatedContributions, // Return only the updated contributions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Contribution rank increase failed',
      details: error.message,
    });
  }
};
exports.downRankContribution = async (req, res) => {
  try {
    const { id } = req.body;

    const contribution = await Contribution.findById(id);

    if (!contribution) {
      return res.status(404).json({
        success: false,
        error: 'Contribution not found',
      });
    }

    const currentRank = contribution.featureRank;

    const contributionBelow = await Contribution.findOne({
      isFeatured: true,
      featureRank: currentRank + 1,
    });

    if (contributionBelow) {
      // Swap ranks with the contribution below
      await Contribution.findByIdAndUpdate(contributionBelow._id, { featureRank: currentRank });
    }

    const updatedContribution = await Contribution.findByIdAndUpdate(
      id,
      { featureRank: currentRank + 1 },
      { new: true }
    );

    // Fetch the updated contributions
    const updatedContributions = await Contribution.find({
      _id: { $in: [contributionBelow?._id, updatedContribution._id] },
    });

    res.status(200).json({
      success: true,
      message: 'Contribution rank decreased.',
      data: updatedContributions, // Return only the updated contributions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Contribution rank decrease failed',
      details: error.message,
    });
  }
};