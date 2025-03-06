/**
 * Express Server Configuration
 */
const express = require('express');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

// Constants
const CONFIG = {
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || 'localhost',
  CORS_OPTIONS: {
    origin: '*',
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: '*'
  }
};

// Import routes
const routes = {
  account: require('./app/routes/accountRoutes'),
  record: require('./app/routes/recordRoutes'),
  management: require('./app/routes/managementRoutes'),
  replay: require('./app/routes/replayRoutes')
};

// Import dependencies
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./app/swagger/swagger-output.json');
const db = require('./app/db/db');

class Server {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupSwagger();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(compression());
    this.app.use(cors(CONFIG.CORS_OPTIONS));
  }

  setupSwagger() {
    this.app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));
  }

  setupRoutes() {
    Object.entries(routes).forEach(([path, router]) => {
      this.app.use(`/${path}`, router);
    });
  }

  async start() {
    try {
      await db.testConnection();
      this.app.listen(CONFIG.PORT, () => {
        console.log(`Server is running on ${CONFIG.HOST}:${CONFIG.PORT}🚀`);
      });
    } catch (error) {
      console.error('Database connection error:', error);
      process.exit(1);
    }
  }
}

// Initialize and start server
const server = new Server();
server.start();