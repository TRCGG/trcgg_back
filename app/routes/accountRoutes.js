const BaseRouter = require("./core/baseRouter");
const AccountService = require("../services/accountService");

/**
 * account(player) routes
 */
class AccountRoutes extends BaseRouter {

  initializeRoutes() {
    this.router.get("/search/:riot_name/:guild_id", this.handle(this.searchAccount));
  }

  /**
   * @param {Object} req - riot_name/riot_name_tag/guild_id
   * @description 전적 검색용 계정 조회
   * @returns {Promise<Object>} account object or string
   */
  async searchAccount(req) {
    const { riot_name, guild_id } = req.params;
    const { riot_name_tag = null } = req.query;
    const accountService = new AccountService();
    return await accountService.search(riot_name, riot_name_tag, guild_id);
  }
}

module.exports = AccountRoutes;