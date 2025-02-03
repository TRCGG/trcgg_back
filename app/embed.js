// const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// // 이벤트 버튼 생성
// const makeEventButton = (command) => {
//     const row = new ActionRowBuilder().addComponents(
//         new ButtonBuilder()
//           .setCustomId(command)
//           .setLabel(`${command}`)
//           .setStyle(ButtonStyle.Primary)
//     );
//     return row;
// }

// !라인 header 설정
const setLineFieldHeader = (dto, team) => {
    let result = "";

    if (team === "blue") {
        result += ":blue_circle: 블루 ";
        // 블루가 승리한 경우
        if (dto.game_team === "blue" && dto.game_result === "승") {
            result += ":v:";
        }
    } else {
        result += ":red_circle: 레드 ";
        // 블루가 패배한 경우
        if (dto.game_team === "blue" && dto.game_result === "패") {
            result += ":v:";
        }
    }

    return result;
}

// !라인 value set
const setLineValue = (records, team) => {
    let result = [];

    records.forEach(record => {
        if (team === "blue" && record.game_team === "blue") {
            // 블루 팀인 경우
            result.push(` ${record.riot_name}   ${record.champ_name} ${record.kill}/${record.death}/${record.assist} `
                        + `피해량: ${record.total_damage_champions} 핑와: ${record.vision_bought}\n`);
        } else if (team === "red" && record.game_team === "red") {
            // 레드 팀인 경우
            result.push(` ${record.riot_name}   ${record.champ_name} ${record.kill}/${record.death}/${record.assist} `
                        + `피해량: ${record.total_damage_champions} 핑와: ${record.vision_bought}\n`);
        }
    });

    // 배열을 하나의 문자열로 반환
    return result.join('');
}

// prefix: 판 승 패 승률 form
const makeAllStat = (prefix, total_count, win, lose, win_rate) => {
    return `${prefix}: ${total_count}판 ${win}승 ${lose}패 ${win_rate}%\n`;
}

// prefix: 승/패 - 승률 form
const makeTeamStat = (prefix, win, lose, win_rate) => {
    return `${prefix}: ${win}승/${lose}패 ${win_rate}%\n`;
}

// prefix - 승/승률 - kda form
const makeStat = (prefix, win, win_rate, kda) => {
    let stats = `${prefix} - ${win}승/${win_rate}%`;

    if (kda !== 9999) {
        stats += ` KDA: ${kda}`;
    }

    stats += "\n";

    return stats;
}

// 통계 챔프/게임 form
const makeStatsList = (stats_list, type) => {
    let result = [];
    let i = 1;

    if (type === "champ") {
        stats_list.forEach(vo => {
            result.push(`${i}. ${makeTeamStat(vo.champ_name, vo.win, vo.lose, vo.win_rate)}`);
            i++;
        });
    } else if (type === "game") {
        stats_list.forEach(vo => {
            result.push(`${i}. ${vo.riot_name} - ${vo.total_count}판 \n`);
            i++;
        });
    } else if (type === "game_high") {
        stats_list.forEach(vo => {
            result.push(`${i}. ${makeStat(vo.riot_name, vo.win, vo.win_rate, vo.kda)}`);
            i++;
        });
    }

    return result.join('');
}

// 필터링 및 정렬 함수
const filterAndSortByWinRate = (records, win_rate, greater_than, limit) => {
    let sorted_records;
    let filtered_records;

    if (greater_than) {
        sorted_records = records.sort((a, b) => b.win_rate - a.win_rate);
        filtered_records = sorted_records.slice(0, limit).filter(record => record.win_rate >= win_rate);
    } else {
        sorted_records = records.sort((a, b) => a.win_rate - b.win_rate);
        filtered_records = sorted_records.slice(0, limit).filter(record => record.win_rate <= win_rate);
    }

    return filtered_records;
}

module.exports = {
    setLineFieldHeader,
    setLineValue,
    makeAllStat,
    makeTeamStat,
    makeStat,
    makeStatsList,
    filterAndSortByWinRate
};