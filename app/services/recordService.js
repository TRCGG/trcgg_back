const recordMapper = require("../db/mapper/recordMapper");
const AccountService = require("./accountService");
const stringUtils = require("../utils/stringUtils");

/**
 * 전적 검색 Service
 */
class RecordService extends AccountService {
  constructor() {
    super();
  }

  /**
   * @param {String} riot_name 
   * @param {String} riot_name_tag 
   * @param {String} guild_id 
   * @description !전적 조회에 필요한 모든 데이터 조회
   * @returns
   */
  async getAllRecord(riot_name, riot_name_tag, guild_id) {
    const account = await this.search(riot_name, riot_name_tag, guild_id);
    if(typeof account === 'string') {
      return account;
    }
    if (account.length === 1) {
      riot_name = account[0].riot_name;
      riot_name_tag = account[0].riot_name_tag;
      const allData = {
        record_data: await recordMapper.getLineRecord(riot_name, riot_name_tag, guild_id),
        month_data: await recordMapper.getRecentMonthRecord(riot_name, riot_name_tag, guild_id),
        recent_data: await recordMapper.getRecentGamesByRiotName(riot_name, riot_name_tag, guild_id),
        with_team_data: await recordMapper.getSynergisticTeammates(riot_name, riot_name_tag, guild_id),
        other_team_data: await recordMapper.getNemesis(riot_name, riot_name_tag, guild_id),
        most_pick_data: await recordMapper.getMostPicks(riot_name, riot_name_tag, guild_id),
        player : account
      };
      return allData;
    } else {
      return account;
    }
  } 

  /**
   * @param {String} guild_id
   * @param {String} year
   * @param {String} month
   * @description !통계 게임
   * @returns
   */
  async getStatisticOfGame(guild_id, year, month) {
    const records = await recordMapper.getStatisticOfGame(guild_id, year, month);
    return records;
  }

  /**
   * @param {String} guild_id
   * @param {String} year
   * @param {String} month
   * @description !클랜통계
   * @returns
   */
  async getStatisticOfGameAllMember(guild_id, year, month) {
    const records = await recordMapper.getStatisticOfGame(guild_id, year, month);
    return records;
  }

  /**
   * @param {*} position
   * @param {*} guild_id
   * @description !라인
   * @returns
   */
  async getWinRateByPosition(position, guild_id) {
    const realPosition = stringUtils.dictPosition(position);
    const records = await recordMapper.getWinRateByPosition(realPosition, guild_id);
    return records;
  }

  /**
   * @param {*} game_id
   * @param {*} guild_id
   * @description !결과
   * @returns
   */
  async getRecordByGame(game_id, guild_id) {
    const record = await recordMapper.getRecordByGame(game_id, guild_id);
    return record;
  }

  /**
   * @param {*} riot_name
   * @param {*} riot_name_tag
   * @param {*} guild_id
   * @description !최근전적
   * @returns
   */
  async getRecentGamesByRiotName(riot_name, riot_name_tag, guild_id) {
    // 검색으로 계정 조회
    const account = await this.search(riot_name, riot_name_tag, guild_id);
    if(typeof account === 'string') {
      return account;
    }
    // 검색으로 계정이 2개 이상이면 계정 return
    if(account.length === 1) {
      const records = await recordMapper.getRecentGamesByRiotName(account[0].riot_name, account[0].riot_name_tag, guild_id);
      const result = {
        player : account[0],
        records : records
      }
      return result;
    } else {
      return account;
    }
  }

  /**
   * @param {*} champ_name
   * @param {*} guild_id
   * @description !장인
   * @returns
   */
  async getMasterOfChampion(champ_name, guild_id) {
    const records = await recordMapper.getMasterOfChampion(champ_name, guild_id);
    return records;
  }

  /**
   * @param {*} guild_id
   * @param {*} year
   * @param {*} month
   * @description !통계 챔프
   * @returns
   */
  async getStatisticOfChampion(guild_id, year, month) {
    const records = await recordMapper.getStatisticOfChampion(guild_id, year, month);
    return records;
  }
}

module.exports = new RecordService();