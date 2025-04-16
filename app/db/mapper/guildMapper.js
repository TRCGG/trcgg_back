/**
 * 길드 관리 Mapper
 */
const db = require('../db');

/**
 * @param {*} guild_id 
 * @param {*} guild_name 
 * @param {*} lan_id
 * @description 클랜 추가
 * @returns 
 */
const postGuild = async (params) => {
  const query = 
    `
      INSERT 
        INTO Guild
           (
             guild_id,
             guild_name,
             lan_id,
             create_date,
             update_date,
             delete_yn
           )
      VALUES 
           (
             $1, 
             $2, 
             $3, 
             CURRENT_TIMESTAMP, 
             CURRENT_TIMESTAMP, 
             'N'
           )
          ON CONFLICT (guild_id) 
          DO UPDATE SET
           guild_name = EXCLUDED.guild_name,
           update_date = CURRENT_TIMESTAMP
    `;
    const values = params.map((item) => [
      item.id,
      item.name,
      item.lan_id,
    ]);
    return await Promise.all(values.map(value => db.query(query, value)));
};

/**
 * @param {*} lan_id 
 * @param {*} guild_id 
 * @description 언어 설정
 * @returns 
 */
const putGuildLang = async (lan_id, guild_id) => { 
  const result = await db.query(
    `
      UPDATE Guild
         SET lan_id = $1,
             update_date = CURRENT_TIMESTAMP
       WHERE guild_id = $2
         AND delete_yn = 'N'
    `,
    [lan_id, guild_id]
  );
  return result;
}

/**
 * @param {*} guild_id 
 * @description 클랜 삭제
 * @returns guild
 */
const deleteGuild = async (guild_id) => {
    const result = await db.query(
      `
        DELETE
          FROM Guild
         WHERE guild_id = $1
           AND delete_yn = 'N'
      `,
      [guild_id]
    );
    return result;
  };

  module.exports = {
    postGuild,
    putGuildLang,
    deleteGuild,
  };