/**
 * 서비스 관리용 Service
 */
const managementMapper = require('../db/mapper/managementMapper');
const appUtil = require("../appUtils");

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
const getSubAccountName = async (guild_id) => {
  const title = "부캐목록";
  let desc = "``` \n" + "|  부캐  |  본캐  |\n" + "\n";
  
  const sub_account_name = await managementMapper.getSubAccountName(guild_id);
  sub_account_name.forEach((data) => {
    desc += `| ${data.sub_name}#${data.sub_name_tag} | ${data.main_name}#${data.main_name_tag} \n`;
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
const postSubAccountName = async (command_str, guild_id) => {
  const [full_sub_name, full_main_name] = appUtil.splitStr(command_str);

  appUtil.validateTag(full_sub_name);
  appUtil.validateTag(full_main_name);

  const [sub_name, sub_name_tag] = appUtil.splitTag(full_sub_name);
  const [main_name, main_name_tag] = appUtil.splitTag(full_main_name);

  // 부캐 저장
  const result = await managementMapper.postSubAccountName(
    sub_name,
    sub_name_tag,
    main_name,
    main_name_tag,
    guild_id
  );

  if(result.status === 500){
    return "부캐 저장 실패";
  }

  // 등록된 이름 변경
  const result_2 = await managementMapper.putName(
    main_name,
    main_name_tag,
    sub_name,
    sub_name_tag,
    guild_id
  );
  
  if (result_2.status === 500) {
    return "이름 변경 실패";
  }

  return "등록 및 변경 완료";
};

const putSubAccountName = async (new_name, new_name_tag, old_name, old_name_tag, guild_id) => {
  return await managementMapper.putSubAccountName(new_name, new_name_tag, old_name, old_name_tag, guild_id);
};

/**
 * !부캐삭제
 * @param {*} full_sub_name
 * @param {*} guild_Id
 * @returns
 */
const deleteSubAccountName = async (full_sub_name, guild_id) => {
  appUtil.validateTag(full_sub_name);
  const [sub_name, sub_name_tag] = appUtil.splitTag(full_sub_name);
  const result = await managementMapper.deleteSubAccountName(sub_name, sub_name_tag, guild_id);
  if (result.status === 500) {
    return "부캐삭제 실패";
  } else {
    if (result >= 1) {
      return "부캐삭제 완료";
    } else {
      return appUtil.notFoundResponse();
    }
  }
};

// 중복 체크
const getDuplicateReplay = async (game_id, guild_id) => {
  return await managementMapper.getDuplicateReplay(game_id, guild_id);
};

// 길드정보
const getGuild = async (guild_id) => {
  return await managementMapper.getGuild(guild_id);
};

// 길드등록
const postGuild = async (guild_name, guild_id) => {
  return await managementMapper.postGuild(guild_name, guild_id);
};

// 리플저장
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
  const result = await managementMapper.deleteRecord(game_id, guild_id);
  if (result.status === 500) {
    throw new Error("삭제 실패");
  } else {
    if (result >= 1) {
      return `:orange_circle:데이터 삭제완료: ${game_id}`;
    } else {
      return appUtil.notFoundResponse();
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
  appUtil.validateTag(full_name);
  const [riot_name, riot_name_tag] = appUtil.splitTag(full_name);
  const result = await managementMapper.putUserSubAccountDeleteYN(
    delete_yn,
    riot_name,
    riot_name_tag,
    guild_id
  );
  if (result.status === 500) {
    return "부계정 탈퇴/복귀 실패";
  }

  const result_2 = await managementMapper.putUserDeleteYN(
    delete_yn,
    riot_name,
    riot_name_tag,
    guild_id
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
      return appUtil.notFoundResponse();
    }
  }
};


/**
 * !닉변
 * @param {*} command_str
 * @param {*} guild_id
 * @returns
 */
const putNameAndSubAccountName = async (command_str, guild_id) => {
  const [full_old_name, full_new_name] = appUtil.splitStr(command_str);
  const [old_name, old_name_tag] = appUtil.splitTag(full_old_name);
  const [new_name, new_name_tag] = appUtil.splitTag(full_new_name);

  // 부캐 - main_name 변경
  const result_2 = await managementMapper.putSubAccountName(
    new_name,
    new_name_tag,
    old_name,
    old_name_tag,
    guild_id
  );
  if (result_2.status === 500) {
    return "부캐닉네임 변경 실패";
  }

  const result = await managementMapper.putName(
    new_name,
    new_name_tag,
    old_name,
    old_name_tag,
    guild_id
  );
  if (result.status === 500) {
    return "닉네임 변경 실패";
  } else {
    if (result >= 1) {
      return "닉변 완료";
    } else {
      return appUtil.notFoundResponse();
    }
  }
};

module.exports = {
  getDoc,
  getSubAccountName,
  postSubAccountName,
  putSubAccountName,
  deleteSubAccountName,
  getDuplicateReplay,
  getGuild,
  postGuild,
  postRecord,
  deleteRecord,
  putDeleteYn,
  putNameAndSubAccountName,
}; 