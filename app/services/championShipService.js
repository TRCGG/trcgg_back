/**
 * 대회 기록 service
 */

const championShipMapper = require('../db/mapper/championShipMapper.js');
const replayService = require('./replayService.js');
const HttpError = require("../utils/HttpError");

class ChampionShipService {
  constructor() {}

  /**
   * @param {*} fileUrl 
   * @param {*} fileName 
   * @param {*} createUser 
   * @param {*} guild_id 
   * @param {*} game_type
   * @description 대회 기록 저장
   * @returns 
   */
  async save(fileUrl, fileName, createUser, guild_id, game_type) {
    if(await this.checkDuplicate(fileName, guild_id)) {
      const bytesData = await replayService.getInputStreamDiscordFile(fileUrl);

      if (bytesData) {
        const statsArray = await replayService.parseReplayData(bytesData);
        const params = await replayService.setParams(statsArray, fileName, createUser, guild_id, game_type);
        await this.post(params);
        return `:white_check_mark: 대회기록:${fileName} 반영 완료`;
      } else {
        throw HttpError.internal("디스코드 파일 데이터 가져오기 실패");
      }
    } else {
      throw HttpError.badRequest(`:red_circle:등록실패: ${fileName} 중복된 리플 파일 등록`);
    }
  }

  /**
   * @param {*} guild_id 
   * @param {*} game_id 
   * @description 대회 기록 중복 체크
   * @returns 
   */
  async checkDuplicate(game_id, guild_id) {
    const result = await championShipMapper.getDuplicateChampionshipReplay(game_id, guild_id);
    return result.count === 0;
  }

  /**
   * 
   * @param {*} params 
   * @description 대회 기록 저장
   * @returns 
   */
  async post(params) {
    const result = await championShipMapper.postChampionshipReplay(params);
    return result;
  }

}

module.exports = new ChampionShipService();
