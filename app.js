require('dotenv').config(); // .env 파일 로드

/**
 * express Server Setting
 */
const express = require("express");
const cors = require("cors");
const leagueRoutes = require('./app/routes/leagueRoutes');
const db = require('./app/db/db');
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";
const dotenv = require('dotenv');

const app = express();

app.use(express.json());

app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: '*'
}));

try {
  db.testConnection();
} catch (error) {
  console.error("Database connection error:", error);
}

app.use('/league', leagueRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on ${HOST}:${PORT}🚀`);
});
