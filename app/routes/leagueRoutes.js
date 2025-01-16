const express = require("express");
const router = express.Router();
const managementService = require("../services/managementService");
const replayParsingService = require("../services/replayParsingService");
const recordService = require("../services/recordService");
const championService = require("../services/championService");

// 전적 조회에 필요한 서비스들
// 전체 전적 조회
router.get("/getAllRecord/:riot_name/:guild_id", async (req, res) => {
  const { riot_name, guild_id } = req.params;
  try {
    const data = recordService.getAllRecord(riot_name, guild_id);
    res.json(data);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// 라인별 전적 조회
router.get("/getLineRecord/:riot_name/:guild_id", async (req, res) => {
  const { riot_name, guild_id } = req.params;
  try {
    const game = await recordService.getLineRecord(riot_name, guild_id);
    res.json(game);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// 최근 한 달 전적 조회
router.get("/getRecordMonth/:riot_name/:guild_id", async (req, res) => {
  const { riot_name, guild_id } = req.params;
  try {
    const game = await recordService.getRecentMonthRecord(riot_name, guild_id);
    res.json(game);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// 모스트 픽 조회
router.get("/getMostPick/:riot_name/:guild_id", async (req, res) => {
  const { riot_name, guild_id } = req.params;
  try {
    const game = await championService.getMostPicks(riot_name, guild_id);
    res.json(game);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// 최근 두 달간 같은 팀 시너지 조회
router.get("/getRecordWithTeam/:riot_name/:guild_id", async (req, res) => {
  const { riot_name, guild_id } = req.params;
  try {
    const game = await recordService.getSynergisticTeammates(
      riot_name,
      guild_id
    );
    res.json(game);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// 나와 인간상성 찾기
router.get("/getRecordOtherTeam/:riot_name/:guild_id", async (req, res) => {
  const { riot_name, guild_id } = req.params;
  try {
    const game = await recordService.getNemesis(riot_name, guild_id);
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
router.get("/champStats/:year/:month/:guild_id", async (req, res) => {
  const { year, month, guild_id } = req.params;
  try {
    const champ_stats = await championService.getStatisticOfChampion(
      guild_id,
      year,
      month
    );
    res.json(champ_stats);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// 특정 연도, 월의 게임 통계 조회
router.get("/gameStats/:year/:month/:guild_id", async (req, res) => {
  const { year, month, guild_id } = req.params;
  try {
    const game_stats = await recordService.getStatisticOfGame(
      guild_id,
      year,
      month
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

// 최근 Top 10 게임 조회
router.get("/getTopTen/:riot_name/:guild_id", async (req, res) => {
  const { riot_name, guild_id } = req.params;
  try {
    const game = await recordService.getRecentTenGamesByRiotName(
      riot_name,
      guild_id
    );
    res.json(game);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// 부캐 조회
router.get("/getMappingName/:guild_id", async (req, res) => {
  const { guild_id } = req.params;
  try {
    const result = await managementService.getSubAccountName(guild_id);
    res.json(result);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// 길드 조회
router.get("/getGuild/:guild_id", async (req, res) => {
  const { guild_id } = req.params;
  try {
    const result = await managementService.getGuild(guild_id);
    res.json(result);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// Post =====================

// 리플레이 저장
router.post("/parse", async (req, res) => {
  const { file_url, file_name, create_user, guild_id } = req.body;
  try {
    const result = await replayParsingService.save(
      file_url,
      file_name,
      create_user,
      guild_id
    );
    res.json(result);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// 부캐 저장
router.post("/mapping", async (req, res) => {
  const { sub_name, main_name, guild_id } = req.body;
  try {
    const result = await managementService.postSubAccountName(
      sub_name,
      main_name,
      guild_id
    );
    res.json(result);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// 길드 저장
router.post("/saveGuild", async (req, res) => {
  const { guild_id, guild_name } = req.body;
  try {
    const result = await managementService.postGuild(guild_id, guild_name);
    res.json(result);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// PUT =====================

// 클랜원 탈퇴/복귀 처리
router.put("/deleteYn", async (req, res) => {
  const { delete_yn, riot_name, guild_id } = req.body;
  try {
    const result = await managementService.putUserDeleteYN(
      delete_yn,
      riot_name,
      guild_id
    );
    res.json(result);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// 클랜원 탈퇴/복귀처리(부계정)
router.put("/mapping/deleteYn", async (req, res) => {
  const { delete_yn, riot_name, guild_id } = req.body;
  try {
    const result = await managementService.putUserSubAccountDeleteYN(
      delete_yn,
      riot_name,
      guild_id
    );
    res.json(result);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// 닉네임변경
router.put("/riotName", async (req, res) => {
  const { new_name, old_name, guild_id } = req.body;
  try {
    const result = await managementService.putName(
      new_name,
      old_name,
      guild_id
    );
    res.json(result);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// 닉네임변경(부계정)
router.put("/mapping/riotName", async (req, res) => {
  const { new_name, old_name, guild_id } = req.body;
  try {
    const result = await managementService.putSubAccountName(
      new_name,
      old_name,
      guild_id
    );
    res.json(result);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// DELETE =====================

// 리플 삭제
router.delete("/game", async (req, res) => {
  const { game_id, guild_id } = req.body;
  try {
    const result = await managementService.deleteRecord(game_id, guild_id);
    res.json(result);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// 부캐 삭제
router.delete("/mapping/subName", async (req, res) => {
  const { riot_name, guild_id } = req.body;
  try {
    const result = await managementService.deleteSubAccountName(
      riot_name,
      guild_id
    );
    res.json(result);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

module.exports = router;
