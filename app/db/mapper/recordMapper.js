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
const getAllRecord = async (riot_name, guild_id) => {
  const result = await db.query(
    `
      SELECT 
              position,
              COUNT(*) AS total_count,
              COUNT(CASE WHEN game_result = '승' THEN 1 END) AS win,
              COUNT(CASE WHEN game_result = '패' THEN 1 END) AS lose,
              CASE WHEN COUNT(*) = 0 THEN 0
                   ELSE ROUND(COUNT(CASE WHEN game_result = '승' THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0) * 100 ,2)
               END AS win_rate,
              CASE WHEN SUM(death) = 0 THEN 9999
                   ELSE ROUND((SUM(kill) + SUM(assist))::NUMERIC / NULLIF(SUM(death), 0), 2) 
               END AS kda
        FROM league
       WHERE LOWER(riot_name) = LOWER($1)
         AND guild_id = $2
         AND delete_yn = 'N'
       GROUP BY position
       ORDER BY CASE position
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
             COUNT(*) AS total_count,
             COUNT(CASE WHEN game_result = '승' THEN 1 END) AS win,
             COUNT(CASE WHEN game_result = '패' THEN 1 END) AS lose,
             CASE WHEN COUNT(*) = 0 THEN 0
                  ELSE ROUND(COUNT(CASE WHEN game_result = '승' THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0) * 100 ,2)
              END AS win_rate,
             CASE WHEN SUM(death) = 0 THEN 9999
                  ELSE ROUND((SUM(kill) + SUM(assist))::NUMERIC / NULLIF(SUM(death), 0), 2) 
              END AS kda
        FROM league
       WHERE LOWER(riot_name) = LOWER($1)
         AND guild_id = $2 
         AND delete_yn = 'N'
         AND game_date >= DATE_TRUNC('month', CURRENT_TIMESTAMP)
         AND game_date < DATE_TRUNC('month', CURRENT_TIMESTAMP) + INTERVAL '1 month'
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
             riot_name,
             COUNT(riot_name) AS total_count,
             COUNT(CASE WHEN game_result = '승' THEN 1 END) AS win,
             COUNT(CASE WHEN game_result = '패' THEN 1 END) AS lose,
             ROUND(COUNT(CASE WHEN game_result = '승' THEN 1 END)::numeric / COUNT(*)*100,2) AS win_rate,
             CASE WHEN SUM(death) = 0 THEN 9999
                  ELSE ROUND((SUM(kill) + SUM(assist))::NUMERIC / NULLIF(SUM(death), 0), 2) 
              END AS kda
        FROM LEAGUE 
       WHERE delete_yn = 'N'
         AND guild_id = $1
         AND EXTRACT(YEAR FROM game_date) = $2
         AND EXTRACT(MONTH FROM game_date) = $3
       GROUP BY riot_name
       ORDER BY total_count DESC
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
             A.riot_name,
             COUNT(A.riot_name) AS total_count,
             COUNT(CASE WHEN B.game_result = '승' THEN 1 END) AS win,
             COUNT(CASE WHEN B.game_result = '패' THEN 1 END) AS lose,
             ROUND(COUNT(CASE WHEN B.game_result = '승' THEN 1 END)::NUMERIC / COUNT(*)*100,2) AS win_rate
        FROM league A 
       INNER JOIN  
            (
              SELECT * 
              FROM league 
               WHERE LOWER(riot_name) = LOWER($1)
                 AND guild_id = $2
                 AND (
                         (
                           EXTRACT(YEAR FROM game_date) = EXTRACT(YEAR FROM CURRENT_DATE)
                           AND EXTRACT(MONTH FROM game_date) = EXTRACT(MONTH FROM CURRENT_DATE)
                         )
                      OR
                         (
                           EXTRACT(YEAR FROM game_date) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')
                           AND EXTRACT(MONTH FROM game_date) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')
                         )
                     )
            ) B
          ON A.game_team = B.game_team 
         AND A.guild_id = B.guild_id
         AND A.game_id = B.game_id 
         AND LOWER(A.riot_name) != LOWER($1)
         AND A.delete_yn = 'N'
       GROUP BY A.riot_name
      HAVING COUNT(A.riot_name) >= 5
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
             A.riot_name,
             COUNT(A.riot_name) AS total_count,
             COUNT(CASE WHEN B.game_result = '승' THEN 1 END) AS win,
             COUNT(CASE WHEN B.game_result = '패' THEN 1 END) AS lose,
             ROUND(COUNT(CASE WHEN B.game_result = '승' THEN 1 END)::NUMERIC / COUNT(*)*100,2) AS win_rate
        FROM league A 
       INNER JOIN  
            (
              SELECT * 
                FROM league 
               WHERE LOWER(riot_name) = LOWER($1)
                 AND guild_id = $2
                 AND (
                         (
                           EXTRACT(YEAR FROM game_date) = EXTRACT(YEAR FROM CURRENT_DATE)
                           AND EXTRACT(MONTH FROM game_date) = EXTRACT(MONTH FROM CURRENT_DATE)
                         )
                      OR
                         (
                           EXTRACT(YEAR FROM game_date) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')
                           AND EXTRACT(MONTH FROM game_date) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')
                         )
                     )
            ) B
            ON A.game_team != B.game_team 
            AND A.game_id = B.game_id 
            AND LOWER(A.riot_name) != LOWER($1)
            AND A.delete_yn = 'N'
            AND A.position = B.position
            GROUP BY A.riot_name
            HAVING  COUNT(A.riot_name) >= 5
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
             position,
             riot_name,
             COUNT(riot_name) AS total_count,
             COUNT(CASE WHEN game_result = '승' THEN 1 END) AS win,
             COUNT(CASE WHEN game_result = '패' THEN 1 END) AS lose,
             ROUND(COUNT(CASE WHEN game_result = '승' THEN 1 END)::NUMERIC / COUNT(*)*100,2) AS win_rate,
             CASE WHEN SUM(death) = 0 THEN 9999
                  ELSE ROUND((SUM(kill) + SUM(assist))::NUMERIC / NULLIF(SUM(death), 0), 2) 
              END AS kda
        FROM league  
       WHERE position = $1
         AND guild_id = $2
         AND delete_yn = 'N'
       GROUP BY position, riot_name 
      HAVING COUNT(riot_name) >= 30
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
             game_id, 
             riot_name, 
             champ_name, 
             position, 
             kill, 
             death, 
             assist, 
             game_result, 
             game_team,
             total_damage_champions,
             vision_bought
        FROM league
       WHERE LOWER(game_id) = LOWER($1)
         AND guild_id = $2
         AND delete_yn = 'N'
       ORDER BY game_team,
             CASE position
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
             game_id, 
             riot_name, 
             champ_name, 
             position, 
             kill, 
             death, 
             assist, 
             game_result, 
             game_team,
             total_damage_champions,
             vision_bought
        FROM league
       WHERE LOWER(riot_name) = LOWER($1)
         AND guild_id = $2
         AND delete_yn = 'N'
       ORDER BY game_date DESC
       LIMIT 10
    `,
    [riot_name, guild_id]
  );
  return result;
};

module.exports = {
  getAllRecord,
  getRecentMonthRecord,
  getStatisticOfGame,
  getSynergisticTeammates,
  getNemesis,
  getWinRateByPosition,
  getRecordByGame,
  getRecentTenGamesByRiotName,
}; 