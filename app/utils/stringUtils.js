/**
 * utils 공통함수 정리
 */

/**
 * # 태그 검증
 * @param {*} str 
 * @returns 
 */
const validateTag = (str) => {
    try {
        const pattern = /^[가-힣a-zA-Z0-9]{1,16}#[가-힣a-zA-Z0-9]{1,16}$/;
        if (pattern.test(str)){
            return true;
        } else {
            throw new Error("잘못된 형식");
        }
    } catch (e) {
        console.log(str);
        throw new Error("잘못된 형식");
    }
}

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
    try {
        const [sub_name, main_name]= str.split('/');
        if (!sub_name || !main_name) {
            throw new Error("잘못된 형식");
        }
        return [sub_name,main_name];
    }
    catch (err) {
        console.log(str);
        throw new Error("잘못된 형식");
    }
}

/**
 * # 문자열 분리
 * @param {*} str 
 * @returns 
 */
const splitTag = (str) => {
    try {
        const [name, name_tag]= str.split('#');
        if (!name || !name_tag) {
            throw new Error("잘못된 형식");
        }
        return [name,name_tag];
    }
    catch (err) {
        console.log(str);
        throw new Error("잘못된 형식");
    }
}

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
    if(date === undefined) {
        const now = new Date();
        const year = now.getFullYear().toString();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        return [year, month];
    } else {
        try {
            const [year, month] = date.split('-'); 
            if (!year || !month || isNaN(year) || isNaN(month) || month.length !== 2) {
                throw new Error("잘못된 형식");
            }
            return [year, month];
        } catch (error) {
          console.error(error.message);
          throw new Error("날짜 형식 오류");
        }
    }
}

module.exports = {
    notFoundResponse,
    notFoundAccount,
    validateTag,
    splitStr,
    splitTag,
    dictPosition,
    splitDate,
};