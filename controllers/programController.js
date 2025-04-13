// Replace "Model" with your actual model name
const Model = require('../models/programModel');

// Create
exports.create = async (req, res) => {
  try {
    const newItem = await Model.create(req.body);
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
    const items = await Model.find();
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
    const item = await Model.findById(req.params.id);
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
    const item = await Model.findByIdAndUpdate(
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
    const item = await Model.findByIdAndDelete(req.params.id);
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
    const item = await Model.findByIdAndUpdate(
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
    console.log('copy success');
    res.status(200).json({
      success: true,
      message: 'Item copied successfully'
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
    const item = await Model.findByIdAndUpdate(
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
    console.log(error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

exports.rejectProgram = async (req, res) => {
  try {
    const item = await Model.findByIdAndUpdate(
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
    const item = await Model.findById(req.body.id);
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