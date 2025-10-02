/**
 * discord oauth2 login mapper
 */

const db = require('../db');

const getDiscordTokenById = async (id) => {
  const result = await db.queryOne(
    `
      SELECT
             access_token,
             ac_expires_date,
             refresh_token,
             re_expires_date,
             token_type
        FROM discord_token
       WHERE id = $1
         AND revoked_date IS NULL
    `,[id]
  );
  return result;
}

const getAuthSessionByUid = async (session_uid, is_active) => {
  let query = 
    `
      SELECT
             id,
             discord_member_id,
             session_uid,
             user_agent,
             ip_addr,
             device_name
        FROM auth_session
       WHERE session_uid = $1 AND is_active = $2
    `;
    const params = [session_uid, is_active];
    const result = await db.queryOne(query, params);
    return result;

}
const upsertMemberAndToken = async (user,token) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // 1. discord_member upsert
    await client.query(
      `
        INSERT 
          INTO discord_member 
              (
               id,
               display_name,
               avatar_url
              )
        VALUES ($1, $2, $3)
            ON CONFLICT (id) 
            DO UPDATE SET
              display_name = EXCLUDED.display_name,
              avatar_url = EXCLUDED.avatar_url,
              update_date = NOW();
      `,
      [user.id, user.username, user.avatar_url]
    );

    // 2. discord_token upsert
    await client.query(
      `
        INSERT 
          INTO discord_token 
              ( 
                id, 
                access_token, 
                ac_expires_date, 
                refresh_token, 
                re_expires_date, 
                scope, 
                token_type
              )
        VALUES 
              ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (id) 
            DO UPDATE SET
                access_token = EXCLUDED.access_token,
                ac_expires_date = EXCLUDED.ac_expires_date,
                refresh_token = EXCLUDED.refresh_token,
                re_expires_date = EXCLUDED.re_expires_date,
                scope = EXCLUDED.scope,
                token_type = EXCLUDED.token_type,
                rotated_date = NULL,
                revoked_date = NULL,
                create_date = now();
      `,
      [
        user.id,
        token.access_token,
        token.ac_expires_date,
        token.refresh_token,
        token.re_expires_date,
        token.scope,
        token.token_type,
      ]
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const postAuthSession = async (params) => {
  const result = await db.query(
    `
      INSERT 
        INTO auth_session 
            (
              discord_member_id,
              user_agent,
              ip_addr,
              device_name,
              is_active
            ) 
      VALUES 
            (
              $1,
              $2,
              $3,
              $4,
              TRUE
            )
      RETURNING session_uid
    `, params
  );
  return result[0];
}

const updateToken = async (id, newTokenData) => {
  const result = await db.query(
    `
      UPDATE discord_token
         SET
             access_token = $1,
             ac_expires_date = $2,
             refresh_token = $3,
             re_expires_date = $4,
             scope = $5,
             token_type = $6,
             rotated_date = NOW()
       WHERE id = $7
    `,
    [
      newTokenData.access_token,
      newTokenData.ac_expires_date,
      newTokenData.refresh_token,
      newTokenData.re_expires_date,
      newTokenData.scope,
      newTokenData.token_type,
      id
    ]
  );
  return result.rowCount;
};

const deactivateSession = async (session_uid) => {
  const result = await db.query(
    `
      UPDATE auth_session
         SET
             is_active = FALSE,
             update_date = NOW()
       WHERE session_uid = $1
    `,
    [session_uid]
  );
  return result; // 업데이트된 행의 개수 반환
};

const updateRevokedDate = async (discord_member_id) => {
  const result = await db.query(
    `
      UPDATE discord_token
         SET
             revoked_date = NOW()
       WHERE id = $1
    `,[discord_member_id]
  );
  return result;
};


module.exports = {
  getAuthSessionByUid,
  getDiscordTokenById,
  upsertMemberAndToken,
  postAuthSession,
  updateToken,
  deactivateSession,
  updateRevokedDate,
}