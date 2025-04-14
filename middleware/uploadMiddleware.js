const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();
// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uploads',
    resource_type: 'raw', // for .xlsx and non-image files
    format: async (req, file) => 'xlsx',
    public_id: (req, file) => 'code-' + Date.now(),
  },
});

const upload = multer({ storage });

module.exports = upload;
