/**
 * 챔피언 관련 Mapper
 */
const db = require('../db');
const commonQuery = require('./commonSql')
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
             c.champ_name,
             ${commonQuery.selectWinRateAndKdaSql('pg',true)}
        FROM Player_game AS pg  
        JOIN Player AS p ON pg.player_id = p.player_id
        JOIN Champion c ON pg.champion_id = c.champion_id
       WHERE LOWER(p.riot_name) = LOWER(?)
         AND p.guild_id = ?
         AND pg.delete_yn = 'N'
       GROUP BY c.champ_name
       ORDER BY total_count DESC 
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
             p.riot_name, 
             ${commonQuery.selectWinRateAndKdaSql('pg',true)}
        FROM Player_game AS pg  
        JOIN Player AS p ON pg.player_id = p.player_id
        JOIN Champion c ON pg.champion_id = c.champion_id 
       WHERE c.champ_name = ?
         AND p.guild_id = ?
         AND pg.delete_yn = 'N'
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
 * @returns List<league>
 * @description 챔피언 통계 조회
 */
const getStatisticOfChampion = async (guild_id, year, month) => {
  const result = await db.query(
    `
      SELECT 
             c.champ_name,
             ${commonQuery.selectWinRateAndKdaSql('pg', null)}
        FROM Player_game AS pg  
        JOIN Player AS p ON pg.player_id = p.player_id
        JOIN Champion c ON pg.champion_id = c.champion_id
       WHERE pg.delete_yn = 'N'
         AND p.guild_id = ?
         AND strftime('%Y', pg.game_date) = ?
         AND strftime('%m', pg.game_date) = ?
       GROUP BY c.champ_name
       ORDER BY total_count DESC
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