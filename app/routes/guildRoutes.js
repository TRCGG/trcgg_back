const BaseRouter = require("./core/baseRouter");
const guildService = require("../services/guildService");

/**
 * guild Routes
 */

class guildRoutes extends BaseRouter {
  initializeRoutes() {
    this.router.post("/", this.handle(this.postGuild));
    this.router.delete("/:guild_id", this.handle(this.deleteGuild));
		this.router.put("/lang", this.handle(this.putGuildLang));
  }
  /**
   * @param {*} req
   * @description 길드 등록
   * @returns
   */
  async postGuild(req) {
    const params = req.body;
    return await guildService.postGuild(params);
  }

	/**
	 * @param {*} req
	 * @description 길드 언어 설정
	 * @returns
	 */
	async putGuildLang(req) {
		const { lan_id, guild_id } = req.body;
		return await guildService.putGuildLang(lan_id, guild_id);
	}

  /**
   * @param {*} req
   * @description 길드 삭제
   * @returns
   */
  async deleteGuild(req) {
    const { guild_id } = req.params;
    return await guildService.deleteGuild(guild_id);
  }
}

module.exports = guildRoutes;