const express = require('express');

/**
 * Routes 기본 구조
 */
class BaseRouter {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    // 하위 클래스에서 구현
  }

  handle(handler) {
    return async (req, res) => {
      try {
        const result = await handler(req);
        res.json(result);
      } catch (error) {
        res.status(error.status || 500).json({
          error: error.message
        });
      }
    };
  }
}

module.exports = BaseRouter;
