// middlewares/authMiddleware.js

const mapper = require("../db/mapper/discordAuthMapper");
const AuthService = require("../services/discordAuthService"); // AuthService는 싱글톤이므로 직접 require
const loginUrl = '/login';

const authMiddleware = async (req, res, next) => {
  const session_uid = req.cookies.session_uid;

  if (!session_uid) {
    // 세션이 없으면 로그인 페이지로 리디렉션
    return res.status(401).redirect(loginUrl);
  }

  try {
    // 1. session_uid로 DB에서 활성 세션 정보 가져오기
    const sessionResult = await mapper.getAuthSessionByUid(session_uid, true);

    if (!sessionResult || sessionResult.length === 0) {
      // DB에 세션이 없거나 비활성화된 경우
      res.clearCookie("session_uid");
      return res.status(401).redirect(loginUrl);
    }

    const { discord_member_id } = sessionResult;

    // 2. 회원 ID로 DB에서 토큰 정보 가져오기
    const tokenResult = await mapper.getDiscordTokenById(discord_member_id);
    if (!tokenResult || tokenResult.length === 0) {
      // 토큰 정보가 없는 경우
      res.clearCookie("session_uid");
      return res.status(401).redirect(loginUrl);
    }

    const tokenData = tokenResult;
    const acExpiresDate = new Date(tokenData.ac_expires_date);
    const reExpiresDate = new Date(tokenData.re_expires_date);

    // refresh_token 만료 여부 확인
    if (reExpiresDate <= new Date()) {
      // console.log('refresh token is expired.'); 
      // 토큰 폐기 처리
      await mapper.updateRevokedDate(discord_member_id);
      // 세션 쿠키 삭제
      res.clearCookie("session_uid");
      return res.status(401).redirect(loginUrl);
    }

    // access_token 만료 여부 확인
    if (acExpiresDate <= new Date()) {
      // console.log('Access token is expired. Refreshing...');
      
      // refresh_token으로 새 토큰 갱신
      const newTokenData = await AuthService.getNewToken(discord_member_id ,tokenData.refresh_token);
      
      // req.user에 새로운 토큰 정보 추가
      req.access_token = newTokenData.access_token;
      req.token_type = newTokenData.token_type;

    } else {
      // access_token이 유효한 경우, 기존 토큰 정보 사용
      req.access_token = tokenData.access_token;
      req.token_type = tokenData.token_type;
    }

    next();
  } catch (error) {
    console.error('Authentication Middleware Error:', error);

    res.clearCookie("session_uid");
    res.status(401).redirect(loginUrl);
  }
};

module.exports = authMiddleware;