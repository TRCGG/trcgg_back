const db = require('../db');
/**
 * 서비스 관리용 Mapper
 */

/**
 * @param {*} game_id 
 * @param {*} guild_id 
 * @returns number
 * @description 중복 리플레이 조회
 */
const getDuplicateReplay = async (game_id, guild_id) => {
  const result = await db.queryOne(
    `
      SELECT
             COUNT(*)::INTEGER AS count
        FROM League
       WHERE LOWER(game_id) = LOWER($1)
         AND guild_id = $2
         AND delete_yn = 'N'
    `,
    [game_id, guild_id]
  );
  return result;
};

/**
 * @param {*} params 
 * @returns 
 * @description 전적 추가
 */
const postRecord = async (params) => {
  const result = await db.query(
    `
      INSERT 
        INTO League
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
};

/**
 * @param {*} old_player_id 
 * @param {*} new_player_id 
 * @returns num
 * @description 게임기록 player 수정 (부캐저장시 사용)
 */
const putPlayerGamePlayerId = async (old_player_id, new_player_id) => {
  const result = await db.query(
    `
      UPDATE Player_game 
         SET player_id = $2,
             update_date = now()
       WHERE player_id = $1
  `,
    [old_player_id, new_player_id]
  );
  return result;
};

/**
 * @param {*} delete_yn
 * @param {*} game_id 
 * @param {*} guild_id 
 * @returns num
 * @description League 삭제
 */
const deleteLeagueByGameId = async (game_id, guild_id) => {
  const result = await db.query(
    `
      DELETE 
        FROM League
       WHERE LOWER(game_id) = LOWER($1)
         AND guild_id = $2
  `,
    [game_id, guild_id]
  );
  return result;
};

/**
 * @param {*} delete_yn
 * @param {*} game_id 
 * @returns num
 * @description Player_game 삭제
 */
const deletePlayerGameByGameId = async (game_id) => {
  const result = await db.query(
    `
      DELETE
        FROM Player_Game 
       WHERE LOWER(game_id) = LOWER($1)
  `,
    [game_id]
  );
  return result;
};

module.exports = {
  getDuplicateReplay,
  postRecord,
  putPlayerGamePlayerId,
  deleteLeagueByGameId,
  deletePlayerGameByGameId,
}; 