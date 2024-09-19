const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const router = require('./routes/wordRoutes');
const cors = require('cors');

// Create Express server
const app = express();

// set the port
const port = process.env.PORT || 8000;

// Middleware to parse JSON bodies
app.use(express.json());

const corsOptions = {
  origin: ['http://localhost:3000', 'https://dictionary-frontend-ycl1.onrender.com', 'https://www.skylerrsimpson.com'],
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests

// Connect to MongoDB database
mongoose.connect(process.env.ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

// Routes
app.use('/words', router);

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
