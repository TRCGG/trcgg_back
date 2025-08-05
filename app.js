/**
 * Express Server Configuration
 */
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const RouterFactory = require('./app/routes/core/routerFactory');
const responseInterceptor = require('./app/middlewares/responseInterceptor');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Constants
const CONFIG = {
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || 'localhost',
  CORS_OPTIONS: {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: '*'
  }
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
    this.setupResponseInterceptor();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(compression());
    this.app.use(cors(CONFIG.CORS_OPTIONS));
    this.app.use(responseInterceptor);
  }

  setupSwagger() {
    this.app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));
  }

  setupRoutes() {
    const routers = ["account", "record", "management", "replay", "event", "guild", "championShip", "auth"];
    routers.forEach((type) => {
      const routerInstance = RouterFactory.createRouter(type);
      this.app.use(`/${type}`, routerInstance.router); // router 속성을 사용해야 함
    });
  }

  // 맨 마지막으로 정의해야 함
  setupResponseInterceptor() {
    this.app.use((err, req, res, next) => {
      console.error(err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
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