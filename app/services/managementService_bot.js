/**
 * 서비스 관리용 Service
 */
const managementMapper = require('../db/mapper/managementMapper');
const utils = require("../utils");

/**
 * !doc
 * @returns 
 */
const getDoc = async () => {

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
    "1. 닉네임 띄어쓰기구분X, 대소문자구분O, 태그필수 \n" +
    "2. 관리자 권한 필요\n" +
    "`!탈퇴 {name#tag}` 탈퇴한 회원 추가, 전적검색제외 \n" +
    "`!복귀 {name#tag}` 탈퇴한 회원 복구, 전잭검색포함 \n" +
    "`!부캐목록` 등록된 모든 부캐닉/본캐닉 닉네임 목록 \n" +
    "`!부캐저장 {부캐닉#태그/본캐닉#태그}` 부캐닉네임 등록, 데이터저장할때 부캐닉네임은 본캐닉네임으로 변경되서 저장 \n" +
    "`!부캐삭제 {부캐닉#태그}` 등록된 부캐닉네임 삭제 \n" +
    "`!닉변 {oldname#tag/newname#tag}` 닉네임 변경 \n" +
    "`!drop {gameId}` {리플레이 파일 이름} 데이터 삭제 \n";

  const jsonData = {
    title: "명령어 doc",
    description: "help",
    fields: [
      {
        name: "검색 명령어",
        value: field_one_value,
        inline: false,
      },
      {
        name: "관리자 명령어",
        value: field_two_value,
        inline: false,
      },
    ],
  };
  return jsonData;
}

/**
 * !부캐목록
 * @param {*} guild_Id
 * @returns
 */
const getSubAccountList = async (guild_id) => {
  const title = "부캐목록";
  let desc = "``` \n" + "|  부캐  |  본캐  |\n" + "\n";
  
  const sub_account_name = await managementMapper.getSubAccountList(guild_id);
  sub_account_name.forEach((data) => {
    desc += `| ${data.sub_riot_name}#${data.sub_riot_name_tag} | ${data.main_riot_name}#${data.main_riot_name_tag} \n`;
  });

  let size = sub_account_name.length;

  desc += "\n";
  desc += `총 : ${size} \n`;
  desc += "```";

  jsonData = {
    title: title,
    description: desc,
    fields: [],
  };
  return jsonData;
};

/**
 * !부캐저장
 * @param {*} command_str
 * @param {*} guild_Id
 * @returns
 */
const postSubAccount = async (command_str, guild_id) => {
  const [full_sub_name, full_main_name] = utils.splitStr(command_str);

  utils.validateTag(full_sub_name);
  utils.validateTag(full_main_name);

  const [sub_name, sub_name_tag] = utils.splitTag(full_sub_name);
  const [main_name, main_name_tag] = utils.splitTag(full_main_name);

  // 게임기록에 부캐기록이 있으면 본캐기록으로 변경 (조회 순서 중요)
  // 부캐 조회
  const sub_account = await managementMapper.getPlayer('N', sub_name, sub_name_tag, guild_id);

  // 본캐 조회
  const account = await managementMapper.getPlayer('N', main_name, main_name_tag, guild_id);
  if(!account){
    return "본캐로 게임한 기록이 없습니다.";
  } else if(account.main_player_id) {
    return `해당 ${account.riot_name} 계정은 본캐입니다, 부캐는 본캐로 저장할 수 없습니다. !부캐목록을 확인해주세요. `;
  }

  // 부캐가 이미 기록에 있다면 1. 부캐 - main_player_id 추가 2. 부캐 게임기록 본캐로 수정
  if(sub_account){
    // 1
    const putAccount = await managementMapper.putPlayer(
      null,
      null,
      account.puuid,
      account.player_id,
      null,
      sub_account.player_id
    );

    // 2
    if(sub_account){
      const putPlayerId = await managementMapper.putPlayerGamePlayerId(
        sub_account.player_id,
        account.player_id
      );
      return "등록 및 변경 완료";
    }

  } else { // 부캐기록이 없어서 새로 등록
  
    // 부캐 저장
    const result = await managementMapper.postSubAccount(
      sub_name,
      sub_name_tag,
      guild_id,
      account.puuid,
      account.player_id
    );
    return "등록 완료";
  }
};

/**
 * !부캐삭제
 * @param {*} full_sub_name
 * @param {*} guild_Id
 * @returns
 */
const deleteSubAccount = async (full_sub_name, guild_id) => {
  utils.validateTag(full_sub_name);
  const [sub_name, sub_name_tag] = utils.splitTag(full_sub_name);

  const sub_account = await managementMapper.getPlayer('N' ,sub_name, sub_name_tag, guild_id);
  if(!sub_account){
    return "해당 부계정이 없습니다.";
  } else {
    const result = await managementMapper.putPlayer(null, null, null, null, 'Y', sub_account.player_id);
    if (result.status === 500) {
      return "부캐삭제 실패";
    } else {
      if (result >= 1) {
        return "부캐삭제 완료";
      } else {
        return utils.notFoundResponse();
      }
    }
  }

};

/**
 * 리플레이 중복 체크
 * @param {*} game_id 
 * @param {*} guild_id 
 * @returns 
 */
const getDuplicateReplay = async (game_id, guild_id) => {
  return await managementMapper.getDuplicateReplay(game_id, guild_id);
};

/**
 * 리플레이 저장
 * @param {*} records 
 * @returns 
 */
const postRecord = async (records) => {
  return await managementMapper.postRecord(records);
};

/**
 * !drop 리플 삭제
 * @param {*} game_id
 * @param {*} guild_Id
 * @returns
 */
const deleteRecord = async (game_id, guild_id) => {
  // 1.League 데이터 update, 2. Player_game 데이터 update
  const league = await managementMapper.deleteLeagueByGameId(game_id, guild_id);
  if (league >= 1) {
    const playerGame = await managementMapper.deletePlayerGameByGameId(game_id, guild_id);
    if(playerGame >= 1) {
      return `:orange_circle:데이터 삭제완료: ${game_id}`;
    } else {
      return "playerGame 삭제 실패";
    }
  } else {
    return utils.notFoundResponse();
  } 
};

/**
 * !탈퇴, !복귀
 * @param {*} delete_yn
 * @param {*} full_name
 * @param {*} guild_Id
 * @returns
 */
const putDeleteYn = async (delete_yn, full_name, guild_id) => {
  utils.validateTag(full_name);
  const [riot_name, riot_name_tag] = utils.splitTag(full_name);

  // account_delete_yn: 탈퇴한계정인지 아닌지 여부, delete_yn: 탈퇴 or 복귀 명령어로 결정 탈퇴=Y 복귀=N
  let account_delete_yn = '';
  if(delete_yn === 'Y'){
    account_delete_yn = 'N'; //탈퇴시킬 계정이므로 탈퇴하지않는 계정 조회
  } else {
    account_delete_yn = 'Y'; //복귀시킬 계정이므로 탈퇴한 계정 조회
  }

  // 본계정 조회
  const account = await managementMapper.getPlayer(account_delete_yn, riot_name, riot_name_tag, guild_id);
  if(!account) {
    return utils.notFoundAccount(riot_name, riot_name_tag);
  }

  // 탈퇴한 본계정은 부캐들 전부 삭제처리, 복귀는 처리하지않음 
  if(delete_yn === 'Y'){
    const result_1 = await managementMapper.putSubPlayerDeleteYn(delete_yn, account.player_id);
  }

  // 본계정 수정
  const result_2 = await managementMapper.putPlayer(
    null,
    null,
    null,
    null,
    delete_yn,
    account.player_id
  );
  if (result_2.status === 500) {
    return "본계정 탈퇴/복귀 실패";
  } else {
    if (result_2 >= 1) {
      if (delete_yn === "Y") {
        return "탈퇴 완료";
      } else {
        return "복귀 완료";
      }
    } else {
      return utils.notFoundResponse();
    }
  }
};


/**
 * TO-DO 닉네임,태그 대소문자 실수로 잘못된 닉변 수정방안 필요
 * !닉변
 * @param {*} command_str
 * @param {*} guild_id
 * @returns
 */
const putPlayerName = async (command_str, guild_id) => {
  const [full_old_name, full_new_name] = utils.splitStr(command_str);
  const [old_name, old_name_tag] = utils.splitTag(full_old_name);
  const [new_name, new_name_tag] = utils.splitTag(full_new_name);

  // 닉변이후 계정 
  const new_account = await managementMapper.getPlayer('N', new_name, new_name_tag, guild_id);
  // 닉변한 계정이 존재하는 경우
  if(new_account) {
    return `${new_name}#${new_name_tag} 이미 존재하는 닉네임입니다.`;
  }

  // 닉변이전 계정
  const account = await managementMapper.getPlayer('N', old_name, old_name_tag, guild_id);
  if(!account){
    return utils.notFoundAccount(old_name, old_name_tag);
  }

  const result = await managementMapper.putPlayer(
    new_name,
    new_name_tag,
    null,
    null,
    null,
    account.player_id
  );
  if (result >= 1) {
    return "닉변 완료";
  } else {
    return utils.notFoundResponse();
  }
};

module.exports = {
  getDoc,
  getSubAccountList,
  getDuplicateReplay,
  postSubAccount,
  postRecord,
  putDeleteYn,
  putPlayerName,
  deleteRecord,
  deleteSubAccount,
}; 