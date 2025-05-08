const Recruiter = require('../models/recruiterModel');

// Create
exports.create = async (req, res) => {
  try {
    const newItem = await Recruiter.create(req.body);
    res.status(201).json({
      success: true,
      data: newItem
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Read (Get All)
exports.getAll = async (req, res) => {
  try {
    const items = await Recruiter.find().sort({
      isFeatured: -1, // Sort by isFeatured (true first)
      featureRank: 1, // Sort by featureRank (ascending) for featured jobs
      positions: -1,  // Sort by createdAt (descending) for remaining jobs
    });
    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Read (Get One)
exports.getOne = async (req, res) => {
  try {
    const item = await Recruiter.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update
exports.update = async (req, res) => {
  try {
    const item = await Recruiter.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
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

// Delete
exports.delete = async (req, res) => {
  try {
    const item = await Recruiter.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// Get all recruiters
exports.getAllRecruiters = async (req, res) => {
  try {
    const recruiters = await Recruiter.find({ isDeleted: false })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: recruiters.length,
      data: recruiters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single recruiter
exports.getRecruiter = async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.params.id);

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        error: 'Recruiter not found'
      });
    }

    res.status(200).json({
      success: true,
      data: recruiter
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create new recruiter
exports.createRecruiter = async (req, res) => {
  try {
    const recruiter = await Recruiter.create({
      ...req.body,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    res.status(201).json({
      success: true,
      data: recruiter
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update recruiter
exports.updateRecruiter = async (req, res) => {
  try {
    const recruiter = await Recruiter.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        error: 'Recruiter not found'
      });
    }

    res.status(200).json({
      success: true,
      data: recruiter
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete recruiter
exports.deleteRecruiter = async (req, res) => {
  try {
    const recruiter = await Recruiter.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: Date.now()
      },
      { new: true }
    );

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        error: 'Recruiter not found'
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

exports.pinRecruiter = async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.body.id);

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        error: 'Recruiter not found',
      });
    }

    // Pin the Recruiter and set its featureRank
    const featureRank = await Recruiter.countDocuments({ isFeatured: true }) + 1;
    const updatedRecruiter = await Recruiter.findByIdAndUpdate(
      req.body.id,
      {
        isFeatured: true,
        featureRank,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Recruiter pinned.',
      data: [updatedRecruiter], // Return only the updated Recruiter
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Pin Recruiter Failed',
      details: error.message,
    });
  }
};

exports.unPinRecruiter = async (req, res) => {
  try {
    const { id } = req.body;

    const recruiterToUnpin = await Recruiter.findById(id);

    if (!recruiterToUnpin) {
      return res.status(404).json({
        success: false,
        error: 'Recruiter not found',
      });
    }

    // Unpin the Recruiter and reset its featureRank
    const unpinnedRecruiter = await Recruiter.findByIdAndUpdate(
      id,
      {
        isFeatured: false,
        featureRank: 0,
      },
      { new: true }
    );

    // Decrease the featureRank of Recruiter below the unpinned Recruiter
    const affectedRecruiters = await Recruiter.find({
      isFeatured: true,
      featureRank: { $gt: recruiterToUnpin.featureRank },
    });

    await Recruiter.updateMany(
      { isFeatured: true, featureRank: { $gt: recruiterToUnpin.featureRank } },
      { $inc: { featureRank: -1 } }
    );

    // Fetch the updated Recruiter
    const updatedRecruiters = await Recruiter.find({
      _id: { $in: affectedRecruiters.map((recruiter) => recruiter._id) },
    });

    res.status(200).json({
      success: true,
      message: 'Recruiter unpinned and ranks updated.',
      data: [unpinnedRecruiter, ...updatedRecruiters], // Return only the updated recruiters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Unpin Recruiter Failed',
      details: error.message,
    });
  }
};

exports.upRankRecruiter = async (req, res) => {
  try {
    const { id } = req.body;

    const recruiter = await Recruiter.findById(id);

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        error: 'Recruiter not found',
      });
    }

    const currentRank = recruiter.featureRank;

    const recruiterAbove = await Recruiter.findOne({
      isFeatured: true,
      featureRank: currentRank - 1,
    });

    if (recruiterAbove) {
      // Swap ranks with the recruiter above
      await Recruiter.findByIdAndUpdate(recruiterAbove._id, { featureRank: currentRank });
    }

    const updatedRecruiter = await Recruiter.findByIdAndUpdate(
      id,
      { featureRank: currentRank - 1 },
      { new: true }
    );

    // Fetch the updated recruiters
    const updatedRecruiters = await Recruiter.find({
      _id: { $in: [recruiterAbove?._id, updatedRecruiter._id] },
    });

    res.status(200).json({
      success: true,
      message: 'Recruiter rank increased.',
      data: updatedRecruiters, // Return only the updated Recruiters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Recruiter rank increase failed',
      details: error.message,
    });
  }
};
exports.downRankRecruiter = async (req, res) => {
  try {
    const { id } = req.body;

    const recruiter = await Recruiter.findById(id);

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        error: 'Recruiter not found',
      });
    }

    const currentRank = recruiter.featureRank;

    const recruiterBelow = await Recruiter.findOne({
      isFeatured: true,
      featureRank: currentRank + 1,
    });

    if (recruiterBelow) {
      // Swap ranks with the recruiter below
      await Recruiter.findByIdAndUpdate(recruiterBelow._id, { featureRank: currentRank });
    }

    const updatedRecruiter = await Recruiter.findByIdAndUpdate(
      id,
      { featureRank: currentRank + 1 },
      { new: true }
    );

    // Fetch the updated recruiters
    const updatedRecruiters = await Recruiter.find({
      _id: { $in: [recruiterBelow?._id, updatedRecruiter._id] },
    });

    res.status(200).json({
      success: true,
      message: 'Recruiter rank decreased.',
      data: updatedRecruiters, // Return only the updated recruiters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Recruiter rank decrease failed',
      details: error.message,
    });
  }
};

// Add other recruiter controller methods 