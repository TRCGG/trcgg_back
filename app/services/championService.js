/**
 * 챔피언 관련 Service
 */
const championMapper = require('../db/mapper/championMapper');

const getMostPicks = async (riot_name, guild_id) => {
  return await championMapper.getMostPicks(riot_name, guild_id);
};

const getMasterOfChampion = async (champ_name, guild_id) => {
  return await championMapper.getMasterOfChampion(champ_name, guild_id);
};

const getStatisticOfChampion = async (guild_id, year, month) => {
  return await championMapper.getStatisticOfChampion(guild_id, year, month);
};

module.exports = {
  getMostPicks,
  getMasterOfChampion,
  getStatisticOfChampion,
}; 