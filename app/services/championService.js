/**
 * 챔피언 관련 Service
 */
const championMapper = require("../db/mapper/championMapper");
const appUtil = require("../appUtils");
const embedUtil = require("../embed");

// 모스트픽 10
const getMostPicks = async (riot_name, riot_name_tag, guild_id) => {
  return await championMapper.getMostPicks(riot_name, riot_name_tag, guild_id);
};

/**
 * !장인
 * @param {*} champ_name
 * @param {*} guild_Id
 * @returns
 */
const getMasterOfChampion = async (champ_name, guild_id) => {
  const champ_data = await championMapper.getMasterOfChampion(
    champ_name,
    guild_id
  );
  if (champ_data.length === 0) {
    return appUtil.notFoundResponse();
  }

  let title = champ_name;
  let field_one_name = "판수 순";
  let field_one_value = "";

  let field_two_name = "승률 순(10판 이상)";
  let field_two_value = "";

  let count_records = champ_data.slice(0, 10);

  count_records.forEach((data) => {
    field_one_value += embedUtil.makeAllStat(
      data.riot_name,
      data.total_count,
      data.win,
      data.lose,
      data.win_rate
    );
  });

  let high_records = champ_data
    .filter(record => record.total_count >= 10)
    .sort((a, b) => b.win_rate - a.win_rate)
    .slice(0, 10);

  high_records.forEach((data) => {
    field_two_value += embedUtil.makeStat(
      data.riot_name,
      data.win,
      data.win_rate,
      data.kda
    );
  });

  jsonData = {
    title: title,
    description: undefined,
    fields: [
      {
        name: field_one_name,
        value: field_one_value,
        inline: true,
      },
      {
        name: field_two_name,
        value: field_two_value,
        inline: true,
      },
    ],
  };
  return jsonData;
};

/**
 * !통계 챔프
 * @param {*} guild_id
 * @param {*} type
 * @param {*} date
 * @returns
 */
const getStatisticOfChampion = async (guild_id, type, date) => {
  const [year,month] = appUtil.splitDate(date);
  const title = `${year}-${month} ${type} 통계`;
  const records = await championMapper.getStatisticOfChampion(guild_id, year, month);
  if(records.length === 0){
    return appUtil.notFoundResponse();
  }

  let field_one_header = "인기 챔프:star:";
  let field_one_value = embedUtil.makeStatsList(records.slice(0,15), "champ");

  let field_two_header = "1티어:partying_face:";
  let field_two_value = embedUtil.makeStatsList(records.filter(record => record.total_count >= 20).sort((a,b) => (b.win_rate - a.win_rate)).slice(0,15), "champ");

  let field_three_header = "5티어:scream:"
  let field_three_value = embedUtil.makeStatsList(records.filter(record => record.total_count >= 20).sort((a,b) => (a.win_rate - b.win_rate)).slice(0,15), "champ");

  jsonData = {
    title:title,
    description:"",
    fields: [
      {
        name: field_one_header,
        value: field_one_value,
        inline: true,
      },
      {
        name: field_two_header,
        value: field_two_value,
        inline: true,
      },
      {
        name: field_three_header,
        value: field_three_value,
        inline: true,
      }
    ]
  }
  return jsonData;
};

module.exports = {
  getMostPicks,
  getMasterOfChampion,
  getStatisticOfChampion,
};
