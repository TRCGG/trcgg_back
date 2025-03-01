/**
 * 전적 검색 Service
 */

const recordMapper = require("../db/mapper/recordMapper");
const utils = require("../utils");

/**
 * !전적 조회에 필요한 모든 데이터 조회
 * @param {*} riot_name 
 * @param {*} riot_name_tag 
 * @param {*} guild_id 
 */
const getAllRecord = async (riot_name, riot_name_tag, guild_id) => {
	const allData = {
    record_data: await recordMapper.getLineRecord(riot_name, riot_name_tag, guild_id),
    month_data: await recordMapper.getRecentMonthRecord(riot_name, riot_name_tag, guild_id),
    recent_data: await recordMapper.getRecentGamesByRiotName(
      riot_name,
      riot_name_tag,
      guild_id
    ),
    with_team_data: await recordMapper.getSynergisticTeammates(
      riot_name,
      riot_name_tag,
      guild_id
    ),
    other_team_data: await recordMapper.getNemesis(riot_name, riot_name_tag, guild_id),
    most_pick_data: await recordMapper.getMostPicks(riot_name, riot_name_tag, guild_id),
  };
	return allData;
};

/**
 * !통계 게임
 * @param {*} guild_id
 * @param {*} date
 * @returns
 */
const getStatisticOfGame = async (guild_id, date) => {
	const [year,month] = utils.splitDate(date);
  const records = await recordMapper.getStatisticOfGame(guild_id, year, month);
	return records;
};

/**
 * !클랜통계
 * @param {*} guild_id
 * @param {*} date
 * @returns
 */
const getStatisticOfGameAllMember = async (guild_id, date) => {
  const [year,month] = utils.splitDate(date);
  const records = await recordMapper.getStatisticOfGame(guild_id, year, month);
	return records;
}

/**
 * !라인
 * @param {*} position
 * @param {*} guild_Id
 * @returns
 */
const getWinRateByPosition = async (position, guild_id) => {
	const realPosition = utils.dictPosition(position);
	const records = await recordMapper.getWinRateByPosition(realPosition, guild_id);
	return records;
};

/**
 * !결과
 * @param {*} game_id
 * @param {*} guild_Id
 * @returns
 */
const getRecordByGame = async (game_id, guild_id) => {
	const records = await recordMapper.getRecordByGame(game_id, guild_id);
	return records;
};

/**
 * !최근전적
 * @param {*} riot_name
 * @param {*} riot_name_tag
 * @param {*} guild_Id
 * @returns
 */
const getRecentGamesByRiotName = async (riot_name, riot_name_tag, guild_id) => {
	const records = await recordMapper.getRecentGamesByRiotName(
    riot_name,
    riot_name_tag,
    guild_id
  );
	return records;
};

/**
 * !장인
 * @param {*} champ_name
 * @param {*} guild_Id
 * @returns
 */
const getMasterOfChampion = async (champ_name, guild_id) => {
  const records = await championMapper.getMasterOfChampion(
    champ_name,
    guild_id
  );
  return records;
};

/**
 * !통계 챔프
 * @param {*} guild_id
 * @param {*} date
 * @returns
 */
const getStatisticOfChampion = async (guild_id, date) => {
	const [year,month] = utils.splitDate(date);
	const records = await championMapper.getStatisticOfChampion(guild_id, year, month);
	return records;
};

module.exports = {
	getAllRecord,
	getStatisticOfGame,
	getStatisticOfGameAllMember,
	getWinRateByPosition,
	getRecordByGame,
	getRecentGamesByRiotName,
	getMasterOfChampion,
	getStatisticOfChampion,
};