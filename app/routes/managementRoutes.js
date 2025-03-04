const express = require("express");
const router = express.Router();
const ManagementService = require("../services/managementService");

/**
 * management 라우터 
 */

/**
 * @description !설명
 * @returns embed 
 */
router.get("/doc", async (req, res) => {
  try {
    const embed = await ManagementService.getDocEmbed();
    res.json(embed);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * @param {String} guild_id
 * @description !부캐목록
 * @returns {Object} Embed 형식 Json
 */
router.get("/sublist/:guild_id", async (req, res) => {
  const { guild_id } = req.params;
  try {
    const accounts = await ManagementService.getSubAccountListEmbed(guild_id);
    res.json(accounts);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Post =====================

/**
 * @param {String} sub_name 부캐 닉네임
 * @param {String} sub_name_tag 부캐 태그
 * @param {String} main_name 본캐 닉네임
 * @param {String} main_name_tag 본캐 태그
 * @param {String} guild_id 길드 ID
 * @description !부캐저장
 * @returns {string} message
 */
router.post("/subaccount/:guild_id", async (req, res) => {
  const { guild_id } = req.params;
  const { sub_name, sub_name_tag, main_name, main_name_tag } = req.body;
  try {
    const result = await ManagementService.postSubAccount(sub_name, sub_name_tag, main_name, main_name_tag, guild_id);
    res.json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// PUT =====================

/**
 * @param {String} sub_name 부캐 닉네임
 * @param {String} sub_name_tag 부캐 태그
 * @param {String} guild_id
 * @description !부캐삭제
 * @returns {String} message
 */
router.put("/subaccount/:guild_id", async (req, res) => {
  const { guild_id } = req.params;
  const { sub_name, sub_name_tag } = req.body;
  try {
    const result = await ManagementService.putSubAccount(sub_name, sub_name_tag, guild_id);
    res.json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * @param {String} delete_yn (Y/N)
 * @param {String} riot_name 라이엇 닉네임 
 * @param {String} riot_name_tag 라이엇 태그
 * @param {String} guild_id 길드 ID
 * @description !탈퇴, !복귀
 * @returns {String} message
 */
router.put("/accountstatus/:guild_id", async (req, res) => {
  const { guild_id } = req.params;
  const { delete_yn, riot_name, riot_name_tag } = req.body;
  try {
    const result = await ManagementService.putAccountDeleteYn(delete_yn, riot_name, riot_name_tag, guild_id);
    res.json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * @param {String} old_name 기존 닉네임
 * @param {String} old_name_tag 기존 태그
 * @param {String} new_name 새 닉네임
 * @param {String} new_name_tag 새 태그
 * @param {String} guild_id 길드 ID
 * @description !닉변
 * @returns {String} message
 */
router.put("/accountname/:guild_id", async (req, res) => {
  const { guild_id } = req.params;
  const { old_name, old_name_tag, new_name, new_name_tag } = req.body;
  try {
    const result = await ManagementService.putAccountName(old_name, old_name_tag, new_name, new_name_tag, guild_id);
    res.json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
