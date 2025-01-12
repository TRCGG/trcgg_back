/**
 * 서비스 관리용 Service
 */
const managementMapper = require('../db/mapper/managementMapper');

const getSubAccountName = async (guild_id) => {
  return await managementMapper.getSubAccountName(guild_id);
};

const postSubAccountName = async (sub_account_name, riot_name, guild_id) => {
  return await managementMapper.postSubAccountName(sub_account_name, riot_name, guild_id);
};

const putSubAccountName = async (riot_name, sub_account_name, guild_id) => {
  return await managementMapper.putSubAccountName(riot_name, sub_account_name, guild_id);
};

const deleteSubAccountName = async (riot_name, guild_id) => {
  return await managementMapper.deleteSubAccountName(riot_name, guild_id);
};

const getDuplicateReplay = async (game_id, guild_id) => {
  return await managementMapper.getDuplicateReplay(game_id, guild_id);
};

const getGuild = async (guild_id) => {
  return await managementMapper.getGuild(guild_id);
};

const postGuild = async (guild_name, guild_id) => {
  return await managementMapper.postGuild(guild_name, guild_id);
};

const postRecord = async (records) => {
  return await managementMapper.postRecord(records);
};

const deleteRecord = async (game_id, guild_id) => {
  return await managementMapper.deleteRecord(game_id, guild_id);
};

const putUserDeleteYN = async (delete_yn, riot_name, guild_id) => {
  return await managementMapper.putUserDeleteYN(delete_yn, riot_name, guild_id);
};

const putUserSubAccountDeleteYN = async (delete_yn, riot_name, guild_id) => {
  return await managementMapper.putUserSubAccountDeleteYN(delete_yn, riot_name, guild_id);
};

const putName = async (new_name, old_name, guild_id) => {
  return await managementMapper.putName(new_name, old_name, guild_id);
};

module.exports = {
  getSubAccountName,
  postSubAccountName,
  putSubAccountName,
  deleteSubAccountName,
  getDuplicateReplay,
  getGuild,
  postGuild,
  postRecord,
  deleteRecord,
  putUserDeleteYN,
  putUserSubAccountDeleteYN,
  putName,
}; 