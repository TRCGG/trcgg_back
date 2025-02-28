/**
 * 리플레이 파일 파싱 서비스
 */

const axios = require("axios");
const managementService = require("./managementServiceBot");
const { DateTime } = require("luxon");

/**
 * 리플레이 저장
 * @param {*} fileUrl
 * @param {*} fileName
 * @param {*} createUser
 * @param {*} guildId
 * @returns
 */
const save = async (fileUrl, fileName, createUser, guildId) => {
  try {
    if (await checkDuplicate(fileName, guildId)) {
      const bytesData = await getInputStreamDiscordFile(fileUrl);

      if (bytesData) {
        const statsArray = await parseReplayData(bytesData);
        await saveData(statsArray, fileName, createUser, guildId);
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
 * 리플레이 데이터 파싱
 * @param {*} byte
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
 * 디스코드에 올린 파일 데이터 가져오기
 * @param {*} fileUrl
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
 * 파싱한 데이터 save
 * @param {*} statsArray
 * @param {*} fileName
 * @param {*} createUser
 * @param {*} guildId
 * @returns
 */
const saveData = async (statsArray, fileName, createUser, guildId) => {
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
    guildId,
    game_date,
    game_type,
    createUser
  );

  return await managementService.postRecord(params);
};

/**
 * 리플 파일명 중복 확인
 * @param {*} fileName
 * @param {*} guildId
 * @returns
 */
const checkDuplicate = async (fileName, guildId) => {
  const result = await managementService.getDuplicateReplay(fileName, guildId);
  return result.count === 0;
};

module.exports = {
  save,
};
