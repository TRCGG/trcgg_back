/**
 * express Server Setting
 */
const express = require("express");
const cors = require("cors");
require('dotenv').config();
const leagueRoutes = require('./app/routes/leagueRoutes');
const db = require('./app/db/db');
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

const app = express();

app.use(express.json());

app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: '*'
}));

const init = async () => {
  try {
    await db.testConnection();
    app.use('/league', leagueRoutes);
    app.listen(PORT, () => {
      console.log(`Server is running on ${HOST}:${PORT}🚀`);
    });
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

init();
