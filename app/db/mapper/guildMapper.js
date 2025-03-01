/**
 * 길드 관리 Mapper
 */
const db = require('../db');

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

  module.exports = {
    postGuild,
    getGuild,
  };