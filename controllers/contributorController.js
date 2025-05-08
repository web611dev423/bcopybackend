const Contributor = require('../models/contributorModel');

// Create
exports.create = async (req, res) => {
  try {
    const newItem = await Contributor.create(req.body);

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
    const items = await Contributor.find();
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
    const item = await Contributor.findById(req.params.id);
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
    const item = await Contributor.findByIdAndUpdate(
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
    const item = await Contributor.findByIdAndDelete(req.params.id);
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



exports.getAllContributors = async (req, res) => {
  try {
    const contributors = await Contributor.find({ isDeleted: false })
      .sort({
        isFeatured: -1, // Sort by isFeatured (true first)
        featureRank: 1, // Sort by featureRank (ascending) for featured jobs
        contributions: -1,  // Sort by createdAt (descending) for remaining jobs
      });

    res.status(200).json({
      success: true,
      count: contributors.length,
      data: contributors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getContributor = async (req, res) => {
  try {
    const contributor = await Contributor.findById(req.params.id);
    if (!contributor) {
      return res.status(404).json({
        success: false,
        message: 'Contributor not found'
      });
    }
    res.status(200).json({
      success: true,
      data: contributor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateContributor = async (req, res) => {
  try {
    const contributor = await Contributor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!contributor) {
      return res.status(404).json({
        success: false,
        message: 'Contributor not found'
      });
    }
    res.status(200).json({
      success: true,
      data: contributor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteContributor = async (req, res) => {
  try {
    const contributor = await Contributor.findByIdAndDelete(req.params.id);
    if (!contributor) {
      return res.status(404).json({
        success: false,
        message: 'Contributor not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Contributor deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.createContributor = async (req, res) => {
  try {
    const newContributor = await Contributor.create(req.body);
    res.status(201).json({
      success: true,
      data: newContributor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.pinContributor = async (req, res) => {

  try {
    const contributor = await Contributor.findById(req.body.id);

    if (!contributor) {
      return res.status(404).json({
        success: false,
        error: 'Contributor not found',
      });
    }

    // Pin the Contributor and set its featureRank
    const featureRank = await Contributor.countDocuments({ isFeatured: true }) + 1;
    const updatedContributor = await Contributor.findByIdAndUpdate(
      req.body.id,
      {
        isFeatured: true,
        featureRank,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Contributor pinned.',
      data: [updatedContributor], // Return only the updated Contributor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Pin Contributor Failed',
      details: error.message,
    });
  }
};

exports.unPinContributor = async (req, res) => {
  try {
    const { id } = req.body;

    const contributorToUnpin = await Contributor.findById(id);

    if (!contributorToUnpin) {
      return res.status(404).json({
        success: false,
        error: 'Contributor not found',
      });
    }

    // Unpin the Contributor and reset its featureRank
    const unpinnedContributor = await Contributor.findByIdAndUpdate(
      id,
      {
        isFeatured: false,
        featureRank: 0,
      },
      { new: true }
    );

    // Decrease the featureRank of Contributor below the unpinned Contributor
    const affectedContributors = await Contributor.find({
      isFeatured: true,
      featureRank: { $gt: contributorToUnpin.featureRank },
    });

    await Contributor.updateMany(
      { isFeatured: true, featureRank: { $gt: contributorToUnpin.featureRank } },
      { $inc: { featureRank: -1 } }
    );

    // Fetch the updated Contributor
    const updatedContributors = await Contributor.find({
      _id: { $in: affectedContributors.map((contributor) => contributor._id) },
    });

    res.status(200).json({
      success: true,
      message: 'Contributor unpinned and ranks updated.',
      data: [unpinnedContributor, ...updatedContributors], // Return only the updated contributors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Unpin Contributor Failed',
      details: error.message,
    });
  }
};

exports.upRankContributor = async (req, res) => {
  try {
    const { id } = req.body;

    const contributor = await Contributor.findById(id);

    if (!contributor) {
      return res.status(404).json({
        success: false,
        error: 'Contributor not found',
      });
    }

    const currentRank = contributor.featureRank;

    const contributorAbove = await Contributor.findOne({
      isFeatured: true,
      featureRank: currentRank - 1,
    });

    if (contributorAbove) {
      // Swap ranks with the contributor above
      await Contributor.findByIdAndUpdate(contributorAbove._id, { featureRank: currentRank });
    }

    const updatedContributor = await Contributor.findByIdAndUpdate(
      id,
      { featureRank: currentRank - 1 },
      { new: true }
    );

    // Fetch the updated contributors
    const updatedContributors = await Contributor.find({
      _id: { $in: [contributorAbove?._id, updatedContributor._id] },
    });

    res.status(200).json({
      success: true,
      message: 'Contributor rank increased.',
      data: updatedContributors, // Return only the updated Contributors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Contributor rank increase failed',
      details: error.message,
    });
  }
};
exports.downRankContributor = async (req, res) => {
  try {
    const { id } = req.body;

    const contributor = await Contributor.findById(id);

    if (!contributor) {
      return res.status(404).json({
        success: false,
        error: 'Contributor not found',
      });
    }

    const currentRank = contributor.featureRank;

    const contributorBelow = await Contributor.findOne({
      isFeatured: true,
      featureRank: currentRank + 1,
    });

    if (contributorBelow) {
      // Swap ranks with the contributor below
      await Contributor.findByIdAndUpdate(contributorBelow._id, { featureRank: currentRank });
    }

    const updatedContributor = await Contributor.findByIdAndUpdate(
      id,
      { featureRank: currentRank + 1 },
      { new: true }
    );

    // Fetch the updated contributors
    const updatedContributors = await Contributor.find({
      _id: { $in: [contributorBelow?._id, updatedContributor._id] },
    });

    res.status(200).json({
      success: true,
      message: 'Contributor rank decreased.',
      data: updatedContributors, // Return only the updated contributors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Contributor rank decrease failed',
      details: error.message,
    });
  }
};
