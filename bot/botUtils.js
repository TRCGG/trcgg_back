const createEmbed = (jsonData) => {
    if(typeof jsonData === "string"){
        return jsonData;
    } else {
        const embed = {
            title: jsonData.title,
            description: jsonData.description || null,
            fields: jsonData.fields || null,
            color: jsonData.color || null,
        }
        return ({embeds: [embed]});
    }
}

// 계정조회 2명 이상일 경우
const getPlayersEmbed = (accounts) => {
    let command = "";
    accounts.forEach((account, index) => {
        command += `${account.riot_name}#${account.riot_name_tag} \n`
    })
    jsonData = {
        title: "검색결과",
        description: command,
        fields: null,
        color: 0x0099ff
    }
    return jsonData;
}

// discord 별명 닉네임 가져오기
const getMemberNick = (msg, args) => {
    let riot_name = null;
    let riot_name_tag = null;
    if (args[0] === undefined) {
        if(msg.member.nickname !== undefined) {
            riot_name = msg.member.nickname;
            riot_name = riot_name.split("/")[0];
            return [riot_name.replace(/\s/g, "").replace("й","n").trim(), null];
        }else {
            throw new Error("별명 설정 필요");
        }
    } else {
        riot_name = args.join(" ");
        if(checkTag(riot_name)){
            [riot_name, riot_name_tag] = riot_name.split("#");
            riot_name = riot_name.replace(/\s/g, "").replace("й","n").trim();
            riot_name_tag = riot_name_tag.replace(/\s/g, "").replace("й","n").trim();
            return [riot_name, riot_name_tag];
        } else {
            return [riot_name.replace(/\s/g, "").replace("й","n").trim(), null];
        }
    }
}

// 권한 체크
const checkAuth = (msg) => {
    const roles = msg.member.roles.cache;
    const role_names = roles.map(role => role.name);
    if (role_names.includes("난민개발부") || role_names.includes("TRC관리자") || role_names.includes("난민스텝진")) {
        return true;
    } else {
        return false;
    }
}

// #태그 포함된지 여부 
const checkTag = (full_name) => {
    const pattern = /^[가-힣a-zA-Z0-9]{1,16}#[가-힣a-zA-Z0-9]{1,16}$/;
    return pattern.test(full_name);
}

module.exports = {
    createEmbed,
    getPlayersEmbed,
    getMemberNick,
    checkAuth,
    checkTag,
};