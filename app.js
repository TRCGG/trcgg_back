/**
 * express Server Setting
 */
const express = require("express");
const cors = require("cors");
const compression = require('compression');
require('dotenv').config();
const leagueRoutes = require('./app/routes/leagueRoutes');
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./app/swagger/swagger-output.json");
const db = require('./app/db/db');
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";
const bot = require('./bot/bot');

const app = express();

app.use(express.json());
app.use(compression());
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: '*'
}));
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerFile));

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
