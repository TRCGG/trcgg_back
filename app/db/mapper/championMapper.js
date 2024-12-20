/**
 * 챔피언 관련 Mapper
 */
const db = require('../db');
/**
 * @param {*} riot_name 
 * @param {*} guild_id 
 * @returns List<league>
 * @description 모스트 픽 조회
 */
const getMostPicks = async (riot_name, guild_id) => {
  const result = await db.query(
    `
      SELECT 
             champ_name,
             COUNT(champ_name) AS total_count,
             COUNT(CASE WHEN game_result = '승' THEN 1 END) AS win,
             COUNT(CASE WHEN game_result = '패' THEN 1 END) AS lose,
             ROUND(COUNT(CASE WHEN game_result = '승' THEN 1 END)::numeric / COUNT(*) * 100 ,2) AS win_rate,
             CASE WHEN SUM(death) = 0 THEN 9999
                  ELSE ROUND((SUM(kill) + SUM(assist))::NUMERIC / NULLIF(SUM(death), 0), 2) 
              END AS kda
        FROM league
       WHERE LOWER(riot_name) = LOWER($1)
         AND guild_id = $2
         AND delete_yn = 'N'
       GROUP BY champ_name
       ORDER BY total_count DESC 
       LIMIT 10
    `,
    [riot_name, guild_id]
  );
  return result;
};

/**
 * @param {*} champ_name 
 * @param {*} guild_id 
 * @returns List<league>
 * @description 장인 조회
 */
const getMasterOfChampion = async (champ_name, guild_id) => {
  const result = await db.query(
    `
      SELECT 
             riot_name, 
             COUNT(riot_name) AS total_count,
             COUNT(CASE WHEN game_result = '승' THEN 1 END) AS win,
             COUNT(CASE WHEN game_result = '패' THEN 1 END) AS lose,
             ROUND(COUNT(CASE WHEN game_result = '승' THEN 1 END)::NUMERIC / COUNT(*) * 100 ,2) AS win_rate
        FROM league 
       WHERE champ_name = $1
         AND guild_id = $2
         AND delete_yn = 'N'
       GROUP BY riot_name 
      HAVING COUNT(riot_name) >= 10
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
 * @returns List<league>
 * @description 챔피언 통계 조회
 */
const getStatisticOfChampion = async (guild_id, year, month) => {
  const result = await db.query(
    `
      SELECT 
             champ_name,
             COUNT(champ_name) AS total_count,
             COUNT(CASE WHEN game_result = '승' THEN 1 END) AS win,
             COUNT(CASE WHEN game_result = '패' THEN 1 END) AS lose,
             ROUND(COUNT(CASE WHEN game_result = '승' THEN 1 END)::numeric / COUNT(*)*100,2) AS win_rate
        FROM LEAGUE 
       WHERE delete_yn = 'N'
         AND guild_id = $1
         AND EXTRACT(YEAR FROM game_date) = $2
         AND EXTRACT(MONTH FROM game_date) = $3
       GROUP BY champ_name
      HAVING COUNT(champ_name) >= 20
    `,
    [guild_id, year, month]
  );
  return result;
};

module.exports = {
  getMostPicks,
  getMasterOfChampion,
  getStatisticOfChampion,
}; 