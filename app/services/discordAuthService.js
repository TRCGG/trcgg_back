const querystring = require("querystring");
const mapper = require("../db/mapper/discordAuthMapper");
const config = require("../config/discord");
const httpClient = require("../utils/networkUtils");

/**
 * 디스코드 OAuth2 service
 */
class AuthService {
  constructor() {}

  /**
   * @desc 디스코드 로그인
   */
  async login(req, res) {
    const authorizeUrl =
      `${config.apiBaseUrl}/oauth2/authorize?` +
      querystring.stringify({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: "code",
        scope: config.scopes.join(" "),
      });

    res.redirect(authorizeUrl);
  }

  /**
   * @desc 로그인 후 응답
   */
  async callback(req, res) {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send("Code not provided");
    }

    try {
      // access_token 요청
      const token = await httpClient.post(
        `${config.apiBaseUrl}/oauth2/token`,
        querystring.stringify({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          grant_type: "authorization_code",
          code,
          redirect_uri: config.redirectUri,
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      const { access_token, token_type } = token;
        
      const user = await httpClient.get(`${config.apiBaseUrl}/users/@me`, {
        headers: { Authorization: `${token_type} ${access_token}` },
      });

      // 💡 새로운 토큰 정보 객체 생성
      const tokenData = formatTokenData(token);

      // 1. 회원 정보와 토큰 정보 DB에 저장 (UPSERT)
      await mapper.upsertMemberAndToken(user, tokenData);

      // 2. 새로운 세션 생성 및 DB에 저장
      const sessionParams = [user.id, req.headers["user-agent"], req.ip || req.connection.remoteAddress, "Web"];
      const session = await mapper.postAuthSession(sessionParams);
      
      // 3. 세션 UID를 쿠키에 저장
      res.cookie("session_uid", session.session_uid, {
        domain: ".gmok.kr",
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "None",
      });
      
      // 프론트에 redirect 주소
      if(process.env.NODE_ENV === "development") {
        res.redirect("https://dev.gmok.kr/");
      } else {
        res.redirect("https://gmok.kr");
      }

    } catch (err) {
      console.error("[OAuth2 callback error]", err.response?.data || err);
      res.status(500).send("OAuth2 Callback Failed");
    }
  }

  /**
   * @desc 현재 로그인한 유저 정보 조회
   */
  async getMe(req, res) {
    try {
      const userRes = await httpClient.get(`${config.apiBaseUrl}/users/@me`, {
        headers: { Authorization: `${req.token_type} ${req.access_token}` },
      });
      res.json(userRes);
    } catch (err) {
      console.error("API Error:", err.response?.data || err);
      res.status(500).json({ message: "Failed to fetch user data." });
    }
  }

  /**
   * @desc 유저가 속한 길드 목록 조회
   */
  async getGuilds(req, res) {
    try {
      const guildsRes = await httpClient.get(`${config.apiBaseUrl}/users/@me/guilds`, {
        headers: { Authorization: `${req.token_type} ${req.access_token}` },
      });
      res.json(guildsRes);
    } catch (err) {
      console.error("API Error:", err.response?.data || err);
      res.status(500).json({ message: "Failed to fetch guilds." });
    }
  }  

// 1. refresh 재발급
async getNewToken(discord_member_id, refreshToken) {
  try {
    const res = await httpClient.post(
      `${config.apiBaseUrl}/oauth2/token`,
      querystring.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    const newToken = formatTokenData(res);
    await mapper.updateToken(discord_member_id, newToken);
    return newToken;
  } catch (err) {
    console.error("[Refresh Token Error]", err.response?.data || err);
    throw new Error("Failed to refresh token");
  }
}

  /**
   * @desc 디스코드 토큰을 폐기(revoke)합니다.
   */
  async revokeToken(token) {
    try {
      const res = await httpClient.post(
        `${config.apiBaseUrl}/oauth2/token/revoke`,
        querystring.stringify({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          token: token
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      // console.log('Token successfully revoked.');
      // console.log(res);
      return true;
    } catch (err) {
      console.error('[Token Revoke Error]', err.response?.data || err);
      return false;
    }
  }

  async logout(req, res) {
    const session_uid = req.cookies.session_uid;
    let access_token = null;
    
    // 💡 데이터베이스에서 refresh_token 가져오기
    if (session_uid) {
      try {
        const sessionData = await mapper.getAuthSessionByUid(session_uid, true);
        if (sessionData && sessionData.discord_member_id) {
          const tokenData = await mapper.getDiscordTokenById(sessionData.discord_member_id);
          access_token = tokenData.access_token;
        }
        
        // 우리 서비스의 세션 비활성화
        await mapper.deactivateSession(session_uid);
        
        // 💡 디스코드 서버에 토큰 폐기 요청
        if (access_token) {
          await this.revokeToken(access_token);
          await mapper.updateRevokedDate(sessionData.discord_member_id);
        }
        
      } catch (err) {
        console.error("[Logout Error]", err);
        // 토큰 폐기 실패 시에도 로그아웃 절차는 계속 진행
      }
    }
    
    // 쿠키 정리 및 리디렉션
    res.clearCookie("session_uid");
    res.redirect("/");
  }

}

function formatTokenData(token) {
  const tokenData = {
    access_token: token.access_token,
    ac_expires_date: new Date(Date.now() + (token.expires_in) * 1000), // access_token 만료일 (7일)
    refresh_token: token.refresh_token,
    re_expires_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // refresh_token 만료일 (30일)
    scope: token.scope,
    token_type: token.token_type,
  };
  return tokenData;
}

module.exports = new AuthService();