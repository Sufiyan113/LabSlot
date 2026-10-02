/**
 * MongoDB connection using Mongoose.
 * - Reads MONGO_URI from environment variables.
 * - Provides clear console feedback.
 * - Exits the process on fatal connection failure so the server does not start half-broken.
 */
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 8+ no longer needs useNewUrlParser / useUnifiedTopology
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name  : ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Exit with failure code so process managers / Docker notice the problem
    process.exit(1);
  }
};

module.exports = connectDB;
