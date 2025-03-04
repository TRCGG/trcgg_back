/**
 * utils 공통함수 정리
 */

/**
 * # 태그 검증
 * @param {*} str 
 * @returns 
 */
const validateTag = (str) => {
    const pattern = /^[가-힣a-zA-Z0-9]{1,16}#[가-힣a-zA-Z0-9]{1,16}$/;

    if (!str) {
        throw new Error("태그 문자열이 비어있습니다");
    }

    if (!pattern.test(str)) {
        console.log("유효하지 않은 태그:", str);
        throw new Error("잘못된 형식");
    }

    return true;
};

/**
 * 데이터 없을 경우 응답
 * 
 */
const notFoundResponse = () => {
    return "해당 기록이 없습니다";
}

/**
 * 계정이 없을 경우 응답
 * @param {*} name 
 * @param {*} tag 
 * @returns 
 */
const notFoundAccount = (name, tag) => {
    return `${name}#${tag} 계정이 게임 기록에 존재하지 않습니다.`;
}

/**
 * 슬래쉬 문자열 분리
 * @param {*} str 
 * @returns 
 */
const splitStr = (str) => {
    if (!str) {
        console.log("입력된 문자열이 비어있습니다");
        throw new Error("잘못된 형식");
    }

    const [sub_name, main_name] = str.split('/');

    if (!sub_name || !main_name) {
        console.log("잘못된 형식의 문자열:", str);
        throw new Error("잘못된 형식");
    }

    return [sub_name, main_name];
};

/**
 * # 문자열 분리
 * @param {*} str 
 * @returns 
 */
const splitTag = (str) => {
    if (!str) {
        console.log("입력된 태그가 비어있습니다");
        throw new Error("잘못된 형식");
    }

    const [name, name_tag] = str.split('#');

    if (!name || !name_tag) {
        console.log("잘못된 태그 형식:", str);
        throw new Error("잘못된 형식");
    }

    return [name, name_tag];
};


/**
 * 포지션 변환
 * @param {*} position 
 * @returns 
 */
const dictPosition = (position) => {
    let realPosition = ""
    switch (position) {
        case "탑":
            return realPosition = "TOP";
        case "정글":
            return realPosition = "JUG";
        case "미드":
            return realPosition = "MID";            
        case "원딜":
            return realPosition = "ADC";
        case "서폿":
            return realPosition = "SUP";
        default:
            throw new Error("잘못된 값:" + position);
    }
}

/**
 * 날짜 분리
 * @param {*} date 
 * @returns 
 */
const splitDate = (date) => {
    if (date === undefined) {
        const now = new Date();
        const year = now.getFullYear().toString();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        return [year, month];
    }

    if (typeof date !== 'string') {
        console.error('유효하지 않은 입력 타입:', typeof date);
        throw new Error("날짜 형식 오류");
    }

    const [year, month] = date.split('-');

    if (!year || !month ||
      isNaN(year) ||
      isNaN(month) ||
      month.length !== 2) {
        console.error('잘못된 날짜 형식:', date);
        throw new Error("날짜 형식 오류");
    }

    return [year, month];
};


module.exports = {
    notFoundResponse,
    notFoundAccount,
    validateTag,
    splitStr,
    splitTag,
    dictPosition,
    splitDate,
};