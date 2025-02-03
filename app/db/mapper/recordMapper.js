/**
 * 전적 Mapper
 */
const db = require('../db');
const commonQuery = require('./commonSql')

/**
 * @param {*} riot_name 
 * @param {*} riot_name_tag 
 * @param {*} guild_id 
 * @returns List<Player>
 * @description 전적 검색을 위한 계정 조회
 */
const getPlayerForSearch = async (riot_name, riot_name_tag, guild_id) => {
  let query = 
    `
      SELECT
             p.player_id,
             p.riot_name,
             p.riot_name_tag,
             p.guild_id,
             p.puuid
        FROM Player AS p
       WHERE p.delete_yn = 'N'
         AND LOWER(p.riot_name) = LOWER(?)
         AND p.guild_id = ?
         AND p.main_player_id IS NULL
    `
  const params = [riot_name, guild_id];

  if(riot_name_tag) {
    query += `AND LOWER(p.riot_name_tag) = LOWER(?) `
    params.push(riot_name_tag);
  }
  const result = await db.query(query, params);
  return result;
}

/**
 * @param {*} riot_name 
 * @param {*} riot_name_tag 
 * @param {*} guild_id 
 * @returns List<Player_game>
 * @description 전체 라인별 전적 조회
 */
const getLineRecord = async (riot_name, riot_name_tag, guild_id) => {
  let query = 
    `
      SELECT 
             pg.position,
             ${commonQuery.selectWinRateAndKdaSql('pg',true)}
        FROM Player_game AS pg
        LEFT JOIN Player AS p ON pg.player_id = p.player_id
       WHERE p.riot_name = ?
         AND p.guild_id = ?
         AND p.delete_yn = 'N'
         AND pg.delete_yn = 'N'
    `
  const params = [riot_name, guild_id];
  if(riot_name_tag) {
    query += `AND p.riot_name_tag = ? `;
    params.push(riot_name_tag);
  }
  query += 
  `
       GROUP BY pg.position
       ORDER BY CASE pg.position
                    WHEN 'TOP' THEN 1
                    WHEN 'JUG' THEN 2
                    WHEN 'MID' THEN 3
                    WHEN 'ADC' THEN 4
                    WHEN 'SUP' THEN 5
                END
  `;
    
  const result = await db.query(query, params);
  return result;
};

/**
 * @param {*} riot_name 
 * @param {*} riot_name_tag 
 * @param {*} guild_id 
 * @returns List<Player_game>
 * @description 최근 한 달 전적 조회
 */
const getRecentMonthRecord = async (riot_name, riot_name_tag, guild_id) => {
  let query = 
    `
      SELECT 
             ${commonQuery.selectWinRateAndKdaSql('pg',true)}
        FROM Player_game AS pg
        JOIN Player AS p ON pg.player_id = p.player_id
       WHERE p.riot_name = ?
         AND p.guild_id = ?
         AND p.delete_yn = 'N'
         AND pg.delete_yn = 'N'
         AND strftime('%Y-%m', pg.game_date) = strftime('%Y-%m', 'now', 'localtime')
         `
  const params = [riot_name, guild_id]
  if(riot_name_tag) {
    query += `AND p.riot_name_tag = ? `;
    params.push(riot_name_tag);
  }

  const result = await db.query(query, params);
  return result;
};

/**
 * @param {*} guild_id 
 * @param {*} year 
 * @param {*} month 
 * @returns List<Player_game>
 * @description 게임 통계 조회
 */
const getStatisticOfGame = async (guild_id, year, month) => {
  const result = await db.query(
    `
      SELECT 
             p.riot_name,
             ${commonQuery.selectWinRateAndKdaSql('pg',true)}
        FROM Player_game AS pg
        JOIN Player AS p ON pg.player_id = p.player_id
       WHERE p.guild_id = ?
         AND p.delete_yn = 'N'
         AND pg.delete_yn = 'N'
         AND strftime('%Y', pg.game_date) = ?
         AND strftime('%m', pg.game_date) = ?
       GROUP BY p.riot_name
       ORDER BY total_count DESC;
    `,
    [guild_id, year, month]
  );
  return result;
};

/**
 * @param {*} riot_name 
 * @param {*} riot_name_tag 
 * @param {*} guild_id 
 * @returns List<Player_game>
 * @description 시너지 팀원 조회 (최근 2 달)
 */
const getSynergisticTeammates = async (riot_name, riot_name_tag, guild_id) => {
  const params = [riot_name, guild_id];
  let query = 
    `
      SELECT 
             K.riot_name,
             ${commonQuery.selectWinRateAndKdaSql('B', null)}
        FROM Player_game AS A
        JOIN Player AS K ON A.player_id = K.player_id
       INNER JOIN (
                  SELECT pg.game_id, pg.game_team, pg.game_result, p.guild_id
                    FROM Player_game AS pg
                    JOIN Player AS p ON pg.player_id = p.player_id
                   WHERE p.riot_name = ?1
                     AND p.guild_id = ?2
                     AND p.delete_yn = 'N'
                     AND pg.delete_yn = 'N'

    `
  if(riot_name_tag) {
    query += `       AND p.riot_name_tag = ?3 `;
  }
  
  query += 
    `
                     AND (
                          (strftime('%Y-%m', pg.game_date) = strftime('%Y-%m', 'now', 'localtime')) 
                          OR 
                          (strftime('%Y-%m', pg.game_date) = strftime('%Y-%m', 'now', 'localtime', '-1 month'))
                         )
                  ) B
          ON A.game_team = B.game_team 
         AND K.guild_id = B.guild_id
         AND A.game_id = B.game_id 
         AND K.riot_name != ?1
         AND K.delete_yn = 'N'
    `
  if(riot_name_tag) {
    query += `AND K.riot_name_tag != ?3 `;
    params.push(riot_name_tag);
  }
  query +=
    `
       GROUP BY K.riot_name
      HAVING COUNT(K.riot_name) >= 5
       ORDER BY win_rate DESC
    `;
  const result = await db.query(query, params);
  return result;
};

/**
 * @param {*} riot_name 
 * @param {*} riot_name_tag
 * @param {*} guild_id 
 * @returns List<Player_game>
 * @description 인간상성 조회 (맞라이너)
 */
const getNemesis = async (riot_name, riot_name_tag, guild_id) => {
  const params = [riot_name, guild_id];
  let query = 
    `
      SELECT 
              K.riot_name,
              ${commonQuery.selectWinRateAndKdaSql('B', null)}
        FROM Player_game AS A
        JOIN Player AS K ON A.player_id = K.player_id
       INNER JOIN (
                  SELECT pg.game_id, pg.game_team, pg.game_result, p.guild_id, pg.position
                    FROM Player_game AS pg
                    JOIN Player AS p ON pg.player_id = p.player_id
                   WHERE p.riot_name = ?1
                     AND p.guild_id = ?2
                     AND p.delete_yn = 'N'
                     AND pg.delete_yn = 'N'

                  
    `
  if(riot_name_tag) {
    query += `       AND p.riot_name_tag = ?3 `;
  }
  query += 
    `
                     AND (
                          (strftime('%Y-%m', pg.game_date) = strftime('%Y-%m', 'now', 'localtime')) 
                          OR 
                          (strftime('%Y-%m', pg.game_date) = strftime('%Y-%m', 'now', 'localtime', '-1 month'))
                         )
                    ) B
          ON A.game_team != B.game_team 
         AND K.guild_id = B.guild_id
         AND A.game_id = B.game_id 
         AND K.riot_name != ?1
         AND K.delete_yn = 'N'
         AND A.delete_yn = 'N'
         AND A.position = B.position

    `
  if(riot_name_tag) {
    query += `AND K.riot_name_tag != ?3 `;
    params.push(riot_name_tag);
  }
  query +=
    `
       GROUP BY K.riot_name
      HAVING COUNT(K.riot_name) >= 5
       ORDER BY win_rate DESC    
    `
  const result = await db.query(query, params);
  return result;
};

/**
 * @param {*} position 
 * @param {*} guild_id 
 * @returns List<Player_game>
 * @description 포지션별 승률 조회
 */
const getWinRateByPosition = async (position, guild_id) => {
  const result = await db.query(
    `
      SELECT 	
             pg.position,
             p.riot_name,
             ${commonQuery.selectWinRateAndKdaSql('pg',true)}
        FROM Player_game AS pg  
        JOIN Player AS p ON pg.player_id = p.player_id
       WHERE pg.position = ?
         AND p.guild_id = ?
         AND p.delete_yn = 'N'         
         AND pg.delete_yn = 'N'
       GROUP BY pg.position, p.riot_name 
      HAVING COUNT(p.riot_name) >= 20
       ORDER BY win_rate DESC
       LIMIT 15   
    `,
    [position, guild_id]
  );
  return result;
};

/**
 * @param {*} game_id 
 * @param {*} guild_id 
 * @returns List<Player_game>
 * @description 게임 상세 조회
 */
const getRecordByGame = async (game_id, guild_id) => {
  const result = await db.query(
    `
      SELECT 
             pg.game_id, 
             p.riot_name, 
             c.champ_name, 
             pg.position, 
             pg.kill, 
             pg.death, 
             pg.assist, 
             pg.game_result, 
             pg.game_team,
             pg.total_damage_champions,
             pg.vision_bought,
             pg.penta_kills
        FROM Player_game AS pg  
        JOIN Player AS p ON pg.player_id = p.player_id
        JOIN Champion c ON pg.champion_id = c.champion_id
       WHERE LOWER(pg.game_id) = LOWER(?)
         AND p.guild_id = ?
         AND p.delete_yn = 'N'         
         AND pg.delete_yn = 'N'
       ORDER BY pg.game_team,
             CASE pg.position
                  WHEN 'TOP' THEN 1
                  WHEN 'JUG' THEN 2
                  WHEN 'MID' THEN 3
                  WHEN 'ADC' THEN 4
                  WHEN 'SUP' THEN 5
              END
    `,
    [game_id, guild_id]
  );
  return result;
};

/**
 * @param {*} riot_name 
 * @param {*} riot_name_tag
 * @param {*} guild_id 
 * @returns List<Player_game>
 * @description 최근 20 게임 조회
 */
const getRecentGamesByRiotName = async (riot_name, riot_name_tag, guild_id) => {

  let query = 
    `
      SELECT 
             pg.game_id, 
             p.riot_name, 
             c.champ_name, 
             pg.position, 
             pg.kill, 
             pg.death, 
             pg.assist, 
             pg.game_result, 
             pg.game_team,
             pg.total_damage_champions,
             pg.vision_bought,
             pg.penta_kills
        FROM Player_game AS pg  
        JOIN Player AS p ON pg.player_id = p.player_id
        JOIN Champion c ON pg.champion_id = c.champion_id
       WHERE p.riot_name = ?1
    `;
  const params = [riot_name, guild_id];
  if(riot_name_tag) {
    query += `AND p.riot_name_tag = ?3 `;
    params.push(riot_name_tag);
  }
  query +=
    `
         AND p.guild_id = ?2
         AND p.delete_yn = 'N'         
         AND pg.delete_yn = 'N'
       ORDER BY pg.game_date DESC
       LIMIT 20
    `;    
    
  const result = await db.query(query, params);  
  return result;
};

module.exports = {
  getPlayerForSearch,
  getLineRecord,
  getRecentMonthRecord,
  getStatisticOfGame,
  getSynergisticTeammates,
  getNemesis,
  getWinRateByPosition,
  getRecordByGame,
  getRecentGamesByRiotName,
}; 