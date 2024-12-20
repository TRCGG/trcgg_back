/**
 * 전적 Service
 */
const recordMapper = require('../db/mapper/recordMapper');

const getAllRecord = async (guild_id) => {
  return await recordMapper.getAllRecord(guild_id);
};

const getRecentMonthRecord = async (guild_id) => {
  return await recordMapper.getRecentMonthRecord(guild_id);
};

const getStatisticOfGame = async (guild_id, year, month) => {
  return await recordMapper.getStatisticOfGame(guild_id, year, month);
};

const getSynergisticTeammates = async (guild_id) => {
  return await recordMapper.getSynergisticTeammates(guild_id);
};

const getNemesis = async (guild_id) => {
  return await recordMapper.getNemesis(guild_id);
};

const getWinRateByPosition = async (guild_id) => {
  return await recordMapper.getWinRateByPosition(guild_id);
};

const getRecordByGame = async (guild_id) => {
  return await recordMapper.getRecordByGame(guild_id);
};

const getRecentTenGamesByRiotName = async (guild_id, riot_name) => {
  return await recordMapper.getRecentTenGamesByRiotName(guild_id, riot_name);
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