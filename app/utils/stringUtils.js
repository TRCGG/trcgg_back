const HttpError = require('../utils/HttpError');

/**
 * StringUtils 
 */

/**
 * @param {*} position
 * @description 포지션 변환
 * @returns
 */
const dictPosition = (position) => {
  switch (position) {
    case "탑":
      return "TOP";
    case "정글":
      return "JUG";
    case "미드":
      return "MID";
    case "원딜":
      return "ADC";
    case "서폿":
      return "SUP";
    default:
      throw HttpError.badRequest("잘못된 값:" + position);
  }
};

/**
 * @param {*} dto
 * @param {*} team
 * @description !라인 필드 헤더 설정
 * @returns
 */
const setLineFieldHeader = (dto, team) => {
  let result = "";

  if (team === "blue") {
    result += ":blue_circle: 블루 ";
    // 블루가 승리한 경우
    if (dto.game_team === "blue" && dto.game_result === "승") {
      result += ":v:";
    }
  } else {
    result += ":red_circle: 레드 ";
    // 블루가 패배한 경우
    if (dto.game_team === "blue" && dto.game_result === "패") {
      result += ":v:";
    }
  }

  return result;
};

/**
 * @param {*} prefix
 * @param {*} total_count
 * @param {*} win
 * @param {*} lose
 * @param {*} win_rate
 * @deprecated prefix: 판 승 패 승률 form
 * @returns
 */
const makeAllStat = (prefix, total_count, win, lose, win_rate) => {
  return `${prefix}: ${total_count}판 ${win}승 ${lose}패 ${win_rate}%\n`;
};

/**
 * @param {*} prefix
 * @param {*} win
 * @param {*} lose
 * @param {*} win_rate
 * @description prefix: 승/패 - 승률 form
 * @returns
 */
const makeTeamStat = (prefix, win, lose, win_rate) => {
  return `${prefix}: ${win}승/${lose}패 ${win_rate}%\n`;
};

/**
 * 
 * @param {*} prefix
 * @param {*} win
 * @param {*} win_rate
 * @param {*} kda 
 * @description prefix - 승/승률 - kda form
 * @returns 
 */
const makeStat = (prefix, win, win_rate, kda) => {
  let stats = `${prefix} - ${win}승/${win_rate}%`;

  if (kda !== 9999) {
    stats += ` KDA: ${kda}`;
  }

  stats += "\n";

  return stats;
};

/**
 * 필터링 및 정렬 함수
 * @param {*} records
 * @param {*} win_rate
 * @param {*} greater_than
 * @param {*} limit
 * @returns
 */
const filterAndSortByWinRate = (records, win_rate, greater_than, limit) => {
  let sorted_records;
  let filtered_records;

  if (greater_than) {
    sorted_records = records.sort((a, b) => b.win_rate - a.win_rate);
    filtered_records = sorted_records
      .slice(0, limit)
      .filter((record) => record.win_rate >= win_rate);
  } else {
    sorted_records = records.sort((a, b) => a.win_rate - b.win_rate);
    filtered_records = sorted_records
      .slice(0, limit)
      .filter((record) => record.win_rate <= win_rate);
  }
  return filtered_records;
};

module.exports = {
  dictPosition,
  setLineFieldHeader,
  makeAllStat,
  makeTeamStat,
  makeStat,
  filterAndSortByWinRate,
};
