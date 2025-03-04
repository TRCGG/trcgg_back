/**
 * 전적 검색 route
 */

const express = require("express");
const router = express.Router();
const RecordService = require("../services/recordService");
const RecordServiceEmbed = require("../services/recordServiceEmbed");

/**
 * @param {String} riot_name 
 * @param {String} riot_name_tag not required
 * @param {String} guild_id 
 * @description !전적 조회에 필요한 모든 데이터 조회
 */
router.get("/all/:riot_name/:guild_id", async (req, res) => {
  const { riot_name, guild_id } = req.params;
  const { riot_name_tag = null } = req.query;
  try {
    const result = await RecordService.getAllRecord(riot_name, riot_name_tag, guild_id);
    res.json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * @param {String} riot_name
 * @param {String} riot_name_tag not required
 * @param {String} guild_id
 * @description !최근 게임 조회
 */ 
router.get("/recent/:riot_name/:guild_id", async (req, res) => {
  const { riot_name, guild_id } = req.params;
  const { riot_name_tag = null } = req.query;
  try {
    const result = await RecordService.getRecentGamesByRiotName(riot_name, riot_name_tag, guild_id);
    res.json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * @param {String} riot_name 
 * @param {String} riot_name_tag not required
 * @param {String} guild_id 
 * @description !전적 조회 Embed
 * @returns
 */
router.get("/all/embed/:riot_name/:guild_id", async (req, res) => {
  const { riot_name, guild_id } = req.params;
  const { riot_name_tag = null } = req.query;
  try {
    const account = await RecordServiceEmbed.getAllRecordEmbed(riot_name, riot_name_tag, guild_id);
    res.json(account);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * @param champ_name
 * @param guild_id
 * @description !장인 Embed
 * @returns
 */
router.get("/master/embed/:champ_name/:guild_id", async (req, res) => {
  const { champ_name, guild_id } = req.params;
  try {
    const master_info = await RecordServiceEmbed.getMasterOfChampionEmbed(
      champ_name,
      guild_id
    );
    res.json(master_info);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * @param year
 * @param month
 * @param guild_id
 * @description !통계 챔프 Embed
 * @returns
 */
router.get("/champstat/embed/:year/:month/:guild_id", async (req, res) => {
  const { year, month, guild_id } = req.params;
  try {
    const champ_stats = await RecordServiceEmbed.getStatisticOfChampionEmbed(
      guild_id,
      year,
      month
    );
    res.json(champ_stats);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * @param year
 * @param month
 * @param guild_id
 * @description !통계 게임 Embed
 * @returns
 */
router.get("/gamestat/embed/:year/:month/:guild_id", async (req, res) => {
  const { year, month, guild_id } = req.params;
  try {
    const game_stats = await RecordServiceEmbed.getStatisticOfGameEmbed(
      guild_id,
      year,
      month
    );
    res.json(game_stats);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * @param position
 * @param guild_id
 * @description !라인 {탑/정글/미드/원딜/서폿} Embed
 * @returns
 */
router.get("/linestat/embed/:position/:guild_id", async (req, res) => {
  const { position, guild_id } = req.params;
  try {
    const line_stats = await RecordServiceEmbed.getWinRateByPositionEmbed(
      position,
      guild_id
    );
    res.json(line_stats);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * @param game_id
 * @param guild_id
 * @description !결과 Embed
 * @returns
 */
router.get("/result/embed/:game_id/:guild_id", async (req, res) => {
  const { game_id, guild_id } = req.params;
  try {
    const game_result = await RecordServiceEmbed.getRecordByGameEmbed(game_id, guild_id);
    res.json(game_result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * @param riot_name
 * @param riot_name_tag not required
 * @param guild_id
 * @description !최근전적 Embed
 * @returns
 */
router.get("/recent/embed/:riot_name/:guild_id", async (req, res) => {
  const { riot_name, guild_id } = req.params;
  const { riot_name_tag = null } = req.query;
  try {
    const game = await RecordServiceEmbed.getRecentGamesByRiotNameEmbed(
      riot_name,
      riot_name_tag,
      guild_id
    );
    res.json(game);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * @param year
 * @param month
 * @param guild_id
 * @description !클랜통계 Embed
 * @returns
 */
router.get("/clanstat/embed/:year/:month/:guild_id", async (req, res ) => {
  const { year, month, guild_id } = req.params;
  try {
    const clan_stat = await RecordServiceEmbed.getStatisticOfGameAllMemberEmbed(
      guild_id, year, month
    );
    res.json(clan_stat);
  } catch (error) {
    res.status(500).send(error.message);
  }
})

module.exports = router;
