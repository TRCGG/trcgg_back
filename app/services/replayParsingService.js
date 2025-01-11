const axios = require('axios');
const champion_dic  = require('../constants/champions');
const managementService = require('./managementService');
const { DateTime } = require('luxon');
const { Readable } = require("stream");

/**
 * 리플레이 저장
 * @param {*} fileUrl 
 * @param {*} fileName 
 * @param {*} createUser 
 * @param {*} guildId 
 * @returns 
 */
const save = async (fileUrl, fileName, createUser, guildId) => {
    if (await checkDuplicate(fileName, guildId)) {
        const bytesData = await getInputStreamDiscordFile(fileUrl);

        if (bytesData) {
            const statsArray = await parseReplayData(bytesData);
            await saveData(statsArray, fileName, createUser, guildId);
            return `:green_circle:등록완료: ${fileName} 반영 완료`;
        } else {
            throw new Error("파일 데이터 저장 중 에러.");
        }
    } else {
        return `:red_circle:등록실패: ${fileName} 중복된 리플 파일 등록`;
    }
};

/**
 * 리플레이 데이터 파싱
 * @param {*} byte 
 * @returns 
 */
const parseReplayData = async (byte) => {
    // Buffer를 문자열로 변환
    const byteString = byte.toString('utf-8');

    const startIndex = byteString.indexOf('{"gameLength":');
    const endIndex = byteString.lastIndexOf('"}');

    if (!byteString || byteString.length === 0) {
        throw new Error("파싱 데이터가 없습니다");
    }

    try {
        const data = byteString.slice(startIndex, endIndex + 2)
            .replace(/\\/g, '')
            .replace(/"\[/g, '[')
            .replace(/\]"/g, ']');
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
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
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
    const gameDate = DateTime.local(currentYear, month, day, hour, minute).toJSDate();

    const resList = [];
    statsArray = JSON.parse(statsArray);

    // 부캐닉네임 매핑
    const mappings = await managementService.getSubAccountName(guildId);

    for (const d of statsArray) {
        try {
            resList.push({
                assist: d['ASSISTS'],
                death: d['NUM_DEATHS'],
                kill: d['CHAMPIONS_KILLED'],
                position: d['TEAM_POSITION'].replace('JUNGLE', 'JUG').replace('BOTTOM', 'ADC').replace('UTILITY', 'SUP').replace('MIDDLE', 'MID'),
                riot_name: setMappingName(d['RIOT_ID_GAME_NAME'].replace(/\s/g, "").replace('й', 'n').trim(), mappings),
                game_result: d['WIN'].replace('Win', '승').replace('Fail', '패'),
                champ_name: champion_dic[d['SKIN'].toLowerCase().trim()] || d['SKIN'].toLowerCase().trim(),
                game_team: d['TEAM'].replace('100', 'blue').replace('200', 'red'),
                gold: d['GOLD_EARNED'],
                ccing: d['TIME_CCING_OTHERS'],
                time_played: d['TIME_PLAYED'],
                total_damage_champions: d['TOTAL_DAMAGE_DEALT_TO_CHAMPIONS'],
                total_damage_taken: d['TOTAL_DAMAGE_TAKEN'],
                vision_score: d['VISION_SCORE'],
                vision_bought: d['VISION_WARDS_BOUGHT_IN_GAME'],
                quadra_kills: d['QUADRA_KILLS'],
                penta_kills: d['PENTA_KILLS'],
                puuid: d['PUUID'],
                game_date: gameDate,
                create_user: createUser,
                game_id: fileName.toLowerCase(),
                delete_yn: 'N',
                guild_id: guildId
            });
        } catch (error) {
            console.error(error);
            continue;
        }
    }

    await managementService.postRecord(resList);
};

/**
 * 매핑 이름 처리
 * @param {*} name 
 * @param {*} guildId 
 * @returns 
 */
const setMappingName = (name, mappings) => {
    for (const mapping of mappings) {
        if (name === mapping.sub_name) {
            return mapping.main_name;
        }
    }
    return name;
};

/**
 * 리플 파일명 중복 확인
 * @param {*} fileName 
 * @param {*} guildId 
 * @returns 
 */
const checkDuplicate = async (fileName, guildId) => {
    const result = await managementService.getDuplicateReplay(fileName, guildId);
    return result[0].count === 0;
};

module.exports = {
    save,
}; 