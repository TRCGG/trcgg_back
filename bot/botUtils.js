// discord 별명 닉네임 가져오기
const getMemberNick = (msg, args) => {
    let riot_name = "";
    if (args[0] === undefined) {
        if(msg.member.nickname !== undefined) {
            riot_name = msg.member.nickname;
            riot_name = riot_name.split("/")[0];
        }else {
            throw new Error("별명 설정 필요");
        }
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

module.exports = {
    getMemberNick,
    checkAuth,
};