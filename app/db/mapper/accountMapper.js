/**
 * Player 계정 관련 Mapper
 */
const db = require('../db');

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
         AND LOWER(REPLACE(p.riot_name, ' ', '')) LIKE '%' || LOWER(REPLACE($1, ' ', '')) || '%'
         AND p.guild_id = $2
         AND p.main_player_id IS NULL
    `
  const params = [riot_name, guild_id];

  if(riot_name_tag) {
    query += `AND LOWER(p.riot_name_tag) = LOWER($3) `
    params.push(riot_name_tag);
  }
  const result = await db.query(query, params);
  return result;
}

/**
 * @param {*} delete_yn 
 * @param {*} riot_name 
 * @param {*} riot_name_tag 
 * @param {*} guild_id 
 * @returns Player
 * @description 계정 조회(관리자명령어)
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
const getSubPlayerList = async (guild_id) => {
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
 * @param {*} riot_name 
 * @param {*} riot_name_tag 
 * @param {*} guild_id 
 * @param {*} puuid 
 * @param {*} main_player_id
 * @returns 
 * @description 부계정 추가
 */
const postSubPlayer = async (riot_name, riot_name_tag, guild_id, puuid, main_player_id) => {
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
 * @param {*} player_id 
 * @description 부계정 삭제
 */
const deleteSubPlayer = async (player_id) => {
  const result = await db.query(
    `
      DELETE FROM Player
       WHERE player_id = $1
         AND main_player_id IS NOT NULL
    `,
    [player_id]
  );
  return result;
}

/**
 * @param {*} main_player_id  
 * @returns num
 * @description 부계정 일괄 삭제
 */
const deleteSubPlayers = async (main_player_id) => {
  const result = await db.query(
    `
      DELETE FROM Player
       WHERE main_player_id = $1
    `,
    [main_player_id]
  );
  return result;
}

module.exports = {
  getPlayer,
  getPlayerForSearch,
  getSubPlayerList,
  postSubPlayer,
  putPlayer,
  deleteSubPlayer,
  deleteSubPlayers
};