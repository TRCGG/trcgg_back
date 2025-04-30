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
    return async (req, res, next) => {
      try {
        // Decode guild_id from base64 if it exists in the params
        if (req.params.guild_id) {
          try {
            req.params.guild_id = Buffer.from(req.params.guild_id, 'base64').toString('utf8');
        } catch (decodeError) {
            console.warn('⚠️ guild_id 디코딩 실패:', decodeError.message);
            return res.badRequest('Invalid guild_id encoding');
            // return res.status(400).json({ error: 'Invalid guild_id encoding' });
          }
        }
        const result = await handler(req);
        // res.json(result);
        res.success(result);
      } catch (error) {
        if(error.statusCode === 400) return res.badRequest(error.message);
        if(error.statusCode === 401) return res.unauthorized(error.message);
        if(error.statusCode === 403) return res.notFound(error.message);
        if(error.statusCode === 404) return res.error(error.message, 404);
        return res.internalError(error.message);
      }
    };
  }
}

module.exports = BaseRouter;
