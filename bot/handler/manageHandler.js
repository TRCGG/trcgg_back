const championService = require('../../app/services/championService');
const manageService = require('../../app/services/managementService');
const embedUtil = require('../template/embed');
const botUtils = require('../botUtils');

// 클랜 관리 handler 모음

/**
 * !doc
 * @returns 
 */
const help = async() => {
    
    // 검색 명령어
    const field_one_value =  (
        "`!전적 !전적 {name}` 자신의 전적, name의 전적 검색 \n" +
        "`!최근전적 {name}` 최근 10게임 상세 검색\n" + 
        "`!결과 {gameId}` 내전 게임 결과 검색 \n" +
        "`!장인 {champ}` 픽률-승률 장인 목록 \n" +
        "`!통계 게임|챔프` 게임,챔프 통계 \n" +
        "`!라인 {탑|정글|미드|원딜|서폿}` 30게임 이상 {라인}별 승률\n\n"
    )
    
    // 관리자 명령어
    const field_two_value = (
        "1. 닉네임 띄어쓰기 없이, 대소문자구분 해서 사용 \n" +
        "2. 운영진 권한 필요\n" +
        "`!탈퇴 {name}` 탈퇴한 회원 추가, 전적검색제외 \n" +
        "`!복귀 {name}` 탈퇴한 회원 복구, 전잭검색포함 \n" +
        "`!부캐목록` 등록된 모든 부캐닉/본캐닉 닉네임 목록 \n" +
        "`!부캐저장 {부캐닉/본캐닉}` 부캐닉네임 등록, 데이터저장할때 부캐닉네임은 본캐닉네임으로 변경되서 저장 \n" +
        "`!부캐삭제 {부캐닉}` 등록된 부캐닉네임 삭제 \n" +
        "`!닉변 {oldName/newName}` 닉네임 변경 \n" +
        "`!drop {gameId}` {리플레이 파일 이름} 데이터 삭제 \n"
    )

    const jsonData = {
        title: "명령어 doc",
        description: "help",
        fields: [
            {
                name: "검색 명령어",
                value: field_one_value,
                inline: false,
            },
            {
                name: "관리자 명령어",
                value: field_two_value,
                inline: false,
            },
        ],
    }
    return embedUtil.createEmbed(jsonData);
}

/**
 * !부캐목록
 * @param {*} guild_Id 
 * @returns 
 */
const getSubAccountName = async (guild_id) => {
    const title = "부캐목록";
    let desc = (
        "``` \n" +
        "|  부캐  |  본캐  |\n" +
        "\n"
    )
    const sub_account_name = await manageService.getSubAccountName(guild_id);
    sub_account_name.forEach(data => {
        desc += `| ${data.sub_name} | ${data.main_name} \n`
    })

    let size = sub_account_name.length;

    desc += "\n";
    desc += `총 : ${size} \n`;
    desc += "```";

    jsonData = {
        title: title,
        description: desc,
        fields: [],
    }

    return embedUtil.createEmbed(jsonData);
}

/**
 * !부캐저장
 * @param {*} command 
 * @param {*} guild_Id 
 * @returns 
 */
const saveSubAccountName = async (command, guild_id) => {
    let [sub_name, main_name] = botUtils.splitStr(command);

    // 부캐 등록
    try {
        const result = await manageService.postSubAccountName(sub_name, main_name, guild_id);
    } catch (error) {
        console.log(error);
        return "부캐 등록 중 에러 발생";
    }

    // 등록한 이름 변경
    try {
        const result_2 = await manageService.putName(main_name, sub_name, guild_id);
    } catch (error) {
        console.log(error);
        return "이름 변경 중 에러 발생";
    }
    return "등록 및 변경 완료";
}

/**
 * !부캐삭제
 * @param {*} riot_name 
 * @param {*} guild_Id 
 * @returns 
 */
const deleteSubAccountName = async (riot_name, guild_id) => {
    const result = await manageService.deleteSubAccountName(riot_name, guild_id);
    if (result >= 1) {
        return "부캐삭제 완료";
    } else {
        return botUtils.notFoundResponse();
    }
}

/**
 * !탈퇴, !복귀
 * @param {*} delete_yn 
 * @param {*} riot_name 
 * @param {*} guild_Id 
 * @returns 
 */
const putDeleteYn = async (delete_yn, riot_name, guild_id) => {

    try {
        const result = await manageService.putUserSubAccountDeleteYN(delete_yn, riot_name, guild_id);
    } catch (error) {
        console.log(error);
        return "부계정 탈퇴/복귀 중 에러 발생";
    }

    try {
        const result = await manageService.putUserDeleteYN(delete_yn, riot_name, guild_id);
        if (result >= 1) {
            if (delete_yn === 'Y') {
                return "탈퇴 완료";
            } else {
                return "복귀 완료";
            }
        } else {
            return botUtils.notFoundResponse();
        }
    } catch (error) {
        console.log(error);
        return "탈퇴/복귀 중 에러 발생";
    }
}

/**
 * !drop 리플 삭제
 * @param {*} game_id 
 * @param {*} guild_Id 
 * @returns 
 */
const dropReplay = async (game_id, guild_id) => {   
    const result = await manageService.deleteRecord(game_id, guild_id);
    if (result >= 1) {
        return `:orange_circle:데이터 삭제완료: ${game_id}`;
    } else {
        return botUtils.notFoundResponse();
    }
}

/**
 * !닉변 
 * @param {*} command
 * @param {*} guild_id
 * @returns 
 */
const putNameAndSubAccountName = async (command, guild_id) => {
    let [old_name, new_name] = botUtils.splitStr(command);

    // 본캐닉네임 변경
    try {
        const result_2 = await manageService.putSubAccountName(new_name, old_name, guild_id);
    } catch (error) {
        console.log(error);
        return "부캐닉네임 변경 중 에러 발생";
    }

    try {
        const result = await manageService.putName(new_name, old_name, guild_id);
        if (result >= 1) {
            return "닉변 완료";
        } else {
            return botUtils.notFoundResponse();
        }
    } catch (error) {
        console.log(error);
        return "변경 중 에러 발생";
    }
}

module.exports = { 
    help,
    getSubAccountName,
    saveSubAccountName,
    deleteSubAccountName,
    putDeleteYn,
    dropReplay,
    putNameAndSubAccountName
};