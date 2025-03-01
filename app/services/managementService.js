/**
 * 서비스 관리용 Service
 */
const managementMapper = require('../db/mapper/managementMapper');
const utils = require("../utils");

/**
 * !doc
 * @returns 
 */
const getDocEmbed = async () => {

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

module.exports = {
  getDocEmbed,
  getDuplicateReplay,
  postRecord,
  deleteRecord,
}; 