// discord 별명 닉네임 가져오기
function getMemberNick(msg, args) {
    let riot_name = "";
    if (args[0] === undefined) {
        riot_name = msg.member.nickname;
        riot_name = riot_name.split("/")[0];
    } else {
        riot_name = args.join(" ");
    }
    return riot_name.replace(/\s/g, "").replace("й","n").trim();
}

module.exports = {
    getMemberNick,
};