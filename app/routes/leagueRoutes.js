const express = require("express");
const router = express.Router();
const recordService = require("../services/recordService");
const championService = require("../services/championService");

// TO-DO: route 전체 수정, 검토 필요

// 계정 조회
router.get("/getAccount/:riot_name/:guild_id", async (req, res) => {
  const { riot_name, guild_id } = req.params;
  const { riot_name_tag = null } = req.query;
  try {
    const account = await recordService.getPlayerForSearch(riot_name, riot_name_tag, guild_id);
    res.json(account);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// 전적 조회에 필요한 서비스들
// 전체 전적 조회
router.get("/getAllRecord/:riot_name/:riot_name_tag/:guild_id", async (req, res) => {
  const { riot_name, riot_name_tag, guild_id } = req.params;
  try {
    const data = await recordService.getAllRecord(riot_name, riot_name_tag, guild_id);
    res.json(data);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// 라인별 전적 조회
router.get("/getLineRecord/:riot_name/:riot_name_tag/:guild_id", async (req, res) => {
  const { riot_name, riot_name_tag, guild_id } = req.params;
  try {
    const game = await recordService.getLineRecord(riot_name, riot_name_tag, guild_id, guild_id);
    res.json(game);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// 최근 한 달 전적 조회
router.get("/getRecordMonth/:riot_name/:riot_name_tag/:guild_id", async (req, res) => {
  const { riot_name, riot_name_tag, guild_id } = req.params;
  try {
    const game = await recordService.getRecentMonthRecord(riot_name, riot_name_tag, guild_id);
    res.json(game);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// 모스트 픽 조회
router.get("/getMostPick/:riot_name/:riot_name_tag/:guild_id", async (req, res) => {
  const { riot_name, riot_name_tag, guild_id } = req.params;
  try {
    const game = await championService.getMostPicks(riot_name, riot_name_tag, guild_id);
    res.json(game);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// 최근 두 달간 같은 팀 시너지 조회
router.get("/getRecordWithTeam/:riot_name/:riot_name_tag/:guild_id", async (req, res) => {
  const { riot_name, riot_name_tag, guild_id } = req.params;
  try {
    const game = await recordService.getSynergisticTeammates(
      riot_name,
      riot_name_tag,
      guild_id
    );
    res.json(game);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// 나와 인간상성 찾기
router.get("/getRecordOtherTeam/:riot_name/:riot_name_tag/:guild_id", async (req, res) => {
  const { riot_name, riot_name_tag, guild_id } = req.params;
  try {
    const game = await recordService.getNemesis(riot_name, riot_name_tag, guild_id);
    res.json(game);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// 특정 챔프 장인 조회
router.get("/master/:champ_name/:guild_id", async (req, res) => {
  const { champ_name, guild_id } = req.params;
  try {
    const master_info = await championService.getMasterOfChampion(
      champ_name,
      guild_id
    );
    res.json(master_info);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// 특정 연도, 월의 챔프 통계 조회
router.get("/champStats/:type/:date/:guild_id", async (req, res) => {
  const { type, date, guild_id } = req.params;
  try {
    const champ_stats = await championService.getStatisticOfChampion(
      guild_id,
      type,
      date
    );
    res.json(champ_stats);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// 특정 연도, 월의 게임 통계 조회
router.get("/gameStats/:type/:date/:guild_id", async (req, res) => {
  const { type, date, guild_id } = req.params;
  try {
    const game_stats = await recordService.getStatisticOfGame(
      guild_id,
      type,
      date
    );
    res.json(game_stats);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// 라인별 승률 조회
router.get("/lineStats/:position/:guild_id", async (req, res) => {
  const { position, guild_id } = req.params;
  try {
    const line_stats = await recordService.getWinRateByPosition(
      position,
      guild_id
    );
    res.json(line_stats);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// 게임 결과 조회 (game_id로)
router.get("/gameResult/:game_id/:guild_id", async (req, res) => {
  const { game_id, guild_id } = req.params;
  try {
    const game_result = await recordService.getRecordByGame(game_id, guild_id);
    res.json(game_result);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// 최근 20 게임 조회
router.get("/getRecentGames/:riot_name/:riot_name_tag/:guild_id", async (req, res) => {
  const { riot_name, riot_name_tag, guild_id } = req.params;
  try {
    const game = await recordService.getRecentGamesByRiotName(
      riot_name,
      riot_name_tag,
      guild_id
    );
    res.json(game);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// // 길드 조회
// router.get("/getGuild/:guild_id", async (req, res) => {
//   const { guild_id } = req.params;
//   try {
//     const result = await managementService.getGuild(guild_id);
//     res.json(result);
//   } catch (error) {
//     res.status(404).send(error.message);
//   }
// });

// Post =====================

// PUT =====================

// DELETE =====================

module.exports = router;
