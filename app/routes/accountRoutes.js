/**
 * 계정 라우트
 */
const express = require("express");
const router = express.Router();
const AccountService = require("../services/accountService");

/**
 * @param {String} riot_name 
 * @param {String} riot_name_tag not required
 * @param {String} guild_id 
 * @description 전적 검색용 계정 조회
 * @returns Object null일 경우 String
 */
router.get("/search/:riot_name/:guild_id", async (req, res) => {
  const { riot_name, guild_id } = req.params;
  const { riot_name_tag = null } = req.query;
  try {
    const accountService = new AccountService();
    const account = await accountService.getPlayerForSearch(riot_name, riot_name_tag, guild_id);
    res.json(account);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
