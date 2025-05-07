const BaseRouter = require("./core/baseRouter");
const ChampionShipService = require("../services/championShipService");

/**
 * championship routes
 */
class ChampionShipRoutes extends BaseRouter {

  initializeRoutes() {
    this.router.post("/:guild_id", this.handle(this.saveChampionShipReplay));
  }

  /**
   * 
   * @param {*} req 
   * @description 대회 리플레이 저장
   * @returns 
   */
  async saveChampionShipReplay(req) {
    const { fileUrl, fileName, createUser, gameType } = req.body;
    const { guild_id } = req.params;
    return await ChampionShipService.save(fileUrl, fileName, createUser, guild_id, gameType);
  }
}

module.exports = ChampionShipRoutes;