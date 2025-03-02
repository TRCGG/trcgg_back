/**
 * 리플레이 파일 파싱 서비스
 */

const axios = require("axios");
const managementMapper = require('../db/mapper/managementMapper');
const { DateTime } = require("luxon");

/**
 * @param {String} fileUrl
 * @param {String} fileName
 * @param {String} createUser
 * @param {String} guild_id
 * @description 리플레이 저장
 * @returns {String} message
 */
const save = async (fileUrl, fileName, createUser, guild_id) => {
  try {
    if (await checkDuplicate(fileName, guild_id)) {
      const bytesData = await getInputStreamDiscordFile(fileUrl);

      if (bytesData) {
        const statsArray = await parseReplayData(bytesData);
        await saveData(statsArray, fileName, createUser, guild_id);
        return `:green_circle:등록완료: ${fileName} 반영 완료`;
      } else {
        throw new Error("디스코드 파일 데이터 가져오기 실패");
      }
    } else {
      return `:red_circle:등록실패: ${fileName} 중복된 리플 파일 등록`;
    }
  } catch (e) {
    console.log(e);
    return ":red_circle: 저장 실패";
  }
};

/**
 * @param {String} game_id
 * @param {String} guild_Id
 * @description !drop 리플 삭제
 * @returns {String} message
 */
const deleteRecord = async (game_id, guild_id) => {
  // 1.League 데이터 update, 2. Player_game 데이터 update
  const league = await managementMapper.deleteLeagueByGameId(game_id, guild_id);
  if (league >= 1) {
    const playerGame = await managementMapper.deletePlayerGameByGameId(game_id, guild_id);
    if(playerGame >= 1) {
      return `:orange_circle:데이터 삭제완료: ${game_id}`;
    } else {
      return "playerGame 삭제 실패";
    }
  } else {
    return utils.notFoundResponse();
  } 
};

/**
 * @param {*} byte
 * @description 리플레이 데이터 파싱
 * @returns
 */
const parseReplayData = async (byte) => {
  // Buffer를 문자열로 변환
  const byteString = byte.toString("utf-8");

  const startIndex = byteString.indexOf('{"gameLength":');
  const endIndex = byteString.lastIndexOf('"}');

  if (!byteString || byteString.length === 0) {
    throw new Error("파싱 데이터가 없습니다");
  }

  try {
    const data = byteString
      .slice(startIndex, endIndex + 2)
      .replace(/\\/g, "")
      .replace(/"\[/g, "[")
      .replace(/\]"/g, "]");
    const rootNode = JSON.parse(data);
    const statsArray = rootNode.statsJson;

    return JSON.stringify(statsArray);
  } catch (error) {
    console.error(`파싱 에러: ${error}`);
    throw error;
  }
};

/**
 * @param {String} fileUrl
 * @description 디스코드에 올린 파일 데이터 가져오기
 * @returns
 */
const getInputStreamDiscordFile = async (fileUrl) => {
  try {
    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
    return Buffer.from(response.data);
  } catch (error) {
    console.error(`파일 가져오기 에러: ${error}`);
    return null;
  }
};

/**
 * @param {String} statsArray
 * @param {String} fileName
 * @param {String} createUser
 * @param {String} guild_id
 * @description 파싱한 데이터 save
 * @returns
 */
const saveData = async (statsArray, fileName, createUser, guild_id) => {
  const currentYear = DateTime.now().year;
  const dateTime = fileName.split("_");

  const month = parseInt(dateTime[1].slice(0, 2));
  const day = parseInt(dateTime[1].slice(2));
  let hour = parseInt(dateTime[2].slice(0, 2));
  if (hour === 24) hour = 0;
  const minute = parseInt(dateTime[2].slice(2));

  // 현재 년도와 추출한 월, 일로 datetime 생성
  const game_date = DateTime.local(
    currentYear,
    month,
    day,
    hour,
    minute
  ).toFormat("yyyy-MM-dd HH:mm:ss");

  const game_type = 1;
  const hash_data = "";
  const raw_data = statsArray;
  const params = [];

  params.push(
    fileName.toLowerCase(),
    raw_data,
    hash_data,
    guild_id,
    game_date,
    game_type,
    createUser
  );

  return await postRecord(params);
};

/**
 * @param {String} fileName
 * @param {String} guild_id
 * @description 리플 파일명 중복 확인
 * @returns
 */
const checkDuplicate = async (fileName, guild_id) => {
  const result = await managementMapper.getDuplicateReplay(fileName, guild_id);
  return result.count === 0;
};

/**
 * @param {*} records 
 * @description 리플레이 데이터 db 저장
 * @returns 
 */
const postRecord = async (records) => {
  return await managementMapper.postRecord(records);
};

module.exports = {
  save,
  deleteRecord,
};
