const AccountService = require('./accountService');
const managementMapper = require('../db/mapper/managementMapper');
const responseUtils = require("../utils/responseUtils");

/**
 * 서비스 관리용 Service
 */
class managementService extends AccountService {
  constructor() {
    super();
  }

  /**
   * @description !doc 명령어 설명
   * @returns 
   */
  async getDocEmbed() {
    // 검색 명령어
    const field_one_value =
      "`!전적 !전적 {name}` 자신의 전적, name의 전적 검색 \n" +
      "`!최근전적 {name}` 최근 10게임 상세 검색\n" +
      "`!결과 {gameId}` 내전 게임 결과 검색 \n" +
      "`!장인 {champ}` 픽률-승률 장인 목록 \n" +
      "`!통계 게임|챔프` 게임,챔프 통계 \n" +
      "`!라인 {탑|정글|미드|원딜|서폿}` 30게임 이상 {라인}별 승률\n\n";

    // 관리자 명령어
    const field_two_value =
      ":one: 태그 필수 \n" +
      ":two: 관리자 권한 필요(TRC관리자 역할)\n" +
      "`!탈퇴 {name#tag}` 계정 탈퇴, 전적 검색 제외 \n" +
      "`!복귀 {name#tag}` 계정 복구, 전적 검색 포함 \n" +
      "`!부캐목록` 등록된 모든 부계정 목록 \n" +
      "`!부캐저장 {부캐닉#태그/본캐닉#태그}` 부계정 등록, 부계정 전적은 본계정 전적으로 이동 \n" +
      "`!부캐삭제 {부캐닉#태그}` 등록된 부계정 삭제 \n" +
      "`!닉변 {oldname#tag/newname#tag}` 닉네임 변경(띄어쓰기, 대소문자 구분!) \n" +
      "`!drop {리플파일명}` 저장된 리플 데이터 삭제 \n";

    const jsonData = {
      title: "명령어 설명",
      description: "",
      fields: [
        {
          name: "검색 명령어",
          value: field_one_value,
          inline: false,
        },
        {
          name: "관리자 명령어(닉네임 띄어쓰기, 대소문자 구분 :star:)",
          value: field_two_value,
          inline: false,
        },
      ],
    };
    return jsonData;
  }


  /**
   * @param {String} guild_id
   * @description !부캐목록
   * @returns {Object} Embed 형식 Json
   */
  async getSubAccountListEmbed(guild_id) {
    const title = "부캐목록";
    let desc = "``` \n" + "|  부캐  |  본캐  |\n" + "\n";

    const sub_account_name = await this.getSubPlayerList(guild_id);
    sub_account_name.forEach((data) => {
      desc += `| ${data.sub_riot_name}#${data.sub_riot_name_tag} | ${data.main_riot_name}#${data.main_riot_name_tag} \n`;
    });

    let size = sub_account_name.length;

    desc += "\n";
    desc += `총 : ${size} \n`;
    desc += "```";

    const jsonData = {
      title: title,
      description: desc,
      fields: [],
    };
    return jsonData;
  }

  /**
   * @param {String} sub_name 부캐 닉네임
   * @param {String} sub_name_tag 부캐 태그
   * @param {String} main_name 본캐 닉네임
   * @param {String} main_name_tag 본캐 태그
   * @param {String} guild_id guild_id
   * @description !부캐저장
   * @returns {string} message
   */
  async postSubAccount(sub_name, sub_name_tag, main_name, main_name_tag, guild_id) {
    // 부캐 조회
    const sub_account = await this.getPlayer("N", sub_name, sub_name_tag, guild_id);

    // 본캐 조회
    const account = await this.getPlayer("N", main_name, main_name_tag, guild_id);
    if (!account) return "본캐로 게임한 기록이 없습니다.";
    if (account.main_player_id) {
      return `해당 ${account.riot_name} 계정은 본캐입니다, 부캐는 본캐로 저장할 수 없습니다. !부캐목록을 확인해주세요. `;
    }

    // 부캐가 이미 기록에 있다면 1. 부캐 - main_player_id 추가 2. 부캐 게임기록 본캐로 수정
    if (sub_account) {
      // 1
      await this.putPlayer(null, null, account.puuid, account.player_id, null, sub_account.player_id);
      // 2
      if (sub_account) {
        await managementMapper.putPlayerGamePlayerId(sub_account.player_id, account.player_id);
        return "등록 및 변경 완료";
      }
    } else {
      // 부캐기록이 없어서 새로 등록
      await this.postSubPlayer(sub_name, sub_name_tag, guild_id, account.puuid, account.player_id);
      return "등록 완료";
    }
  }

  /**
   * @param {String} sub_name 부캐 닉네임
   * @param {String} sub_name_tag 부캐 태그
   * @param {String} guild_id
   * @description !부캐삭제
   * @returns {String} message
   */
  async putSubAccount(sub_name, sub_name_tag, guild_id) { 
    const sub_account = await this.getPlayer("N", sub_name, sub_name_tag, guild_id);
    if (!sub_account) {
      return "해당 부계정이 없습니다.";
    } else {
      const result = await this.deleteSubPlayer(sub_account.player_id);
      if (result.status === 500) {
        return "부캐삭제 실패";
      } else {
        if (result >= 1) {
          return "부캐삭제 완료";
        } else {
          return responseUtils.notFoundResponse();
        }
      }
    }
  }

  /**
   * @param {String} delete_yn (Y/N)
   * @param {String} riot_name 라이엇 닉네임 
   * @param {String} riot_name_tag 라이엇 태그
   * @param {String} guild_id 길드 ID
   * @description !탈퇴, !복귀
   * @returns {String} message
   */
  async putAccountDeleteYn(delete_yn, riot_name, riot_name_tag, guild_id) {
    let account_delete_yn = "";
    if (delete_yn === "Y") {
      account_delete_yn = "N";
    } else {
      account_delete_yn = "Y";
    }
    
    // 본계정 조회
    const account = await this.getPlayer(account_delete_yn, riot_name, riot_name_tag, guild_id);
    if (!account) {
      return responseUtils.notFoundAccount(riot_name, riot_name_tag);
    }

    // 탈퇴한 본계정의 부계정들 전부 삭제처리, 복귀는 처리하지않음
    if (delete_yn === "Y") {
      await this.deleteSubPlayers(account.player_id);
    }
    
    // 본계정 수정
    const result = await this.putPlayer(null, null, null, null, delete_yn, account.player_id);
    if (result.status === 500) {
      return "본계정 탈퇴/복귀 실패";
    } else {
      if (result >= 1) {
        if (delete_yn === "Y") {
          return "탈퇴 완료";
        } else {
          return "복귀 완료";
        }
      } else {
        return responseUtils.notFoundResponse();
      }
    }
  }

  /**
   * TO-DO 닉네임,태그 대소문자 실수로 잘못된 닉변 수정방안 필요
   * @param {String} old_name 기존 닉네임
   * @param {String} old_name_tag 기존 태그
   * @param {String} new_name 새 닉네임
   * @param {String} new_name_tag 새 태그
   * @param {String} guild_id 길드 ID
   * @description !닉변
   * @returns {String} message
   */
  async putAccountName(old_name, old_name_tag, new_name, new_name_tag, guild_id) {
    // 닉변이후 계정
    const new_account = await this.getPlayer("N", new_name, new_name_tag, guild_id);
    // 닉변한 계정이 존재하는 경우
    if (new_account) {
      return `${new_name}#${new_name_tag} 이미 존재하는 닉네임입니다.`;
    }

    // 닉변이전 계정
    const account = await this.getPlayer("N", old_name, old_name_tag, guild_id);
    if (!account) {
      return responseUtils.notFoundAccount(old_name, old_name_tag);
    }

    const result = await this.putPlayer(new_name, new_name_tag, null, null, null, account.player_id);
    if (result.status === 500) {
      return "닉변 실패";
    } else {
      if (result >= 1) {
        return "닉변 완료";
      } else {
        return responseUtils.notFoundResponse();
      }
    }
  }
}

module.exports = new managementService();