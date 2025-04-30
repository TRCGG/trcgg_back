/**
 * 전적 검색 Service 디스코드 봇용
 */
const RecordService = require("./recordService");
const stringUtils = require("../utils/stringUtils");
const arrayUtils = require("../utils/arrayUtils");
const HttpError = require("../utils/HttpError");

/**
 * @param {String} riot_name 
 * @param {String} riot_name_tag 
 * @param {String} guild_id 
 * @description !전적 Embed
 * @returns
 */
const getAllRecordEmbed = async (riot_name, riot_name_tag, guild_id) => {
  const allData = await RecordService.getAllRecord(riot_name, riot_name_tag, guild_id);

  // player가 없다면 그대로 return 
  if (!allData.player){
    return allData;
  }
  // 계정 조회 2건 이상일 경우
  if (allData.player.length >= 2){
    return getPlayersEmbed(allData.player);
  }

  // 통합 전적
  let all_count = 0;
  let all_win = 0;
  // let all_lose = 0; // 현재 미사용
  let max_count = 0;
  let all_win_rate = 0;
  let thumbs_up_str = ":thumbsup:";
  let line_desc = "";
  let all_desc = "";

  allData.record_data.forEach((data) => {
    all_count += data.total_count || 0;
    all_win += data.win || 0;
    // all_lose += data.lose || 0; 현재 미사용

    if (data.total_count > max_count) {
      max_count = data.total_count;
    }
  });

  allData.record_data.forEach((data) => {
    // 제일 판수 많은 포지션에 thumbs up 이모지 추가
    if (data.total_count === max_count) {
      line_desc += thumbs_up_str;
    }
    line_desc += stringUtils.makeStat(
      data.position,
      data.win,
      data.win_rate,
      data.kda
    );
  });

  if (all_count > 0) {
    all_win_rate = ((all_win / all_count) * 100).toFixed(2);
  }

  all_desc = `통합전적 - ${all_count}전 ${all_win}승/${all_win_rate}% \n`;

  // 이번달 전적
  let month_desc = "";

  allData.month_data.forEach((data) => {
    month_desc = stringUtils.makeStat(
      "이번달 전적",
      data.win,
      data.win_rate,
      data.kda
    );
  });

  // 최근 전적
  let recent_total = 0;
  let recent_win = 0;
  let recent_lose = 0;
  let color_str = "";
  let recent_value = "";
  let recent_header = "";

  const ten_recent_data = allData.recent_data.slice(0,10);

  ten_recent_data.forEach((data) => {
    recent_total += 1;
    if (data.game_result === "승") {
      recent_win += 1;
      color_str = ":blue_circle:";
    } else {
      recent_lose += 1;
      color_str = ":red_circle:";
    }
    let kda = `${data.kill}/${data.death}/${data.assist}`;
    recent_value += `${color_str} ${data.champ_name} ${kda}\n`;
  });

  recent_header = `최근 ${recent_total}전 ${recent_win}승 ${recent_lose}패 `;

  // 팀워크
  let good_team_header = "팀워크:blue_heart:";
  let good_team_value = "";

  let bad_team_header = "팀워크:broken_heart:";
  let bad_team_value = "";

  let team_data = allData.with_team_data;

  // 팀워크 좋은 순
  let high_team_data = stringUtils.filterAndSortByWinRate(
    team_data,
    52,
    true,
    10
  );
  high_team_data.forEach((data) => {
    good_team_value += stringUtils.makeTeamStat(
      data.riot_name,
      data.win,
      data.lose,
      data.win_rate
    );
  });

  let bad_team_data = stringUtils.filterAndSortByWinRate(
    team_data,
    48,
    false,
    10
  );
  bad_team_data.forEach((data) => {
    bad_team_value += stringUtils.makeTeamStat(
      data.riot_name,
      data.win,
      data.lose,
      data.win_rate
    );
  });

  // 맞라인 상성
  let easy_rival_header = "맞라인:thumbsup:";
  let easy_rival_value = "";

  let hard_rival_header = "맞라인:thumbsdown:";
  let hard_rival_value = "";

  let other_team_data = allData.other_team_data;
  team_data = other_team_data;

  // 맞라인 자주 이기는 순
  let easy_rival_data = stringUtils.filterAndSortByWinRate(
    team_data,
    52,
    true,
    10
  );
  easy_rival_data.forEach((data) => {
    easy_rival_value += stringUtils.makeTeamStat(
      data.riot_name,
      data.win,
      data.lose,
      data.win_rate
    );
  });

  // 맞라인 자주 지는 순
  let hard_rival_data = stringUtils.filterAndSortByWinRate(
    team_data,
    48,
    false,
    10
  );
  hard_rival_data.forEach((data) => {
    hard_rival_value += stringUtils.makeTeamStat(
      data.riot_name,
      data.win,
      data.lose,
      data.win_rate
    );
  });

  // 모스트 픽
  let most_pick_header = "MostPick 10:star:";
  let most_pick_value = "";

  let most_pick_data = allData.most_pick_data.slice(0,10);
  most_pick_data.forEach((data) => {
    most_pick_value += `${data.champ_name}: ${data.total_count}판 ${data.win_rate}% kda:${data.kda}\n`;
  });

  let desc = month_desc + "\n" + all_desc + line_desc;

  // 특별 호칭 (변경 필요)
  if (riot_name === "크넹") {
    riot_name = "<:__:1197186572433490090> <:__:1197186590968139836> :crown:";
  }

  const jsonData = {
    title: `${allData.player[0].riot_name}#${allData.player[0].riot_name_tag}`,
    description: desc,
    fields: [
      {
        name: recent_header,
        value: recent_value,
        inline: true,
      },
      {
        name: good_team_header,
        value: good_team_value,
        inline: true,
      },
      {
        name: bad_team_header,
        value: bad_team_value,
        inline: true,
      },
      {
        name: most_pick_header,
        value: most_pick_value,
        inline: true,
      },
      {
        name: easy_rival_header,
        value: easy_rival_value,
        inline: true,
      },
      {
        name: hard_rival_header,
        value: hard_rival_value,
        inline: true,
      },
    ],
  };

  return jsonData;
};

/**
 * @param {String} guild_id
 * @param {String} year
 * @param {String} month
 * @description !통계 게임 Embed
 * @returns
 */
const getStatisticOfGameEmbed = async (guild_id, year, month) => {
  const title = `${year}-${month} 게임 통계`;
  const records = await RecordService.getStatisticOfGame(guild_id, year, month);
  if(records.length === 0){
    throw HttpError.notFound();
  }
  const field_one_header = "판수 20위";
  const field_one_value = arrayUtils.makeStatsList(records.slice(0,20), "game");

  const field_two_header = "승률 20위";
  const top20high = records
  .filter(record => record.total_count >= 20)
  .sort((a,b) => b.win_rate - a.win_rate ).slice(0,20);
  
  let field_two_value = arrayUtils.makeStatsList(top20high, "game_high");

  const jsonData = {
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
      }
    ]
  }
  return jsonData;
};

/**
 * @param {*} guild_id
 * @param {*} year
 * @param {*} month
 * @description !클랜통계 Embed
 * @returns
 */
const getStatisticOfGameAllMemberEmbed = async (guild_id, year, month) => {
  const title = `${year}-${month} \n`;
  let str = ""
  const records = await RecordService.getStatisticOfGame(guild_id, year, month);
  if(records.length === 0){
    throw HttpError.notFound();
  }
  records.forEach((record) => {
    str += `${record.riot_name} ${record.total_count}판 \n`;
  });

  str = title + str;
  return str;
}

/**
 * @param {*} position
 * @param {*} guild_id
 * @description !라인 Embed
 * @returns
 */
const getWinRateByPositionEmbed = async (position, guild_id) => {
  const records = await RecordService.getWinRateByPosition(position, guild_id);
  if (records.length === 0 ){
    throw HttpError.notFound();
  }

  const title = `${position} 라인`;
  let desc = "";

  records.forEach((record, index) => {
    let prefix = "";
    switch (index + 1) {
      case 1:
        prefix = ":one: ";
        break;
      case 2:
        prefix = ":two: ";
        break;
      case 3:
        prefix = ":three: ";
        break;
      case 4:
        prefix = ":four: ";
        break;
      case 5:
        prefix = ":five: ";
        break;
      default:
        prefix = `${index + 1}. `;
    }
    desc += `${prefix}${record.riot_name}${stringUtils.makeStat('', record.win, record.win_rate, record.kda)}`;
});

  const jsonData = {
    title: title,
    description: desc,
    fields: []
  }
  return jsonData;
};

/**
 * @param {*} game_id
 * @param {*} guild_id
 * @description !결과 Embed
 * @returns
 */
const getRecordByGameEmbed = async (game_id, guild_id) => {
  const game_data = await RecordService.getRecordByGame(game_id, guild_id);
  if (game_data.length === 0) {
    throw HttpError.notFound();
  }

  let dto = game_data[0];

  let title = game_id;
  let blue_team_field = stringUtils.setLineFieldHeader(dto, "blue");
  let red_team_field = stringUtils.setLineFieldHeader(dto, "red");

  let blue_team_value = arrayUtils.setLineValue(game_data, "blue");
  let red_team_value = arrayUtils.setLineValue(game_data, "red");

  const jsonData = {
    title: title,
    description: undefined,
    fields: [
      {
        name: blue_team_field,
        value: blue_team_value,
        inline: false,
      },
      {
        name: red_team_field,
        value: red_team_value,
        inline: false,
      },
    ],
  };
  return jsonData;
};

/**
 * @param {*} riot_name
 * @param {*} riot_name_tag
 * @param {*} guild_id
 * @description !최근전적 Embed
 * @returns
 */
const getRecentGamesByRiotNameEmbed = async (riot_name, riot_name_tag, guild_id) => {
  const recent_data = await RecordService.getRecentGamesByRiotName(
    riot_name,
    riot_name_tag,
    guild_id
  );

  //player가 없다면 그대로 return 
  if (!recent_data.player){
    return recent_data;
  }
  // 계정 조회 2건 이상일 경우
  if (recent_data.player.length >= 2){
    return getPlayersEmbed(recent_data.player);
  }

  let title = `${recent_data.player.riot_name}#${recent_data.player.riot_name_tag} 최근 상세 전적`;
  let desc_value = "";

  recent_data.records.slice(0,10).forEach((data) => {
    if (data.game_result === "승") {
      desc_value += ":blue_circle:";
    } else {
      desc_value += ":red_circle:";
    }
    desc_value += `${data.game_id} ${data.game_team} ${data.position} ${data.champ_name} ${data.kill}/${data.death}/${data.assist} 핑와:${data.vision_bought} 피해량:${data.total_damage_champions} \n`;
  });

  const jsonData = {
    title: title,
    description: desc_value,
    fields: [],
  };
  return jsonData;
};

/**
 * @param {*} champ_name
 * @param {*} guild_id
 * @description !장인 Embed
 * @returns
 */
const getMasterOfChampionEmbed = async (champ_name, guild_id) => {
  const champ_data = await RecordService.getMasterOfChampion(
    champ_name,
    guild_id
  );
  if (champ_data.length === 0) {
    throw HttpError.notFound();
  }

  let title = champ_name;
  let field_one_name = "판수 순";
  let field_one_value = "";

  let field_two_name = "승률 순(10판 이상)";
  let field_two_value = "";

  let count_records = champ_data.slice(0, 10);

  count_records.forEach((data) => {
    field_one_value += stringUtils.makeAllStat(
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
    field_two_value += stringUtils.makeStat(
      data.riot_name,
      data.win,
      data.win_rate,
      data.kda
    );
  });

  const jsonData = {
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
 * @param {*} guild_id
 * @param {*} year
 * @param {*} month
 * @description !통계 챔프 Embed
 * @returns
 */
const getStatisticOfChampionEmbed = async (guild_id, year, month) => {
  const title = `${year}-${month} 챔프 통계`;
  const records = await RecordService.getStatisticOfChampion(guild_id, year, month);
  if(records.length === 0){
    throw HttpError.notFound();
  }

  let field_one_header = "인기 챔프:star:";
  let field_one_value = arrayUtils.makeStatsList(records.slice(0,15), "champ");

  let field_two_header = "1티어:partying_face:";
  let field_two_value = arrayUtils.makeStatsList(records.filter(record => record.total_count >= 20).sort((a,b) => (b.win_rate - a.win_rate)).slice(0,15), "champ");

  let field_three_header = "5티어:scream:"
  let field_three_value = arrayUtils.makeStatsList(records.filter(record => record.total_count >= 20).sort((a,b) => (a.win_rate - b.win_rate)).slice(0,15), "champ");

  const jsonData = {
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

/**
 * @param {*} accounts
 * @description 계정조회 2명 이상일 경우
 * @returns
 */
const getPlayersEmbed = (accounts) => {
  let desc = "";
  accounts.forEach((account, index) => {
    desc += `${account.riot_name}#${account.riot_name_tag} \n`;
  });
  const jsonData = {
    title: "검색결과",
    description: desc,
    fields: null,
    color: 0x0099ff,
  };
  return jsonData;
}

module.exports = {
  getAllRecordEmbed,
  getStatisticOfGameEmbed,
  getStatisticOfGameAllMemberEmbed,
  getWinRateByPositionEmbed,
  getRecordByGameEmbed,
  getRecentGamesByRiotNameEmbed,
  getMasterOfChampionEmbed,
  getStatisticOfChampionEmbed,
};