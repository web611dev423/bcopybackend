const Program = require('../models/programModel');
const getFullCategoryName = require('../utils/getCategoryFullName');
// Create
exports.create = async (req, res) => {
  try {
    const newItem = await Program.create(req.body);
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

exports.getAll = async (req, res) => {
  try {
    const items = await Program.find();

    // Add categoryFullName to each item
    const itemsWithCategoryFullName = await Promise.all(
      items.map(async (item) => {
        const categoryFullName = await getFullCategoryName(item.category); // Assuming `item.category` contains the category ID
        return {
          ...item.toObject(), // Convert Mongoose document to plain object
          categoryFullName, // Add the full category name
        };
      })
    );

    res.status(200).json({
      success: true,
      count: itemsWithCategoryFullName.length,
      data: itemsWithCategoryFullName,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update
exports.update = async (req, res) => {
  try {
    const item = await Program.findByIdAndUpdate(
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
    const item = await Program.findByIdAndDelete(req.params.id);
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

exports.copy = async (req, res) => {
  try {
    const item = await Program.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { copies: 1 }
      },
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
      message: 'Item copied successfully',
      item: item
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}
exports.view = async (req, res) => {
  try {
    const item = await Program.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { views: 1 }
      },
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
      message: 'Item viewed successfully',
      item: item
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}
exports.share = async (req, res) => {
  try {
    const item = await Program.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { shares: 1 }
      },
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
      message: 'Item shared successfully',
      item: item
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

exports.acceptProgram = async (req, res) => {
  try {
    const item = await Program.findByIdAndUpdate(
      req.body.id,
      {
        $set: {
          isActive: true
        }
      },
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
      message: 'Item accepted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

exports.rejectProgram = async (req, res) => {
  try {
    const item = await Program.findByIdAndUpdate(
      req.body.id,
      {
        $set: {
          isActive: false
        }
      },
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
      message: 'Item rejected successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}
exports.fetchStatus = async (req, res) => {
  try {
    const item = await Program.findById(req.body.id);
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
}

exports.pinProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.body.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        error: 'Program not found',
      });
    }

    // Pin the Program and set its featureRank
    const featureRank = await Program.countDocuments({ isFeatured: true }) + 1;
    const updatedProgram = await Program.findByIdAndUpdate(
      req.body.id,
      {
        isFeatured: true,
        featureRank,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Program pinned.',
      data: [updatedProgram], // Return only the updated Program
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Pin Program Failed',
      details: error.message,
    });
  }
};

exports.unPinProgram = async (req, res) => {
  try {
    const { id } = req.body;

    const programToUnpin = await Program.findById(id);

    if (!programToUnpin) {
      return res.status(404).json({
        success: false,
        error: 'Program not found',
      });
    }

    // Unpin the Program and reset its featureRank
    const unpinnedProgram = await Program.findByIdAndUpdate(
      id,
      {
        isFeatured: false,
        featureRank: 0,
      },
      { new: true }
    );

    // Decrease the featureRank of Program below the unpinned Program
    const affectedPrograms = await Program.find({
      isFeatured: true,
      featureRank: { $gt: programToUnpin.featureRank },
    });

    await Program.updateMany(
      { isFeatured: true, featureRank: { $gt: programToUnpin.featureRank } },
      { $inc: { featureRank: -1 } }
    );

    // Fetch the updated Program
    const updatedPrograms = await Program.find({
      _id: { $in: affectedPrograms.map((program) => program._id) },
    });

    res.status(200).json({
      success: true,
      message: 'Program unpinned and ranks updated.',
      data: [unpinnedProgram, ...updatedPrograms], // Return only the updated programs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Unpin Program Failed',
      details: error.message,
    });
  }
};

exports.upRankProgram = async (req, res) => {
  try {
    const { id } = req.body;

    const program = await Program.findById(id);

    if (!program) {
      return res.status(404).json({
        success: false,
        error: 'Program not found',
      });
    }

    const currentRank = program.featureRank;

    const programAbove = await Program.findOne({
      isFeatured: true,
      featureRank: currentRank - 1,
    });

    if (programAbove) {
      // Swap ranks with the program above
      await Program.findByIdAndUpdate(programAbove._id, { featureRank: currentRank });
    }

    const updatedProgram = await Program.findByIdAndUpdate(
      id,
      { featureRank: currentRank - 1 },
      { new: true }
    );

    // Fetch the updated programs
    const updatedPrograms = await Program.find({
      _id: { $in: [programAbove?._id, updatedProgram._id] },
    });

    res.status(200).json({
      success: true,
      message: 'Program rank increased.',
      data: updatedPrograms, // Return only the updated Programs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Program rank increase failed',
      details: error.message,
    });
  }
};
exports.downRankProgram = async (req, res) => {
  try {
    const { id } = req.body;

    const program = await Program.findById(id);

    if (!program) {
      return res.status(404).json({
        success: false,
        error: 'Program not found',
      });
    }

    const currentRank = program.featureRank;

    const programBelow = await Program.findOne({
      isFeatured: true,
      featureRank: currentRank + 1,
    });

    if (programBelow) {
      // Swap ranks with the program below
      await Program.findByIdAndUpdate(programBelow._id, { featureRank: currentRank });
    }

    const updatedProgram = await Program.findByIdAndUpdate(
      id,
      { featureRank: currentRank + 1 },
      { new: true }
    );

    // Fetch the updated programs
    const updatedPrograms = await Program.find({
      _id: { $in: [programBelow?._id, updatedProgram._id] },
    });

    res.status(200).json({
      success: true,
      message: 'Program rank decreased.',
      data: updatedPrograms, // Return only the updated programs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Program rank decrease failed',
      details: error.message,
    });
  }
};