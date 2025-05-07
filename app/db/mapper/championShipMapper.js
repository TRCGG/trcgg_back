/**
 * 대회 기록 mapper
 */

const db = require('../db');

/**
 * 
 * @param {*} params 
 * @description 대회 기록 저장
 * @returns 
 */
const postChampionshipReplay = async (params) => {
  const result = await db.query(
    `
      INSERT 
        INTO Championship_League
           (
             game_id,
             raw_data,
             hash_data,
             guild_id,
             game_date,
             game_type,
             create_user
           )
      VALUES 
           (
             $1,
             $2,
             $3,
             $4,
             $5,
             $6,
             $7
           )
    `,
    params
  )
  return result;
}

/**
 * @param {*} game_id 
 * @param {*} guild_id 
 * @description 대회 기록 중복 체크
 * @returns 
 */
const getDuplicateChampionshipReplay = async (game_id, guild_id) => {
  const result = await db.queryOne(
    `
      SELECT COUNT(*)::INTEGER AS count
        FROM Championship_League
       WHERE LOWER(game_id) = LOWER($1)
         AND guild_id = $2
         AND delete_yn = 'N'
    `,
    [game_id, guild_id]
  )
  return result;
}


module.exports = {
  postChampionshipReplay,
  getDuplicateChampionshipReplay,
};