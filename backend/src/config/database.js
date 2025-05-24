const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

// Initialize Sequelize with database credentials
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql", // Change this to your database type (e.g., 'postgres', 'sqlite', 'mssql')
    logging: false,
    dialectOptions: {
      dateStrings: true, // Ensure dates are returned as strings
      typeCast: true, // Cast dates to strings
    },
    timezone: "+00:00", // Set timezone to UTC
  }
);

// Function to test connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

// Export both `sequelize` and `connectDB`
module.exports = { sequelize, connectDB };
