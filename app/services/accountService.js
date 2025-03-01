/**
 * 계정 서비스
 */
const accountMapper = require('../db/mapper/accountMapper');
const managementMapper = require('../db/mapper/managementMapper');
const utils = require("../utils");


/**
 * 전적 검생용 계정 조회
 * @param {*} riot_name 
 * @param {*} riot_name_tag 
 * @param {*} guild_id 
 * @returns 
 */
const getPlayerForRecord = async (riot_name, riot_name_tag, guild_id) => {
	const accounts = await recordMapper.getPlayerForSearch(
		riot_name,
		riot_name_tag,
		guild_id
	);
	if(accounts === 0) {
		return utils.notFoundResponse();
	}
	return accounts;
};

/**
 * !부캐목록
 * @param {*} guild_Id
 * @returns
 */
const getSubAccountListEmbed = async (guild_id) => {
  const title = "부캐목록";
  let desc = "``` \n" + "|  부캐  |  본캐  |\n" + "\n";

  const sub_account_name = await accountMapper.getSubAccountList(guild_id);
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
  const sub_account = await fetchPlayer("N", sub_name, sub_name_tag, guild_id);

  // 본캐 조회
  const account = await fetchPlayer("N", main_name, main_name_tag, guild_id);
  if (!account) return "본캐로 게임한 기록이 없습니다.";
  if (account.main_player_id) {
		return `해당 ${account.riot_name} 계정은 본캐입니다, 부캐는 본캐로 저장할 수 없습니다. !부캐목록을 확인해주세요. `;
	}

  // 부캐가 이미 기록에 있다면 1. 부캐 - main_player_id 추가 2. 부캐 게임기록 본캐로 수정
  if (sub_account) {
    // 1
    const putAccount = await accountMapper.putPlayer(null, null, account.puuid, account.player_id, null, sub_account.player_id);
    // 2
    if (sub_account) {
      const putPlayerId = await managementMapper.putPlayerGamePlayerId(sub_account.player_id, account.player_id);
      return "등록 및 변경 완료";
    }
  } else {
    // 부캐기록이 없어서 새로 등록

    // 부캐 저장
    const result = await accountMapper.postSubAccount(
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
const putSubAccount = async (full_sub_name, guild_id) => {
  utils.validateTag(full_sub_name);
  const [sub_name, sub_name_tag] = utils.splitTag(full_sub_name);

  const sub_account = await fetchPlayer("N", sub_name, sub_name_tag, guild_id);
  if (!sub_account) {
    return "해당 부계정이 없습니다.";
  } else {
    const result = await accountMapper.putPlayer(null, null, null, null, "Y", sub_account.player_id);
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
  let account_delete_yn = "";
  if (delete_yn === "Y") {
    account_delete_yn = "N"; //탈퇴시킬 계정이므로 탈퇴하지않는 계정 조회
  } else {
    account_delete_yn = "Y"; //복귀시킬 계정이므로 탈퇴한 계정 조회
  }

  // 본계정 조회
  const account = await fetchPlayer(
    account_delete_yn,
    riot_name,
    riot_name_tag,
    guild_id
  );
  if (!account) {
    return utils.notFoundAccount(riot_name, riot_name_tag);
  }

  // 탈퇴한 본계정은 부캐들 전부 삭제처리, 복귀는 처리하지않음
  if (delete_yn === "Y") {
    const result_1 = await accountMapper.putSubPlayerDeleteYn(
      delete_yn,
      account.player_id
    );
  }

  // 본계정 수정
  const result_2 = await accountMapper.putPlayer(
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
  const new_account = await fetchPlayer(
    "N",
    new_name,
    new_name_tag,
    guild_id
  );
  // 닉변한 계정이 존재하는 경우
  if (new_account) {
    return `${new_name}#${new_name_tag} 이미 존재하는 닉네임입니다.`;
  }

  // 닉변이전 계정
  const account = await fetchPlayer(
    "N",
    old_name,
    old_name_tag,
    guild_id
  );
  if (!account) {
    return utils.notFoundAccount(old_name, old_name_tag);
  }

  const result = await accountMapper.putPlayer(
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

/**
 * Player 조회 (내부 함수)
 * @param {string} delete_yn - 탈퇴 여부 ("Y", "N", or null)
 * @param {string} riot_name - 플레이어 닉네임
 * @param {string} riot_name_tag - 태그
 * @param {string} guild_id - 길드 ID
 * @returns {object|null} - 조회된 플레이어 정보
 */
const fetchPlayer = async (delete_yn, riot_name, riot_name_tag, guild_id) => {
  return await accountMapper.getPlayer(delete_yn, riot_name, riot_name_tag, guild_id);
};

module.exports = {
	getPlayerForRecord,
  getSubAccountListEmbed,
  postSubAccount,
  putSubAccount,
  putDeleteYn,
  putPlayerName,
};
