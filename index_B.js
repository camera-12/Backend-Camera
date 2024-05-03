/* 
  For Privacy
  Load environment variables from a .env file for better security 
*/
require("dotenv").config();

// Import the Cross-Origin Resource Sharing (CORS) middleware
const cors = require("cors");

// Import the Express framework for building the server
const express = require("express");

const mongoose = require("mongoose");
const url = process.env.MONGO_URL;

// Step Status
const httpStatusText = require("./utils/httpStatusText");

const usersRouter = require("./routes/Users.routes");

// Create an instance of the Express application
const app = express();

// Enable Cross-Origin Resource Sharing (CORS) for handling requests from different origins
app.use(cors());

// Enable JSON parsing middleware to handle incoming JSON data in requests
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});
// Forward to Specific API

app.use("/api/users", usersRouter);

mongoose.connect(url).then(() => {
  console.log("MongoDB Server Started");
});

// global middleware for not found router
app.all("*", (req, res, next) => {
  return res.status(404).json({
    status: httpStatusText.ERROR,
    message: "This resource is not available",
  });
});

// global error handler
app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    status: error.statusText || httpStatusText.ERROR,
    message: error.message,
    code: error.statusCode || 500,
    data: null,
  });
});

// Start the server and make it listen for incoming requests
app.listen(process.env.PORT || 5000, () => {
  // Log the port on which the server is listening
  console.log("Server is listening on port:", process.env.PORT || 5000);
});
