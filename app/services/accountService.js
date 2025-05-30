const accountMapper = require('../db/mapper/accountMapper');
const HttpError = require('../utils/HttpError');
/**
 * 계정 Service
 */
class AccountService {
  constructor() {}

  /**
   * @param {String} riot_name 
   * @param {String} riot_name_tag 
   * @param {String} guild_id 
   * @description 전적검색을 위한 계정 조회
   * @returns 
   */
  async search(riot_name, riot_name_tag, guild_id) {
    if(riot_name.length < 2) {
      throw HttpError.requireMoreChars();
    }

    //첫 계정 조회 (like 없이)
    const first_account = await this.getPlayerByExactName(riot_name, riot_name_tag, guild_id);
    if(first_account.length >= 1) {
      return first_account;
    } 

    //두번째 계정 조회
    const second_account = await this.getPlayerBySimilarName(riot_name, riot_name_tag, guild_id);
    if(second_account.length === 0) {
      throw HttpError.notFoundAccount(riot_name, riot_name_tag);
    }
    return second_account;
  }

  /**
   * @param {string} delete_yn - 탈퇴 여부 ("Y", "N")
   * @param {string} riot_name - 플레이어 닉네임
   * @param {string} riot_name_tag - 태그
   * @param {string} guild_id - 길드 ID
   * @description 계정 조회(관리자명령어)
   * @returns {object|null} - 조회된 플레이어 정보
   */
  async getPlayer(delete_yn, riot_name, riot_name_tag, guild_id){
    const account = await accountMapper.getPlayer(delete_yn, riot_name, riot_name_tag, guild_id);
    return account;
  }

  /**
   * @param {String} riot_name 
   * @param {String} riot_name_tag not required
   * @param {String} guild_id 
   * @description 계정 조회(전적 검색용) - 첫번째
   * @returns {List<Player>} - 조회된 플레이어 정보
   */
    async getPlayerByExactName(riot_name, riot_name_tag, guild_id) {
      const accounts = await accountMapper.getPlayerByExactName(
        riot_name,
        riot_name_tag,
        guild_id
      );
      return accounts;
    }

  /**
   * @param {String} riot_name 
   * @param {String} riot_name_tag not required
   * @param {String} guild_id 
   * @description 계정 조회(전적 검색용) - 두번째
   * @returns {List<Player>} - 조회된 플레이어 정보
   */
  async getPlayerBySimilarName(riot_name, riot_name_tag, guild_id) {
    const accounts = await accountMapper.getPlayerBySimilarName(
      riot_name,
      riot_name_tag,
      guild_id
    );
    return accounts;
  }

  /**
   * @param {String} guild_id 
   * @returns List<Player>
   * @description 부계정 목록 조회
   */
  async getSubPlayerList(guild_id) {
    const sub_player_list = await accountMapper.getSubPlayerList(guild_id);
    return sub_player_list;
  }

  /**
   * @param {*} riot_name 
   * @param {*} riot_name_tag 
   * @param {*} guild_id 
   * @param {*} puuid 
   * @param {*} main_player_id
   * @returns 
   * @description 부계정 추가
   */
  async postSubPlayer(riot_name, riot_name_tag, guild_id, puuid, main_player_id) {
    const result = await accountMapper.postSubPlayer(riot_name, riot_name_tag, guild_id, puuid, main_player_id);
    return result;
  }

  /**
   * @param {String} riot_name 
   * @param {String} riot_name_tag 
   * @param {String} puuid
   * @param {String} main_player_id - 본캐 player_id
   * @param {String} delete_yn 
   * @param {String} target_player_id - 수정할 player_id
   * @returns num
   * @description 계정 수정
   */
  async putPlayer(riot_name, riot_name_tag, puuid, main_player_id, delete_yn, target_player_id) {
    const result = await accountMapper.putPlayer(riot_name, riot_name_tag, puuid, main_player_id, delete_yn, target_player_id);
    return result;
  }

  /**
   * @param {*} player_id 
   * @description 부계정 삭제
   * @returns 
   */
  async deleteSubPlayer(player_id) {
    const result = await accountMapper.deleteSubPlayer(player_id);
    return result;
  }

  /**
   * @param {*} main_player_id 
   * @description 부계정 일괄 삭제 (!탈퇴, !복귀 명령어)
   * @returns 
   */
  async deleteSubPlayers(main_player_id) {
    const result = await accountMapper.deleteSubPlayers(main_player_id);
    return result;
  }
}

module.exports = AccountService;