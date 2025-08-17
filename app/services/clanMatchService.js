const clanMatchMapper = require('../db/mapper/clanMatchMapper');
const HttpError = require("../utils/HttpError");

/**
 * 클랜 스크림 매치 Service
 */
class ClanMatchService {
  constructor() {}

  /**
   * @param {String} game_type - 게임 타입
   * @param {String} our_clan_role_id - 우리 클랜 역할 ID
   * @param {String} opponent_clan_role_id - 상대 클랜 역할 ID
   * @description 클랜전적 매치 조회
   * @returns 
   */ 
  async getClanMatch(game_type, our_clan_role_id, opponent_clan_role_id) {
    if (!game_type || !our_clan_role_id) {
      throw HttpError.badRequest("게임 타입과 클랜 역할 ID는 필수입니다.");
    }
    const clanMatch = await clanMatchMapper.getClanMatch(game_type, our_clan_role_id, opponent_clan_role_id);
    if (clanMatch.length === 0) {
      throw HttpError.notFound("클랜전적 스크림 매치가 없습니다.");
    }
    const recentClanMatch = await clanMatchMapper.getRecentClanMatch(game_type, our_clan_role_id, opponent_clan_role_id);
    return {clanMatch, recentClanMatch};
    
  }

  /**
   * @param {Object} params - 클랜전적 매치 추가 정보
   * @description 클랜전적 매치 추가
   * @returns 
   */
  async postClanMatch(params) {
    if(!params) {
      throw HttpError.badRequest();
    }
    const paramsArray = [
      params.file_name,
      params.game_type,
      params.our_clan_role_id,
      params.opponent_clan_role_id
    ];
    return await clanMatchMapper.postClanMatch(paramsArray);
  }

  /**
   * 
   * @param {*} file_name 
   * @description 클랜전적 매치 삭제
   * @returns 
   */
  async deleteClanMatch(file_name) {
    if(!file_name) {
      throw HttpError.badRequest();
    } 
    const result = await clanMatchMapper.deleteClanMatch(file_name);
    if (result.rowCount === 0) {
      throw HttpError.notFound("해당 파일 이름의 클랜전적 스크림 매치가 없습니다.");
    }
    return `:orange_circle: 클랜 매치 데이터 삭제완료: ${file_name}`;
  }

  /**
   * 
   * @param {*} our_clan_role_id 
   * @param {*} opponent_clan_role_id 
   * @description 클랜전적 스크림 매치 카운트 조회
   */
  async getClanMatchCount(our_clan_role_id, opponent_clan_role_id) {
    if (!our_clan_role_id) {
      throw HttpError.badRequest();
    }
    const clanMatchCount = await clanMatchMapper.getClanMatchCount(our_clan_role_id, opponent_clan_role_id);
    return clanMatchCount;
  }

}

module.exports = new ClanMatchService();