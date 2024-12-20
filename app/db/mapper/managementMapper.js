/**
 * 서비스 관리용 Mapper
 */
const db = require('../db');

/**
 * @param {*} guild_id 
 * @returns List<mapping_name>
 * @description 부계정 조회
 */
const getSubAccountName = async (guild_id) => {
  const result = await db.query(
    `
      SELECT 
             sub_name,
             main_name
        FROM mapping_name
       WHERE delete_yn = 'N'
         AND guild_id = $1
       ORDER BY update_date DESC
    `,
    [guild_id]
  );
  return result;
};

/**
 * @param {*} sub_name 
 * @param {*} main_name 
 * @param {*} guild_id 
 * @returns 
 * @description 부계정 추가
 */
const postSubAccountName = async (sub_name, main_name, guild_id) => {
  const query = `
    INSERT 
      INTO mapping_name 
           (
             sub_name,
             main_name,
             create_date,
             update_date,
             delete_yn,
             guild_id
           )
      VALUES 
           (
             $1,
             $2,
             CURRENT_TIMESTAMP,
             CURRENT_TIMESTAMP,
             'N',
             $3
           )
  `;
  const result = await db.query(query, [
    sub_name,
    main_name,
    guild_id,
  ]);
  return result;
};

/**
 * @param {*} new_name 
 * @param {*} old_name 
 * @param {*} guild_id 
 * @returns 
 * @description 부계정 수정
 */
const putSubAccountName = async (new_name, old_name, guild_id) => {
  const result = await db.query(
    `
      UPDATE mapping_name
         SET main_name = $1,
             update_date = CURRENT_TIMESTAMP
     WHERE main_name = $2
       AND guild_id = $3
  `,
    [new_name, old_name, guild_id]
  );
  return result;
};

/**
 * @param {*} riot_name 
 * @param {*} guild_id 
 * @returns 
 * @description 부계정 삭제
 */
const deleteSubAccountName = async (riot_name, guild_id) => {
  const result = await db.query(
    `
      DELETE 
        FROM mapping_name
     WHERE sub_name = $1
       AND guild_id = $2
  `,
    [riot_name, guild_id]
  );
  return result;
};

/**
 * @param {*} game_id 
 * @param {*} guild_id 
 * @returns number
 * @description 중복 리플레이 조회
 */
const getDuplicateReplay = async (game_id,guild_id) => {
  const result = await db.query(
    `
      SELECT
             COUNT(*)
        FROM league
       WHERE LOWER(game_id) = LOWER($1)
         AND guild_id = $2
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
        FROM guild
       WHERE guild_id = $1
    `,
    [guild_id]
  );
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
        INTO guild
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
 * @returns league
 * @description 전적 추가
 */
const postRecord = async (params) => {
  const query = `
      INSERT 
        INTO league
           (
             game_id,
             riot_name,
             champ_name,
             position,
             kill, 
             death, 
             assist,
             game_result,
             game_team,
             game_date,
             create_date,
             update_date,
             delete_yn,
             create_user,
             gold,
             ccing,
             time_played,
             total_damage_champions,
             total_damage_taken,
             vision_score,
             vision_bought,
             puuid,
             guild_id
           )
      VALUES 
           (
             $1,
             $2,
             $3,
             $4,
             $5,
             $6,
             $7,
             $8,
             $9,
             $10,
             $11,
             $12,
             $13,
             $14,
             $15,
             $16,
             $17,
             $18,
             $19,
             $20,
             $21,
             $22,
             $23
           )
    `;
    const values = params.map((item) => [
      item.game_id,
      item.riot_name,
      item.champ_name,
      item.position,
      item.kill,
      item.death,
      item.assist,
      item.game_result,
      item.game_team,
      item.game_date,
      new Date(),
      new Date(),
      item.delete_yn,
      item.create_user,
      item.gold,
      item.ccing,
      item.time_played,
      item.total_damage_champions,
      item.total_damage_taken,
      item.vision_score,
      item.vision_bought,
      item.puuid,
      item.guild_id,
    ]);

  for (const value of values) {
    return await db.query(query, value);
  }
};

/**
 * @param {*} game_id 
 * @param {*} guild_id 
 * @returns 
 * @description 전적 삭제
 */
const deleteRecord = async (game_id, guild_id) => {
  const result = await db.query(
    `
      DELETE 
        FROM league
       WHERE LOWER(game_id) = LOWER($1)
       AND guild_id = $2
  `,
    [game_id, guild_id]
  );
  return result;
};

/**
 * @param {*} delete_yn 
 * @param {*} riot_name 
 * @param {*} guild_id 
 * @returns 
 * @description 사용자 삭제 여부 수정
 */
const putUserDeleteYN = async (delete_yn, riot_name, guild_id) => {
  const result = await db.query(
    `
      UPDATE league
         SET delete_yn = $1,
             update_date = CURRENT_TIMESTAMP
     WHERE riot_name = $2
       AND guild_id = $3
  `,
    [delete_yn, riot_name, guild_id]
  );
  return result;
};

/**
 * @param {*} delete_yn 
 * @param {*} riot_name 
 * @param {*} guild_id 
 * @returns 
 * @description 부계정 삭제 여부 수정
 */
const putUserSubAccountDeleteYN = async (delete_yn, riot_name, guild_id) => {
  const result = await db.query(
    `
      UPDATE mapping_name
         SET delete_yn = $1,
             update_date = CURRENT_TIMESTAMP
     WHERE main_name = $2
       AND guild_id = $3
  `,
    [delete_yn, riot_name, guild_id]
  );
  return result;
};

/**
 * @param {*} new_name 
 * @param {*} old_name 
 * @param {*} guild_id 
 * @returns 
 * @description 닉네임 수정
 */
const putName = async (new_name, old_name, guild_id) => {
  const result = await db.query(
    `
      UPDATE league
         SET riot_name = $1,
             update_date = CURRENT_TIMESTAMP
     WHERE riot_name = $2
       AND guild_id = $3
  `,
    [new_name, old_name, guild_id]
  );
  return result;
};

module.exports = {
  getSubAccountName,
  postSubAccountName,
  putSubAccountName,
  deleteSubAccountName,
  getDuplicateReplay,
  getGuild,
  postGuild,
  postRecord,
  deleteRecord,
  putUserDeleteYN,
  putUserSubAccountDeleteYN,
  putName,
}; 