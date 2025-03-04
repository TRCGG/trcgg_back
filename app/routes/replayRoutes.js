const express = require("express");
const router = express.Router();
const ReplayService = require("../services/replayService");

/**
 * 리플레이 파싱 관련 라우터
 */

/**
 * @param {String} fileUrl
 * @param {String} fileName
 * @param {String} createUser
 * @param {String} guildId
 * @description 리플레이 저장
 * @returns {String} message
 */
router.post("/:guild_id", async (req, res) => {
  const { fileUrl, fileName, createUser } = req.body;
  const { guild_id } = req.params;
  try {
    const result = await ReplayService.save(fileUrl, fileName, createUser, guild_id);
    res.json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// DELETE =====================

/**
 * @param {String} game_id
 * @param {String} guild_id
 * @description !drop 리플 삭제
 * @returns {String} message
 */
router.delete("/:game_id/:guild_id", async (req, res) => {
  const { game_id, guild_id } = req.params;
  try {
    const result = await ReplayService.deleteRecord(game_id, guild_id);
    res.json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
