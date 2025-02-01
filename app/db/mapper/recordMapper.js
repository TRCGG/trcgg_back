/**
 * 전적 Mapper
 */
const db = require('../db');

/**
 * @param {*} riot_name 
 * @param {*} guild_id 
 * @returns List<league>
 * @description 전체 전적 조회
 */
const getLineRecord = async (riot_name, guild_id) => {
  const result = await db.query(
    `
      SELECT 
             pg.position,
             ${selectWinRateAndKdaSql('pg',true)}
        FROM Player_game pg
        LEFT JOIN Player p ON pg.player_id = p.player_id
       WHERE LOWER(p.riot_name) = LOWER(?1)
         AND p.guild_id = ?2
         AND pg.delete_yn = 'N'
       GROUP BY pg.position
       ORDER BY CASE pg.position
                    WHEN 'TOP' THEN 1
                    WHEN 'JUG' THEN 2
                    WHEN 'MID' THEN 3
                    WHEN 'ADC' THEN 4
                    WHEN 'SUP' THEN 5
                END
    `,
    [riot_name, guild_id]
  );

  return result; // 상태 코드와 데이터를 반환
};

/**
 * @param {*} riot_name 
 * @param {*} guild_id 
 * @returns List<league>
 * @description 최근 한 달 전적 조회
 */
const getRecentMonthRecord = async (riot_name, guild_id) => {
  const result = await db.query(
    `
      SELECT 
             ${selectWinRateAndKdaSql('pg',true)}
        FROM Player_game pg
        JOIN Player p ON pg.player_id = p.player_id
       WHERE LOWER(p.riot_name) = LOWER(?)
         AND p.guild_id = ?
         AND pg.delete_yn = 'N'
         AND strftime('%Y-%m', pg.game_date) = strftime('%Y-%m', 'now', 'localtime')
    `,
    [riot_name, guild_id]
  );

  return result;
};

/**
 * @param {*} guild_id 
 * @param {*} year 
 * @param {*} month 
 * @returns List<league>
 * @description 게임 통계 조회
 */
const getStatisticOfGame = async (guild_id, year, month) => {
  const result = await db.query(
    `
      SELECT 
             p.riot_name,
             ${selectWinRateAndKdaSql('pg',true)}
        FROM Player_game pg
        JOIN Player p ON pg.player_id = p.player_id
       WHERE pg.delete_yn = 'N'
         AND p.guild_id = ?
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
 * @param {*} guild_id 
 * @returns List<league>
 * @description 시너지 팀원 조회 (최근 2 달)
 */
const getSynergisticTeammates = async (riot_name, guild_id) => {
  const result = await db.query(
    `
      SELECT 
             K.riot_name,
             ${selectWinRateAndKdaSql('B', null)}
        FROM Player_game A
        JOIN Player K ON A.player_id = K.player_id
       INNER JOIN (
                  SELECT pg.game_id, pg.game_team, pg.game_result, p.guild_id
                    FROM Player_game pg
                    JOIN Player p ON pg.player_id = p.player_id
                   WHERE LOWER(p.riot_name) = LOWER(?1)
                     AND p.guild_id = ?2
                     AND (
                          (strftime('%Y-%m', pg.game_date) = strftime('%Y-%m', 'now', 'localtime')) 
                          OR 
                          (strftime('%Y-%m', pg.game_date) = strftime('%Y-%m', 'now', 'localtime', '-1 month'))
                         )
                  ) B
          ON A.game_team = B.game_team 
         AND K.guild_id = B.guild_id
         AND A.game_id = B.game_id 
         AND LOWER(K.riot_name) != LOWER(?1)
         AND A.delete_yn = 'N'
       GROUP BY K.riot_name
      HAVING COUNT(K.riot_name) >= 5
       ORDER BY win_rate DESC
    `,
    [riot_name, guild_id]
  );
  return result;
};

/**
 * @param {*} riot_name 
 * @param {*} guild_id 
 * @returns List<league>
 * @description 인간상성 조회 (맞라이너)
 */
const getNemesis = async (riot_name, guild_id) => {
  const result = await db.query(
    `
      SELECT 
              K.riot_name,
              ${selectWinRateAndKdaSql('B', null)}
        FROM Player_game A
        JOIN Player K ON A.player_id = K.player_id
       INNER JOIN (
                  SELECT pg.game_id, pg.game_team, pg.game_result, p.guild_id, pg.position
                    FROM Player_game pg
                    JOIN Player p ON pg.player_id = p.player_id
                   WHERE LOWER(p.riot_name) = LOWER(?1)
                     AND p.guild_id = ?2
                     AND (
                          (strftime('%Y-%m', pg.game_date) = strftime('%Y-%m', 'now', 'localtime')) 
                          OR 
                          (strftime('%Y-%m', pg.game_date) = strftime('%Y-%m', 'now', 'localtime', '-1 month'))
                         )
                  ) B
          ON A.game_team != B.game_team 
         AND K.guild_id = B.guild_id
         AND A.game_id = B.game_id 
         AND LOWER(K.riot_name) != LOWER(?1)
         AND A.delete_yn = 'N'
         AND A.position = B.position
       GROUP BY K.riot_name
      HAVING COUNT(K.riot_name) >= 5
       ORDER BY win_rate DESC
    `,
    [riot_name, guild_id]
  );
  return result;
};

/**
 * @param {*} riot_name 
 * @param {*} guild_id 
 * @returns List<league>
 * @description 포지션별 승률 조회
 */
const getWinRateByPosition = async (position, guild_id) => {
  const result = await db.query(
    `
      SELECT 	
             pg.position,
             p.riot_name,
             ${selectWinRateAndKdaSql('pg',true)}
        FROM Player_game pg  
        JOIN Player p ON pg.player_id = p.player_id
       WHERE pg.position = ?
         AND p.guild_id = ?
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
 * @returns List<league>
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
        FROM Player_game pg  
        JOIN Player p ON pg.player_id = p.player_id
        JOIN Champion c ON pg.champion_id = c.champion_id
       WHERE LOWER(pg.game_id) = LOWER(?)
         AND p.guild_id = ?
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
 * @param {*} guild_id 
 * @returns List<league>
 * @description 최근 10 게임 조회
 */
const getRecentTenGamesByRiotName = async (riot_name, guild_id) => {
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
        FROM Player_game pg  
        JOIN Player p ON pg.player_id = p.player_id
        JOIN Champion c ON pg.champion_id = c.champion_id
       WHERE LOWER(p.riot_name) = LOWER($1)
         AND p.guild_id = $2
         AND pg.delete_yn = 'N'
       ORDER BY pg.game_date DESC
       LIMIT 10
    `,
    [riot_name, guild_id]
  );
  return result;
};

// 공용 쿼리
const selectWinRateAndKdaSql = (table, kda) => {
  let sql = 
  `
      COUNT(1) AS total_count,
      COUNT(CASE WHEN ${table}.game_result = '승' THEN 1 END) AS win,
      COUNT(CASE WHEN ${table}.game_result = '패' THEN 1 END) AS lose,
      CASE 
        WHEN COUNT(1) = 0 THEN 0
        ELSE ROUND(COUNT(CASE WHEN ${table}.game_result = '승' THEN 1 END) * 100.0 / NULLIF(COUNT(1), 0), 2) 
      END AS win_rate
  `;
  if(kda){
    sql += 
    ` 
      ,
      CASE 
        WHEN COALESCE(SUM(${table}.death), 0) = 0 THEN 9999
        ELSE ROUND((COALESCE(SUM(${table}.kill), 0) + COALESCE(SUM(${table}.assist), 0)) * 1.0 / NULLIF(COALESCE(SUM(${table}.death), 0), 0), 2) 
      END AS kda
    `
  }
  return sql;
}

module.exports = {
  getLineRecord,
  getRecentMonthRecord,
  getStatisticOfGame,
  getSynergisticTeammates,
  getNemesis,
  getWinRateByPosition,
  getRecordByGame,
  getRecentTenGamesByRiotName,
}; 