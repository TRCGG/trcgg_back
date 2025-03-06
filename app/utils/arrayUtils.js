const stringUtils = require("./stringUtils");

/**
 * !라인 필드 값 설정
 * @param {*} records
 * @param {*} team
 * @returns
 */
const setLineValue = (records, team) => {
  let result = [];

  records.forEach((record) => {
    if (team === "blue" && record.game_team === "blue") {
      // 블루 팀인 경우
      result.push(
        ` ${record.riot_name}   ${record.champ_name} ${record.kill}/${record.death}/${record.assist} ` +
          `피해량: ${record.total_damage_champions} 핑와: ${record.vision_bought}\n`
      );
    } else if (team === "red" && record.game_team === "red") {
      // 레드 팀인 경우
      result.push(
        ` ${record.riot_name}   ${record.champ_name} ${record.kill}/${record.death}/${record.assist} ` +
          `피해량: ${record.total_damage_champions} 핑와: ${record.vision_bought}\n`
      );
    }
  });

  // 배열을 하나의 문자열로 반환
  return result.join("");
};

/**
 * !통계 챔프/게임 form
 * @param {*} stats_list
 * @param {*} type
 * @returns
 */
const makeStatsList = (stats_list, type) => {
  let result = [];
  let i = 1;

  if (type === "champ") {
    stats_list.forEach((vo) => {
      result.push(
        `${i}. ${stringUtils.makeTeamStat(vo.champ_name, vo.win, vo.lose, vo.win_rate)}`
      );
      i++;
    });
  } else if (type === "game") {
    stats_list.forEach((vo) => {
      result.push(`${i}. ${vo.riot_name} - ${vo.total_count}판 \n`);
      i++;
    });
  } else if (type === "game_high") {
    stats_list.forEach((vo) => {
      result.push(
        `${i}. ${stringUtils.makeStat(vo.riot_name, vo.win, vo.win_rate, vo.kda)}`
      );
      i++;
    });
  }

  return result.join("");
};

module.exports = {
	makeStatsList, 
	setLineValue,
}