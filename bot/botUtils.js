// discord 별명 닉네임 가져오기
const getMemberNick = (msg, args) => {
    let riot_name = "";
    if (args[0] === undefined) {
        riot_name = msg.member.nickname;
        riot_name = riot_name.split("/")[0];
    } else {
        riot_name = args.join(" ");
    }
    return riot_name.replace(/\s/g, "").replace("й","n").trim();
}

// 권한 체크
const checkAuth = (msg) => {
    const roles = msg.member.roles.cache;
    const role_names = roles.map(role => role.name);
    if (role_names.includes("난민디코관리자") || role_names.includes("TRC관리자") || role_names.includes("난민운영진")) {
        return true;
    } else {
        return false;
    }
}

// data 없을 경우 응답 메시지
const notFoundResponse = () => {
    return "해당 기록이 없습니다";
}

const splitStr = (str) => {
    if (str === undefined) {
        return "잘못된 형식";
    } else {
        try {
            let sub_name, main_name = str.split('/');
            return sub_name,main_name;
        }
        catch (err) {
            console.log(err);
            return "잘못된 형식";
        }
    }
}

const splitTag = (str) => {
    if (str === undefined) {
        return "잘못된 형식";
    } else {
        try {
            let name, name_tag = str.split('#');
            return name,name_tag;
        }
        catch (err) {
            console.log(err);
            return "잘못된 형식";
        }
    }
}

module.exports = {
    getMemberNick,
    notFoundResponse,
    checkAuth,
    splitStr,
    splitTag,
};