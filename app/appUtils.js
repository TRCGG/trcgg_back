// 태그 체크 
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

// data 없을 경우 응답 메시지
const notFoundResponse = () => {
    return "해당 기록이 없습니다";
}

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

module.exports = {
    notFoundResponse,
    validateTag,
    splitStr,
    splitTag,
};