const { EmbedBuilder  } = require('discord.js');

const createEmbed = (jsonData) => {
    const embed = {
        title: jsonData.title,
        description: jsonData.description,
        fields: jsonData.fields,
    }
    return ({embeds: [embed]});
}

// 라인 header 설정
function setLineFieldHeader(dto, team) {
    let result = "";

    if (team === "blue") {
        result += ":blue_circle: 블루 ";
        // 블루 팀이면서 승리한 경우
        if (dto.game_team === "blue" && dto.game_result === "승") {
            result += ":v:";
        }
    } else {
        result += ":red_circle: 레드 ";
        // 레드 팀이면서 패배한 경우
        if (dto.game_team === "red" && dto.game_result === "패") {
            result += ":v:";
        }
    }

    return result;
}

// prefix: 승/패 - 승률 form
function makeTeamStat(prefix, win, lose, win_rate) {
    return `${prefix}: ${win}승/${lose}패 ${win_rate}%\n`;
}

// prefix - 승/승률 - kda form
function makeStat(prefix, win, win_rate, kda) {
    let stats = `${prefix} - ${win}승/${win_rate}%`;

    if (kda !== 9999) {
        stats += ` KDA: ${kda}`;
    }

    stats += "\n";

    return stats;
}

// 통계 챔프/게임 form
function makeStatsList(stats_list, type) {
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
function filterAndSortByWinRate(records, win_rate, greater_than, limit) {
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
    createEmbed,
    setLineFieldHeader,
    makeTeamStat,
    makeStat,
    makeStatsList,
    filterAndSortByWinRate
};