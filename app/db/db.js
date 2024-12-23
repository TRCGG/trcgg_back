/**
 * DB Connection
 */
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

/**
 * 데이터베이스 연결 테스트
 */
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("Database connection successful!");
    client.release();
  } catch (error) {
    console.error("Database connection error:", error);
  }
};

/**
 * 데이터베이스 쿼리 결과값중 숫자 형태의 문자열을 숫자로 변환
 * @param {Array} data - 쿼리 결과
 * @returns {Array} - 숫자로 변환된 데이터
 */
const jsonify = (data) => {
  return data.map(row => {
    Object.keys(row).forEach(key => {
      if (typeof row[key] === "string") {
        const num = Number(row[key]);
        row[key] = isNaN(num) ? row[key] : num;
      }
    });
    return row;
  });
};

/**
 * 데이터베이스 쿼리 실행
 * @param {string} text - SQL 쿼리
 * @param {Array} params - 쿼리 파라미터
 * @returns {Promise} - 쿼리 결과
 */
const query = async (text, params) => {
  try {
    const res = await pool.query(text, params);
    const rows = res.rows;
    rows["status"] = 200;
    return jsonify(rows);
  } catch (error) {
    console.error('Database query error:', error);
    return { status: 500, message: 'Internal Server Error' };
  }
};

module.exports = {
  query,
  testConnection, // 연결 테스트 함수 내보내기
}; 