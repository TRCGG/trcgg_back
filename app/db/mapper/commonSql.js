/**
 * 공용 Mapper
 */

/**
 * total_count, win, lose, win_rate, kda 조회 쿼리
 */
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
    selectWinRateAndKdaSql,
  }; 