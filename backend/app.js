const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const router = require('./routes/wordRoutes');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8000;

const corsOptions = {
  origin: ['http://localhost:3000', 'https://dictionary-frontend-ycl1.onrender.com', 'https://skylerdictionary.netlify.app'],
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from backend!');
});

mongoose.connect(process.env.ATLAS_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.once('open', () => {
  console.log('MongoDB connection established');
});

app.use('/words', router);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
