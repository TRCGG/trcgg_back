const querystring = require("querystring");
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
      const tokenRes = await httpClient.post(
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

      console.log("tokenRes", tokenRes);
      const { access_token, token_type } = tokenRes;

      // 유저 정보 요청
      const userRes = await httpClient.get(`${config.apiBaseUrl}/users/@me`, {
        headers: { Authorization: `${token_type} ${access_token}` },
      });

      const user = userRes;
      // console.log("userRes", userRes);

      // 쿠키 저장 (간단히 access_token 저장 예시)
      res.cookie("access_token", access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

      // 유저 정보도 쿠키로 저장 가능 (선택)
      res.cookie("user", JSON.stringify(user), {
        httpOnly: false,
      });

      const guildsRes = await httpClient.get('https://discord.com/api/users/@me/guilds', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const userGuilds = guildsRes;
      // console.log("userGuilds", userGuilds);

      // 프론트에 redirect 주소
      // res.redirect("front URL");

    } catch (err) {
      console.error("[OAuth2 callback error]", err.response?.data || err);
      res.status(500).send("OAuth2 Callback Failed");
    }
  }

  async logout(req, res) {
    res.clearCookie("access_token");
    res.clearCookie("user");
    res.redirect("/");
  }
}

module.exports = new AuthService();