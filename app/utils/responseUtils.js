/**
 * 데이터 없을 경우 응답
 *
 */
const notFoundResponse = () => {
  return "해당 기록이 없습니다";
};

/**
 * 계정이 없을 경우 응답
 * @param {*} name
 * @param {*} tag
 * @returns
 */
const notFoundAccount = (name, tag) => {
  return `${name}#${tag} 계정이 게임 기록에 존재하지 않습니다.`;
};

/**
 * 두 글자 이상 입력
 */
const requireMoreChars = () => {
  return `두 글자 이상 검색해주세요`;
};

/**
 * @param {*} accounts
 * @description 계정조회 2명 이상일 경우
 * @returns
 */
const getPlayersEmbed = (accounts) => {
  let desc = "";
  accounts.forEach((account, index) => {
    desc += `${account.riot_name}#${account.riot_name_tag} \n`;
  });
  const jsonData = {
    title: "검색결과",
    description: desc,
    fields: null,
    color: 0x0099ff,
  };
  return jsonData;
};

module.exports = {
  notFoundResponse,
  notFoundAccount,
  requireMoreChars,
	getPlayersEmbed,
};
