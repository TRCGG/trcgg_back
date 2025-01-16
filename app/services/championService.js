/**
 * 챔피언 관련 Service
 */
const championMapper = require("../db/mapper/championMapper");
const botUtil = require("../utils");
const embedUtil = require("../embed");

// 모스트픽 10
const getMostPicks = async (riot_name, guild_id) => {
  return await championMapper.getMostPicks(riot_name, guild_id);
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
    return botUtil.notFoundResponse();
  }

  let title = champ_name;
  let field_one_name = "판수 순";
  let field_one_value = "";

  let field_two_name = "승률 순";
  let field_two_value = "";

  let count_records = champ_data.slice(0, 10);

  count_records.forEach((data) => {
    field_one_value += embedUtil.makeTeamStat(
      data.riot_name,
      data.win,
      data.lose,
      data.win_rate
    );
  });

  let high_records = champ_data
    .sort((a, b) => b.win_rate - a.win_rate)
    .slice(0, 10);

  high_records.forEach((data) => {
    field_two_value += embedUtil.makeTeamStat(
      data.riot_name,
      data.win,
      data.lose,
      data.win_rate
    );
  });

  jsonData = {
    title: title,
    description: desc_value,
    fields: [
      {
        name: field_one_name,
        value: field_one_value,
        inline: true,
      },
      {
        name: field_two_name,
        value: field_two_value,
        inline: false,
      },
    ],
  };
  return jsonData;
};

/**
 * !통계 챔프
 * @param {*} guild_id
 * @param {*} year
 * @param {*} month
 * @returns
 */
const getStatisticOfChampion = async (guild_id, year, month) => {
  return await championMapper.getStatisticOfChampion(guild_id, year, month);
};

module.exports = {
  getMostPicks,
  getMasterOfChampion,
  getStatisticOfChampion,
};
