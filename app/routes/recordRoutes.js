const BaseRouter = require("./core/baseRouter");
const RecordService = require("../services/recordService");
const RecordServiceEmbed = require("../services/recordServiceEmbed");

/**
 * 전적 검색 routes
 */
class RecordRoutes extends BaseRouter {

  initializeRoutes() {
    this.router.get("/all/:riot_name/:guild_id", this.handle(this.getAllRecords));
    this.router.get("/recent/:riot_name/:guild_id", this.handle(this.getRecentGames));
    this.router.get("/result/:game_id/:guild_id", this.handle(this.getGameResult));
    this.router.get("/all/embed/:riot_name/:guild_id", this.handle(this.getAllRecordsEmbed));
    this.router.get("/master/embed/:champ_name/:guild_id", this.handle(this.getMasterOfChampion));
    this.router.get("/champstat/embed/:year/:month/:guild_id", this.handle(this.getChampionStats));
    this.router.get("/gamestat/embed/:year/:month/:guild_id", this.handle(this.getGameStats));
    this.router.get("/linestat/embed/:position/:guild_id", this.handle(this.getLineStats));
    this.router.get("/result/embed/:game_id/:guild_id", this.handle(this.getGameResultEmbed));
    this.router.get("/recent/embed/:riot_name/:guild_id", this.handle(this.getRecentGamesEmbed));
    this.router.get("/clanstat/embed/:year/:month/:guild_id", this.handle(this.getClanStats));
  }

  /**
   * @param {Object} req - The request object.
   * @description !전적 조회에 필요한 모든 데이터 조회
   * @returns {Promise<Object>} The game records.
   */
  async getAllRecords(req) {
    const { riot_name, guild_id } = req.params;
    const { riot_name_tag = null } = req.query;
    return await RecordService.getAllRecord(riot_name, riot_name_tag, guild_id);
  }

  /**
   * @param {Object} req - The request object.
   * @description !최근 게임 조회
   * @returns {Promise<Object>} The recent game records.
   */
  async getRecentGames(req) {
    const { riot_name, guild_id } = req.params;
    const { riot_name_tag = null } = req.query;
    return await RecordService.getRecentGamesByRiotName(riot_name, riot_name_tag, guild_id);
  }

/**
 * @param {*} req 
 * @description !결과 조회
 * @returns 
 */
  async getGameResult(req) {
    const { game_id, guild_id } = req.params;
    return await RecordService.getRecordByGame(game_id, guild_id);
  }

  /**
   * @param {Object} req - The request object.
   * @description !전적 조회 Embed
   * @returns {Promise<Object>} The embedded game records.
   */
  async getAllRecordsEmbed(req) {
    const { riot_name, guild_id } = req.params;
    const { riot_name_tag = null } = req.query;
    return await RecordServiceEmbed.getAllRecordEmbed(riot_name, riot_name_tag, guild_id);
  }

  /**
   * @param {Object} req - The request object.
   * @description !장인 Embed
   * @returns {Promise<Object>} The master player information.
   */
  async getMasterOfChampion(req) {
    const { champ_name, guild_id } = req.params;
    return await RecordServiceEmbed.getMasterOfChampionEmbed(champ_name, guild_id);
  }

  /**
   * @param {Object} req - The request object.
   * @description !통계 챔프 Embed
   * @returns {Promise<Object>} The champion statistics.
   */
  async getChampionStats(req) {
    const { year, month, guild_id } = req.params;
    return await RecordServiceEmbed.getStatisticOfChampionEmbed(guild_id, year, month);
  }

  /**
   * @param {Object} req - The request object.
   * @description !통계 게임 Embed
   * @returns {Promise<Object>} The game statistics.
   */
  async getGameStats(req) {
    const { year, month, guild_id } = req.params;
    return await RecordServiceEmbed.getStatisticOfGameEmbed(guild_id, year, month);
  }

  /**
   * @param {Object} req - The request object.
   * @description !라인 {탑/정글/미드/원딜/서폿} Embed
   * @returns {Promise<Object>} The lane statistics.
   */
  async getLineStats(req) {
    const { position, guild_id } = req.params;
    return await RecordServiceEmbed.getWinRateByPositionEmbed(position, guild_id);
  }

  /**
   * @param {Object} req - The request object.
   * @description !결과 Embed
   * @returns {Promise<Object>} The game results.
   */
  async getGameResultEmbed(req) {
    const { game_id, guild_id } = req.params;
    return await RecordServiceEmbed.getRecordByGameEmbed(game_id, guild_id);
  }

  /**
   * @param {Object} req - The request object.
   * @description !최근전적 Embed
   * @returns {Promise<Object>} The recent game records in an embed format.
   */
  async getRecentGamesEmbed(req) {
    const { riot_name, guild_id } = req.params;
    const { riot_name_tag = null } = req.query;
    return await RecordServiceEmbed.getRecentGamesByRiotNameEmbed(riot_name, riot_name_tag, guild_id);
  }

  /**
   * @param {Object} req - The request object.
   * @description !클랜통계 Embed
   * @returns {Promise<Object>} The clan statistics.
   */
  async getClanStats(req) {
    const { year, month, guild_id } = req.params;
    return await RecordServiceEmbed.getStatisticOfGameAllMemberEmbed(guild_id, year, month);
  }
}

module.exports = RecordRoutes;
