/**
 * 전적 검색 Service
 */
const recordMapper = require("../db/mapper/recordMapper");
const championMapper = require("../db/mapper/championMapper");
const appUtil = require("../appUtils");
const embedUtil = require('../embed');

/**
 * !전적
 * @param {*} riot_name
 * @param {*} guild_Id
 * @returns
 */
const getAllRecord = async (riot_name, guild_id) => {
  const allData = {
    record_data: await recordMapper.getLineRecord(riot_name, guild_id),
    month_data: await recordMapper.getRecentMonthRecord(riot_name, guild_id),
    recent_data: await recordMapper.getRecentTenGamesByRiotName(
      riot_name,
      guild_id
    ),
    with_team_data: await recordMapper.getSynergisticTeammates(
      riot_name,
      guild_id
    ),
    other_team_data: await recordMapper.getNemesis(riot_name, guild_id),
    most_pick_data: await championMapper.getMostPicks(riot_name, guild_id),
  };

  if (allData.record_data.length === 0) {
    return appUtil.notFoundResponse();
  }

  // 통합 전적
  let all_count = 0;
  let all_win = 0;
  let all_lose = 0;
  let max_count = 0;
  let all_win_rate = 0;
  let thumbs_up_str = ":thumbsup:";
  let line_desc = "";
  let all_desc = "";

  allData.record_data.forEach((data) => {
    all_count += data.total_count || 0;
    all_win += data.win || 0;
    all_lose += data.lose || 0;

    if (data.total_count > max_count) {
      max_count = data.total_count;
    }
  });

  allData.record_data.forEach((data) => {
    // 제일 판수 많은 포지션에 thumbs up 이모지 추가
    if (data.total_count == max_count) {
      line_desc += thumbs_up_str;
    }
    line_desc += embedUtil.makeStat(
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
    month_desc = embedUtil.makeStat(
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

  allData.recent_data.forEach((data) => {
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
  let high_team_data = embedUtil.filterAndSortByWinRate(
    team_data,
    52,
    true,
    10
  );
  high_team_data.forEach((data) => {
    good_team_value += embedUtil.makeTeamStat(
      data.riot_name,
      data.win,
      data.lose,
      data.win_rate
    );
  });

  let bad_team_data = embedUtil.filterAndSortByWinRate(
    team_data,
    48,
    false,
    10
  );
  bad_team_data.forEach((data) => {
    bad_team_value += embedUtil.makeTeamStat(
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
  let easy_rival_data = embedUtil.filterAndSortByWinRate(
    team_data,
    52,
    true,
    10
  );
  easy_rival_data.forEach((data) => {
    easy_rival_value += embedUtil.makeTeamStat(
      data.riot_name,
      data.win,
      data.lose,
      data.win_rate
    );
  });

  // 맞라인 자주 지는 순
  let hard_rival_data = embedUtil.filterAndSortByWinRate(
    team_data,
    48,
    false,
    10
  );
  hard_rival_data.forEach((data) => {
    hard_rival_value += embedUtil.makeTeamStat(
      data.riot_name,
      data.win,
      data.lose,
      data.win_rate
    );
  });

  // 모스트 픽
  let most_pick_header = "MostPick 10:star:";
  let most_pick_value = "";

  let most_pick_data = allData.most_pick_data;
  most_pick_data.forEach((data) => {
    most_pick_value += `${data.champ_name}: ${data.total_count}판 ${data.win_rate}% kda:${data.kda}\n`;
  });

  let desc = month_desc + "\n" + all_desc + line_desc;

  // 특별 호칭 (변경 필요)
  if (riot_name == "크넹") {
    riot_name = "<:__:1197186572433490090> <:__:1197186590968139836> :crown:";
  }

  jsonData = {
    title: riot_name,
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

// 라인별 전적 조회
const getLineRecord = async (riot_name, guild_id) => {
  return await recordMapper.getLineRecord(riot_name, guild_id);
};

// 이번달 전적 조회
const getRecentMonthRecord = async (riot_name, guild_id) => {
  return await recordMapper.getRecentMonthRecord(riot_name, guild_id);
};

/**
 * !통계 게임
 * @param {*} guild_id
 * @param {*} year
 * @param {*} month
 * @returns
 */
const getStatisticOfGame = async (guild_id, year, month) => {
  return await recordMapper.getStatisticOfGame(guild_id, year, month);
};

// 팀워크
const getSynergisticTeammates = async (riot_name, guild_id) => {
  return await recordMapper.getSynergisticTeammates(riot_name, guild_id);
};

// 맞라인
const getNemesis = async (riot_name, guild_id) => {
  return await recordMapper.getNemesis(riot_name, guild_id);
};

/**
 * !라인
 * @param {*} position
 * @param {*} guild_Id
 * @returns
 */
const getWinRateByPosition = async (position, guild_id) => {
  return await recordMapper.getWinRateByPosition(position, guild_id);
};

/**
 * !결과
 * @param {*} game_id
 * @param {*} guild_Id
 * @returns
 */
const getRecordByGame = async (game_id, guild_id) => {
  const game_data = await recordMapper.getRecordByGame(game_id, guild_id);
  if (game_data.length === 0) {
    return appUtil.notFoundResponse();
  }

  let dto = game_data[0];

  let title = game_id;
  let blue_team_field = embedUtil.setLineFieldHeader(dto, "blue");
  let red_team_field = embedUtil.setLineFieldHeader(dto, "red");

  let blue_team_value = embedUtil.setLineValue(game_data, "blue");
  let red_team_value = embedUtil.setLineValue(game_data, "red");

  jsonData = {
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
 * !최근전적
 * @param {*} riot_name
 * @param {*} guild_Id
 * @returns
 */
const getRecentTenGamesByRiotName = async (riot_name, guild_id) => {
  const recent_data = await recordMapper.getRecentTenGamesByRiotName(
    riot_name,
    guild_id
  );
  if (recent_data.length === 0) {
    return appUtil.notFoundResponse();
  }

  let title = riot_name + "최근 상세 전적";
  let desc_value = "";

  recent_data.forEach((data) => {
    if (data.game_result === "승") {
      desc_value += ":blue_circle:";
    } else {
      desc_value += ":red_circle:";
    }
    desc_value += `${data.game_id} ${data.game_team} ${data.position} ${data.champ_name} ${data.kill}/${data.death}/${data.assist} 핑와:${data.vision_bought} 피해량:${data.total_damage_champions} \n`;
  });

  jsonData = {
    title: title,
    description: desc_value,
    fields: [],
  };
  return jsonData;
};

module.exports = {
  getAllRecord,
  getLineRecord,
  getRecentMonthRecord,
  getStatisticOfGame,
  getSynergisticTeammates,
  getNemesis,
  getWinRateByPosition,
  getRecordByGame,
  getRecentTenGamesByRiotName,
};