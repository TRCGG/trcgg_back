const BaseRouter = require('./core/baseRouter');
const dAuthService = require('../services/discordAuthService');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * discord oauth2 routes
 */
class AuthRoutes extends BaseRouter {
  initializeRoutes() {
    this.router.get("/login", (req, res) => this.handle(dAuthService.login(req, res)));
    this.router.get("/callback", (req, res) => this.handle(dAuthService.callback(req, res)));
    this.router.get("/logout", (req, res) => this.handle(dAuthService.logout(req, res)));

    this.router.get("/me", authMiddleware, (req, res) => this.handle(dAuthService.getMe(req, res)));
    this.router.get("/guilds", authMiddleware, (req, res) => this.handle(dAuthService.getGuilds(req, res)));

  }
}
module.exports = AuthRoutes;