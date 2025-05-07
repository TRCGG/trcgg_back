const BaseRouter = require("./core/baseRouter");
const ReplayService = require("../services/replayService");

/**
 * replay routes
 */
class ReplayRoutes extends BaseRouter {
  initializeRoutes() {
    this.router.post("/:guild_id", this.handle(this.saveReplay));
    this.router.delete("/:game_id/:guild_id", this.handle(this.deleteReplay));
  }

  /**
   * @param {Object} req - The request object.
   * @returns {Promise<Object>} message
   * @description 리플레이 저장
   */
  async saveReplay(req) {
    const { fileUrl, fileName, createUser, game_type } = req.body;
    const { guild_id } = req.params;
    return await ReplayService.save(fileUrl, fileName, createUser, guild_id, game_type);
  }

  /**
   * @param {Object} req - The request object.
   * @returns {Promise<Object>} message
   * @description !drop 리플 삭제
   */
  async deleteReplay(req) {
    const { game_id, guild_id } = req.params;
    return await ReplayService.deleteRecord(game_id, guild_id);
  }
}

module.exports = ReplayRoutes;
