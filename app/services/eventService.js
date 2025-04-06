const eventMapper = require("../db/mapper/eventMapper");
const recordService = require("./recordService");

/**
 * 특별한 이벤트 Service
 * alarm - 이번달에 50 승리, 150판 이상 한 인원 알람 
 */
class eventService {
  constructor() {}

	/**
	 * @param {*} year 
	 * @param {*} month 
	 * @param {*} guild_id 
	 * @description 알람 이벤트 처리
	 * @returns 
	 */
	async processAlarmEvent(guild_id, year, month) {
		const records = await recordService.getStatisticOfGame(guild_id, year, month);

		const alarmGames = await this.checkAlarmEventGames(records, guild_id);
    await this.insertEventAlarm(alarmGames, true, false);

		const alarmWins = await this.checkAlarmEventWins(records, guild_id);
    await this.insertEventAlarm(alarmWins, false, true);
		return { alarmGames, alarmWins };
	}

	/**
	 * @param {*} guild_id 
	 * @param {*} games_threshold_met 
	 * @param {*} wins_threshold_met 
	 * @description 알람한 인원 조회
	 * @returns 
	 */
	async getEventAlarm(guild_id, games_threshold_met, wins_threshold_met) {
		const result = await eventMapper.getEventAlarm(guild_id, games_threshold_met, wins_threshold_met);
		return result;
	}

	/**
	 * @param {*} records
	 * @param {*} guild_id 
	 * @description 150판 이상 한 인원 체크
	 * @returns 
	 */
  async checkAlarmEventGames(records, guild_id) {
		// 150판 이상 알람 간 인원
		const alarms_gamse = await this.getEventAlarm(guild_id, true, false);

		// 150판 이상 달성한 인원
		const records_count_150 = records.filter((record) => record.total_count >= 150);

		// 알람해야할 인원들
		const result = this.filter_player(alarms_gamse, records_count_150);

    return result;
  }

	/**
	 * @param {*} records
	 * @param {*} guild_id 
	 * @description 50승리 이상 한 인원 체크
	 * @returns 
	 */
	async checkAlarmEventWins(records, guild_id) {
		// 50승리 이상 알람 간 인원
		const alarms_wins = await this.getEventAlarm(guild_id, false, true);

		// 50승리 이상 달성한 인원
		const records_win_50 = records.filter((record) => record.win >= 50);

		// 알람해야할 인원들
		const result = await this.filter_player(alarms_wins, records_win_50);

    return result;
  }

	/**
	 * @param {*} alarms 
	 * @param {*} records 
	 * @description 알람해야할 인원 필터링
	 * @returns 
	 */
	async filter_player(alarms, records) {
		// 알람간 인원들의 player_id
		const alarm_player_ids = new Set(alarms.map((alarm) => alarm.player_id));

		// 알람해야할 인원들
		const filtered_records = records.filter((record) => {
			return !alarm_player_ids.has(record.player_id);
		});
		return filtered_records;
	}

  /**
   * @param {*} alarms 
   * @param {*} games_threshold_met
   * @param {*} wins_threshold_met
   * @description 알람한 인원 등록
   */
  async insertEventAlarm(alarms, games_threshold_met, wins_threshold_met) {
    const promises = alarms.map(async (alarm) => {
      if (games_threshold_met) {
        const params = [
          alarm.player_id,
          games_threshold_met
        ]
        await this.postEventAlarmGames(params);
      }
      if (wins_threshold_met) {
        const params = [
          alarm.player_id,
          wins_threshold_met
        ]
        await this.postEventAlarmWins(params);
      }
    });
  }

	/**
	 * @param {*} params 
	 * @description 150판 알람한 인원 등록
	 * @returns 
	 */
  async postEventAlarmGames(params) {
    const result = await eventMapper.postEventAlarmGames(params);
    return result;
  }

  /**
	 * @param {*} params 
	 * @description 50승 알람한 인원 등록
	 * @returns 
	 */
  async postEventAlarmWins(params) {
    const result = await eventMapper.postEventAlarmWins(params);
    return result;
  }

}

module.exports = new eventService();
