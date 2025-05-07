/**
 * @description HttpError class for handling HTTP errors
 */

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }

  //400
  static badRequest = (message = 'bad request') => {
    return new HttpError(400, message);
  }

  //401
  static unauthorized = (message = 'Unauthorized') => {
    return new HttpError(401, message);
  }

  //403
  static notFound = (message = 'Not Found Data') => {
    return new HttpError(403, message);
  }

  //500
  static internal = (message = 'Internal Server Error') => {
    return new HttpError(500, message);
  }

  /**
   * @param {*} name
   * @param {*} tag
   * @description 계정이 없을 경우 응답
   * @returns
   */
  static notFoundAccount = (name, tag) => {
    let message = '';
    if(!tag){
      message = `${name} 계정이 게임 기록에 존재하지 않습니다.`;
    } else {
      message = `${name}#${tag} 계정이 게임 기록에 존재하지 않습니다.`;
    }
    return this.badRequest(message);
  }

  /**
   * 두 글자 이상 입력
   */
  static requireMoreChars = () => {
    return this.badRequest('두 글자 이상 검색해주세요');
  }

}
module.exports = HttpError;