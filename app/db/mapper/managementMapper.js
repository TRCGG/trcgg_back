/**
 * 서비스 관리용 Mapper
 */
const db = require('../db');

/**
 * @param {*} delete_yn 
 * @param {*} riot_name 
 * @param {*} riot_name_tag 
 * @param {*} guild_id 
 * @returns Player
 * @description 계정 조회
 */
const getPlayer = async (delete_yn, riot_name, riot_name_tag, guild_id) => {
  let query = 
    `
      SELECT
             p.player_id,
             p.riot_name,
             p.riot_name_tag,
             p.guild_id,
             p.puuid,
             p.main_player_id
        FROM Player AS p
       WHERE p.delete_yn = $1
         AND p.riot_name = $2
         AND p.guild_id = $3
    `
  const params = [delete_yn, riot_name, guild_id];

  if(riot_name_tag) {
    query += `AND p.riot_name_tag = $4 `
    params.push(riot_name_tag);
  }

  const result = await db.queryOne(query, params);
  return result;
}

/**
 * @param {*} guild_id 
 * @returns List<Player>
 * @description 부계정 목록 조회
 */
const getSubAccountList = async (guild_id) => {
  const result = await db.query(
    `
      SELECT 
             main.riot_name AS main_riot_name,
             main.riot_name_tag AS main_riot_name_tag,
             sub.riot_name AS sub_riot_name,
             sub.riot_name_tag AS sub_riot_name_tag
        FROM Player AS sub
        JOIN Player AS main ON sub.main_player_id = main.player_id
       WHERE sub.delete_yn = 'N'
         AND sub.guild_id = $1
       ORDER BY sub.update_date DESC
    `,
    [guild_id]
  );
  return result;
};

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
             COUNT(*) AS count
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
 * @param {*} guild_id 
 * @returns guild
 * @description 클랜 조회
 */
const getGuild = async (guild_id) => {
  const result = await db.query(
    `
      SELECT
             guild_id,
             guild_name
        FROM Guild
       WHERE guild_id = $1
         AND delete_yn = 'N'
    `,
    [guild_id]
  );
  return result;
};

/**
 * @param {*} riot_name 
 * @param {*} riot_name_tag 
 * @param {*} guild_id 
 * @param {*} puuid 
 * @param {*} main_player_id
 * @returns 
 * @description 부계정 추가
 */
const postSubAccount = async (riot_name, riot_name_tag, guild_id, puuid, main_player_id) => {
  const query = `
    INSERT 
      INTO Player 
           (
             player_id,
             riot_name,
             riot_name_tag,
             guild_id,
             puuid,
             main_player_id
           )
    SELECT 
             'PLR_' || (COALESCE(MAX(CAST(SUBSTR(player_id, 5) AS INTEGER)), 0) + 1) AS player_id,
             $1,
             $2,
             $3,
             $4,
             $5
      FROM Player
  `;
  const result = await db.query(query, [
    riot_name,
    riot_name_tag,
    guild_id,
    puuid,
    main_player_id,
  ]);

  return result;
};

/**
 * @param {*} guild_id 
 * @param {*} guild_name 
 * @returns 
 * @description 클랜 추가
 */
const postGuild = async (guild_id, guild_name) => {
  const result = await db.query(
    `
      INSERT 
        INTO Guild
           (
             guild_id,
             guild_name,
             create_date,
             update_date
           )
    VALUES 
           (
             $1,
             $2,
             CURRENT_TIMESTAMP,
             CURRENT_TIMESTAMP
           )
  `,
    [guild_id, guild_name]
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
 * @param {*} riot_name 
 * @param {*} riot_name_tag 
 * @param {*} puuid
 * @param {*} main_player_id 
 * @param {*} delete_yn 
 * @param {*} target_player_id  
 * @returns num
 * @description 계정 수정
 */
const putPlayer = async (riot_name, riot_name_tag, puuid, main_player_id, delete_yn, target_player_id) => {
  const result = await db.query(
    `
      UPDATE Player
         SET riot_name = COALESCE($1, riot_name),
             riot_name_tag = COALESCE($2, riot_name_tag),
             puuid = COALESCE($3, puuid),
             main_player_id = COALESCE($4, main_player_id),
             delete_yn = COALESCE($5, delete_yn),
             update_date = now()
       WHERE player_id = $6
    `,
    [riot_name, riot_name_tag, puuid, main_player_id, delete_yn, target_player_id]
  );
  return result;
}

/**
 * @param {*} delete_yn 
 * @param {*} main_player_id  
 * @returns num
 * @description 부계정 일괄 수정
 */
const putSubPlayerDeleteYn = async (delete_yn, main_player_id) => {
  const result = await db.query(
    `
      UPDATE Player
         SET 
             delete_yn = $1,
             update_date = now()
       WHERE main_player_id = $2
    `,
    [delete_yn, main_player_id]
  );
  return result;
}

/**
 * @param {*} old_player_id 
 * @param {*} new_player_id 
 * @returns num
 * @description 게임기록 player 수정 (닉변, 부캐저장시 사용)
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
  getPlayer,
  getSubAccountList,
  getDuplicateReplay,
  getGuild,
  postSubAccount,
  postGuild,
  postRecord,
  putPlayer,
  putSubPlayerDeleteYn,
  putPlayerGamePlayerId,
  deleteLeagueByGameId,
  deletePlayerGameByGameId,
}; 