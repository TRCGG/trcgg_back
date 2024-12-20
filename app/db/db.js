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
 * 데이터베이스 쿼리 실행
 * @param {string} text - SQL 쿼리
 * @param {Array} params - 쿼리 파라미터
 * @returns {Promise} - 쿼리 결과
 */
const query = async (text, params) => {
  try {
    const res = await pool.query(text, params);
    return { status: 200, data: res.rows };
  } catch (error) {
    console.error('Database query error:', error);
    return { status: 500, message: 'Internal Server Error' };
  }
};

module.exports = {
  query,
  testConnection, // 연결 테스트 함수 내보내기
}; 