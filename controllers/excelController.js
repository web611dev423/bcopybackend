const XLSX = require('xlsx');
const Program = require('../models/programModel'); // Adjust based on your model name
const Category = require('../models/categoryModel');

const processExcel = async (req, res) => {
  console.log("I am here");
  try {
    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Read the Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Process each row and save to database
    const savedPrograms = [];
    for (const row of data) {
      let categoryId = null;
      let category = await Category.findOne({ name: row.category });

      if (category) {
        categoryId = category._id;
      } else {
        const newCategory = new Category({ name: row.category });
        await newCategory.save();
        categoryId = newCategory._id;
      }

      console.log('Category ID:', categoryId);

      const program = new Program({
        name: row.name || 'name',
        description: row.description || 'description',
        isActive: row.isActive === 'true',
        code: {
          java: row.javaCode || 'sample',
          python: row.pythonCode || 'sample',
          html: row.htmlCode || 'sample'
        },
        category: categoryId,
      });

      console.log('Program to save:', program);
      const savedProgram = await program.save();
      savedPrograms.push(savedProgram);
    }
    res.status(200).json({
      message: 'Excel file processed successfully',
      programs: savedPrograms
    });

  } catch (error) {
    console.error('Error processing excel file:', error);
    res.status(500).json({ message: 'Error processing excel file', error: error.message });
  }
};

module.exports = {
  processExcel
}; 