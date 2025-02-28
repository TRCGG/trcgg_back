/**
 * 클랜관리 service
 */

/**
 * 디스코드 길드 조회
 * @param {*} guild_id 
 * @returns 
 */
const getGuild = async (guild_id) => {
  return await managementMapper.getGuild(guild_id);
};

/**
 * 디스코드 길드 등록
 * @param {*} guild_name 
 * @param {*} guild_id 
 * @returns 
 */
const postGuild = async (guild_name, guild_id) => {
  return await managementMapper.postGuild(guild_name, guild_id);
};

module.exports = {
  getGuild,
  postGuild,
};