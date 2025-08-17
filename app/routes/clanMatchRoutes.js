const BaseRouter = require("./core/baseRouter");
const ClanMatchService = require("../services/clanMatchService");

/**
 * clan match routes 
 */
class ClanMatchRoutes extends BaseRouter {
  initializeRoutes() {
    this.router.get("/", this.handle(this.getClanMatch));
    this.router.get("/count", this.handle(this.getClanMatchCount));
    this.router.post("/", this.handle(this.postClanMatch));
    this.router.delete("/", this.handle(this.deleteClanMatch));
  }

  async getClanMatch(req) {
    const { game_type, our_clan_role_id, opponent_clan_role_id = null } = req.query;
    const gameTypes = Array.isArray(game_type) 
      ? game_type
      : game_type?.split(',').map((v) => Number(v.trim()));
      
    return await ClanMatchService.getClanMatch(gameTypes, our_clan_role_id, opponent_clan_role_id);
  }

  async getClanMatchCount(req) {
    const { our_clan_role_id, opponent_clan_role_id } = req.query;
    if (!our_clan_role_id || !opponent_clan_role_id) {
      throw new Error("클랜 역할 ID는 필수입니다.");
    }
    return await ClanMatchService.getClanMatchCount(our_clan_role_id, opponent_clan_role_id);
  }

  async postClanMatch(req) {
    const params = req.body;
    return await ClanMatchService.postClanMatch(params);
  }

  async deleteClanMatch(req) {
    const { file_name } = req.query;
    return await ClanMatchService.deleteClanMatch(file_name);
  }

}

module.exports = ClanMatchRoutes;