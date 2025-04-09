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
        // Decode guild_id from base64 if it exists in the params
        if (req.params.guild_id) {
          try {
            req.params.guild_id = Buffer.from(req.params.guild_id, 'base64').toString('utf8');
        } catch (decodeError) {
            console.warn('⚠️ guild_id 디코딩 실패:', decodeError.message);
            return res.status(400).json({ error: 'Invalid guild_id encoding' });
          }
        }
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
