const mongoose = require("mongoose");

const dbConnect = () => {
  // Add error handling for missing DATABASE_URL
  require('dotenv').config();
  const databaseUrl = process.env.DATABASE_URL;
  mongoose.connect(databaseUrl)
    .then(() => console.log("Database Created Successfully on 27017 port..."))
    .catch((error) => {
      console.log("Database Connection Error...");
      console.error(error.message);
      process.exit(1);
    })
}

module.exports = dbConnect;