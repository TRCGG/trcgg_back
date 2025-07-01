/**
 * 전적 Mapper
 */
const db = require('../db');

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
             ${selectWinRateAndKdaSql('pg',true)}
        FROM Player_game AS pg
        LEFT JOIN Player AS p ON pg.player_id = p.player_id
       WHERE p.riot_name = $1
         AND p.guild_id = $2
         AND p.delete_yn = 'N'
         AND pg.delete_yn = 'N'
    `
  const params = [riot_name, guild_id];
  if(riot_name_tag) {
    query += `AND p.riot_name_tag = $3`;
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
             ${selectWinRateAndKdaSql('pg',true)}
        FROM Player_game AS pg
        JOIN Player AS p ON pg.player_id = p.player_id
       WHERE p.riot_name = $1
         AND p.guild_id = $2
         AND p.delete_yn = 'N'
         AND pg.delete_yn = 'N'
         AND TO_CHAR(pg.game_date, 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM')
         `
  const params = [riot_name, guild_id]
  if(riot_name_tag) {
    query += `AND p.riot_name_tag = $3 `;
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
             p.player_id,
             p.riot_name,
             ${selectWinRateAndKdaSql('pg',true)}
        FROM Player_game AS pg
        JOIN Player AS p ON pg.player_id = p.player_id
       WHERE p.guild_id = $1
         AND p.delete_yn = 'N'
         AND pg.delete_yn = 'N'
         AND TO_CHAR(pg.game_date, 'YYYY') = $2
         AND TO_CHAR(pg.game_date, 'MM') = $3
       GROUP BY p.player_id, p.riot_name
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
  const params = [riot_name, riot_name_tag, guild_id];
  let query = 
    `
      SELECT 
             K.riot_name,
             ${selectWinRateAndKdaSql('B', null)}
        FROM Player_game AS A
        JOIN Player AS K ON A.player_id = K.player_id
       INNER JOIN (
                  SELECT pg.game_id, pg.game_team, pg.game_result, p.guild_id
                    FROM Player_game AS pg
                    JOIN Player AS p ON pg.player_id = p.player_id
                   WHERE p.riot_name = $1
                     AND p.riot_name_tag = $2
                     AND p.guild_id = $3
                     AND p.delete_yn = 'N'
                     AND pg.delete_yn = 'N'
                     AND (
                          (TO_CHAR(pg.game_date, 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM')) 
                          OR 
                          (TO_CHAR(pg.game_date, 'YYYY-MM') = TO_CHAR(NOW() - INTERVAL '1 month', 'YYYY-MM'))
                         )
                  ) B
          ON A.game_team = B.game_team 
         AND K.guild_id = B.guild_id
         AND A.game_id = B.game_id 
         AND NOT (K.riot_name = $1 AND K.riot_name_tag = $2)
         AND K.delete_yn = 'N'
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
  const params = [riot_name, riot_name_tag, guild_id];
  let query = 
    `
      SELECT 
              K.riot_name,
              ${selectWinRateAndKdaSql('B', null)}
        FROM Player_game AS A
        JOIN Player AS K ON A.player_id = K.player_id
       INNER JOIN (
                  SELECT pg.game_id, pg.game_team, pg.game_result, p.guild_id, pg.position
                    FROM Player_game AS pg
                    JOIN Player AS p ON pg.player_id = p.player_id
                   WHERE p.riot_name = $1
                     AND p.riot_name_tag = $2
                     AND p.guild_id = $3
                     AND p.delete_yn = 'N'
                     AND pg.delete_yn = 'N' 
                     AND (
                          (TO_CHAR(pg.game_date, 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM')) 
                          OR 
                          (TO_CHAR(pg.game_date, 'YYYY-MM') = TO_CHAR(NOW() - INTERVAL '1 month', 'YYYY-MM'))
                         )
                    ) B
          ON A.game_team != B.game_team 
         AND K.guild_id = B.guild_id
         AND A.game_id = B.game_id 
         AND NOT (K.riot_name = $1 AND K.riot_name_tag = $2)
         AND K.delete_yn = 'N'
         AND A.position = B.position
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
             ${selectWinRateAndKdaSql('pg',true)}
        FROM Player_game AS pg  
        JOIN Player AS p ON pg.player_id = p.player_id
       WHERE pg.position = $1
         AND p.guild_id = $2
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
             c.champ_name_eng, 
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
       WHERE LOWER(pg.game_id) = LOWER($1)
         AND p.guild_id = $2
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
             c.champ_name_eng, 
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
       WHERE p.riot_name = $1
    `;
  const params = [riot_name, guild_id];
  if(riot_name_tag) {
    query += `AND p.riot_name_tag = $3 `;
    params.push(riot_name_tag);
  }
  query +=
    `
         AND p.guild_id = $2
         AND p.delete_yn = 'N'         
         AND pg.delete_yn = 'N'
       ORDER BY pg.game_date DESC
       LIMIT 20
    `;    
    
  const result = await db.query(query, params);  
  return result;
};

/**
 * @param {*} riot_name 
 * @param {*} riot_name_tag
 * @param {*} guild_id 
 * @returns List<Player_game>
 * @description 모스트 픽 조회
 */
const getMostPicks = async (riot_name, riot_name_tag, guild_id) => {
  let query = 
    `
      SELECT 
             c.champ_name,
             c.champ_name_eng, 
             ${selectWinRateAndKdaSql('pg',true)}
        FROM Player_game AS pg  
        JOIN Player AS p ON pg.player_id = p.player_id
        JOIN Champion c ON pg.champion_id = c.champion_id
       WHERE p.riot_name = $1
       
    `
  const params = [riot_name, guild_id];    
  if(riot_name_tag) {
    query += `AND p.riot_name_tag = $3 `;
    params.push(riot_name_tag);
  }
  query += 
    `
         AND p.guild_id = $2
         AND pg.delete_yn = 'N'
       GROUP BY c.champ_name, c.champ_name_eng
       ORDER BY total_count DESC 
    `
  const result = await db.query(query, params);
  return result;
};

/**
 * @param {*} champ_name 
 * @param {*} guild_id 
 * @returns List<Player_game>
 * @description 장인 조회
 */
const getMasterOfChampion = async (champ_name, guild_id) => {
  const result = await db.query(
    `
      SELECT 
             p.riot_name, 
             ${selectWinRateAndKdaSql('pg',true)}
        FROM Player_game AS pg  
        JOIN Player AS p ON pg.player_id = p.player_id
        JOIN Champion c ON pg.champion_id = c.champion_id 
       WHERE c.champ_name = $1
         AND p.guild_id = $2
         AND p.delete_yn = 'N'
       GROUP BY p.riot_name 
       ORDER BY total_count DESC
    `,
    [champ_name, guild_id]
  );
  return result;
};

/**
 * @param {*} guild_id 
 * @param {*} year 
 * @param {*} month 
 * @returns List<Player_game>
 * @description 챔피언 통계 조회
 */
const getStatisticOfChampion = async (guild_id, year, month) => {
  const result = await db.query(
    `
      SELECT 
             c.champ_name,
             c.champ_name_eng,
             ${selectWinRateAndKdaSql('pg', null)}
        FROM Player_game AS pg  
        JOIN Player AS p ON pg.player_id = p.player_id
        JOIN Champion c ON pg.champion_id = c.champion_id
       WHERE pg.delete_yn = 'N'
         AND p.guild_id = $1
         AND TO_CHAR(pg.game_date, 'YYYY') = $2
         AND TO_CHAR(pg.game_date, 'MM') = $3
       GROUP BY c.champ_name, c.champ_name_eng
       ORDER BY total_count DESC
    `,
    [guild_id, year, month]
  );
  return result;
};

/**
 * 내부함수 - 승률, KDA 조회 SQL
 * @param {*} table 
 * @param {*} kda 
 * @returns 
 */
const selectWinRateAndKdaSql = (table, kda) => {
  let sql = 
  `
      COUNT(1)::INTEGER AS total_count,
      COUNT(CASE WHEN ${table}.game_result = '승' THEN 1 END)::INTEGER AS win,
      COUNT(CASE WHEN ${table}.game_result = '패' THEN 1 END)::INTEGER AS lose,
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
  getRecentGamesByRiotName,
  getMostPicks,
  getMasterOfChampion,
  getStatisticOfChampion,
}; 