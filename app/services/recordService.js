/**
 * 전적 Service
 */
const recordMapper = require('../db/mapper/recordMapper');

const getAllRecord = async (riot_name, guild_id) => {
  return await recordMapper.getAllRecord(riot_name, guild_id);
};

const getRecentMonthRecord = async (riot_name, guild_id) => {
  return await recordMapper.getRecentMonthRecord(riot_name, guild_id);
};

const getStatisticOfGame = async (guild_id, year, month) => {
  return await recordMapper.getStatisticOfGame(guild_id, year, month);
};

const getSynergisticTeammates = async (riot_name, guild_id) => {
  return await recordMapper.getSynergisticTeammates(riot_name, guild_id);
};

const getNemesis = async (riot_name, guild_id) => {
  return await recordMapper.getNemesis(riot_name, guild_id);
};

const getWinRateByPosition = async (riot_name, guild_id) => {
  return await recordMapper.getWinRateByPosition(riot_name, guild_id);
};

const getRecordByGame = async (guild_id) => {
  return await recordMapper.getRecordByGame(guild_id);
};

const getRecentTenGamesByRiotName = async (riot_name, guild_id) => {
  return await recordMapper.getRecentTenGamesByRiotName(riot_name, guild_id);
};

module.exports = {
  getAllRecord,
  getRecentMonthRecord,
  getStatisticOfGame,
  getSynergisticTeammates,
  getNemesis,
  getWinRateByPosition,
  getRecordByGame,
  getRecentTenGamesByRiotName,
}; 