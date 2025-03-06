/**
 * utils 공통함수 정리
 */

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
 * 포지션 변환
 * @param {*} position
 * @returns
 */
const dictPosition = (position) => {
  let realPosition = "";
  switch (position) {
    case "탑":
      return (realPosition = "TOP");
    case "정글":
      return (realPosition = "JUG");
    case "미드":
      return (realPosition = "MID");
    case "원딜":
      return (realPosition = "ADC");
    case "서폿":
      return (realPosition = "SUP");
    default:
      throw new Error("잘못된 값:" + position);
  }
};

module.exports = {
  notFoundResponse,
  notFoundAccount,
  dictPosition,
  requireMoreChars,
};
