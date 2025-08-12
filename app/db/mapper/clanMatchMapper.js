/**
 * 스크림 매치 mapper
 */

const db = require('../db');

/**
 * 
 * @param {Array<Integer>} game_type
 * @param {*} our_clan_role_id 
 * @param {*} opponent_clan_role_id 
 * @description !클랜전적 스크림 매치 조회
 * @returns 
 */
const getClanMatch = async (game_type, our_clan_role_id, opponent_clan_role_id) => {
  let query = 
        `
          SELECT
                g.guild_name as opponent_clan_name,
                k.opponent_clan_role_id,
                COUNT(*)::INTEGER AS total_count,
                COUNT(*) FILTER (WHERE k.game_result = 'win')::INTEGER AS win,
                COUNT(*) FILTER (WHERE k.game_result = 'lose')::INTEGER AS lose
            FROM
                (
                  SELECT
                    CASE 
                      WHEN our_clan_role_id = $2 THEN opponent_clan_role_id
                      ELSE our_clan_role_id
                    END AS opponent_clan_role_id,
                    CASE 
                      WHEN our_clan_role_id = $2 THEN 'win'
                      ELSE 'lose'
                    END AS game_result
                  FROM clan_match 
                  WHERE game_type = ANY($1)
                    AND (our_clan_role_id = $2 or opponent_clan_role_id = $2)
                    AND delete_yn = 'N'
                ) AS k
        LEFT JOIN guild g
              ON k.opponent_clan_role_id = g.clan_role_id
        `
  const params = [game_type, our_clan_role_id];
  if(opponent_clan_role_id) {
    query += `WHERE k.opponent_clan_role_id = $3 `;
    params.push(opponent_clan_role_id);
  }
  query += `GROUP BY g.guild_name, k.opponent_clan_role_id
            ORDER BY total_count DESC`;
  
  const result = await db.query(query, params);
  return result;
}

/**
 * 
 * @param {Array<Integer>} game_type
 * @param {*} our_clan_role_id 
 * @param {*} opponent_clan_role_id 
 * @description 최근 스크림 매치 조회
 * @returns 
 */
const getRecentClanMatch = async (game_type, our_clan_role_id, opponent_clan_role_id) => {
  let query = `
          SELECT 
                 k.file_name,
                 g.guild_name AS opponent_clan_name,
                 k.opponent_clan_role_id,
                 k.game_type,
                 k.game_result,
                 k.create_date
            FROM
                 (
                  SELECT
                         cm.file_name,
                         cm.game_type,
                         cm.create_date,
                         CASE
                           WHEN cm.our_clan_role_id = $2 THEN cm.opponent_clan_role_id
                           ELSE cm.our_clan_role_id
                         END AS opponent_clan_role_id,
                         CASE
                           WHEN cm.our_clan_role_id = $2 THEN 'win'
                           ELSE 'lose'
                         END AS game_result
                    FROM clan_match cm
                   WHERE cm.game_type = ANY($1)
                     AND (cm.our_clan_role_id = $2 OR cm.opponent_clan_role_id = $2)
                     AND cm.delete_yn = 'N'
                ORDER BY cm.create_date DESC
                   LIMIT 20
                  ) AS k
       LEFT JOIN guild g 
              ON k.opponent_clan_role_id = g.clan_role_id 
        ORDER BY k.create_date DESC
        `;
  const params = [game_type, our_clan_role_id];
  if(opponent_clan_role_id) {
    query += `WHERE k.opponent_clan_role_id = $3 `;
    params.push(opponent_clan_role_id);
  }
  const result = await db.query(query, params);
  return result;
}

/**
 * 
 * @param {*} params 
 * @description 클랜전적 스크림 매치 추가 game_type=3(스크림), 4(격전), 5(대회)
 * @returns  
 */
const postClanMatch = async (params) => {
    const result = await db.query(
    `
      INSERT 
        INTO clan_match
           (
            file_name,
            game_type,
            our_clan_role_id,
            opponent_clan_role_id,
            game_result,
            create_date,
            update_date,
            delete_yn
           )
      VALUES 
           (
            $1, 
            $2, 
            $3, 
            $4, 
            'win',
            CURRENT_TIMESTAMP, 
            CURRENT_TIMESTAMP, 
            'N'
           )
      `, params
    )
    return result;
}

const deleteClanMatch = async (file_name) => {
  const query = `
    DELETE 
      FROM clan_match
     WHERE file_name = $1
  `;
  return await db.query(query, [file_name]);
}


module.exports = {
  getClanMatch,
  getRecentClanMatch,
  postClanMatch,
  deleteClanMatch
};