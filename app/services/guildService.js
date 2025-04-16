const guildMapper = require('../db/mapper/guildMapper');

/**
 * 클랜관리 service
 */

/**
 * 디스코드 길드 등록
 * @param {*} params
 * @returns 
 */
const postGuild = async (params) => {
  return await guildMapper.postGuild(params);
};

/**
 * @param {*} lan_id 
 * @param {*} guild_id 
 * @description 길드 언어 설정
 * @returns 
 */
const putGuildLang = async (lan_id, guild_id) => {
  return await guildMapper.putGuildLang(lan_id, guild_id);
};

/**
 * 디스코드 길드 삭제
 * @param {*} guild_id 
 * @returns 
 */
const deleteGuild = async (guild_id) => {
  return await guildMapper.deleteGuild(guild_id);
};

module.exports = {
  postGuild,
  putGuildLang,
  deleteGuild,
};