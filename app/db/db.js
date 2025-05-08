const { Pool } = require('pg');

/**
 * Default Connection Pool Settings
 */
const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 50,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false // AWS RDS는 SSL 필요 
  } 
};

const pool = new Pool(dbConfig);

/**
 * @description 공통 에러 처리 함수
 * @param {Error} error - 발생한 에러
 * @throws {Object} - 표준화된 에러 객체
 */
const handleDatabaseError = (error) => {
  console.error('Database error:', error);
  throw { status: 500, message: 'Internal Server Error' };
};

/**
 * 데이터베이스 연결 테스트
 */
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("Database connection successful!");
    client.release();
  } catch (error) {
    handleDatabaseError(error);
  }
};

/**
 * 기본 쿼리 실행 함수
 * @param {string} text - SQL 쿼리문
 * @param {Array} params - 쿼리 파라미터
 * @returns {Promise<Array>} - 쿼리 결과
 */
const executeQuery = async (text, params = []) => {
  try {
    const result = await pool.query(text, params);

    if (['DELETE', 'UPDATE'].includes(result.command)) {
      return result.rowCount;
    }

    return result.rows;
  } catch (error) {
    handleDatabaseError(error);
  }
};

/**
 * 다중 결과 쿼리 실행
 * @param {string} text - SQL 쿼리
 * @param {Array} params - 쿼리 파라미터
 * @returns {Promise<Array>} - 쿼리 결과 배열
 */
const query = (text, params = []) => executeQuery(text, params);

/**
 * 단일 결과 쿼리 실행
 * @param {string} text - SQL 쿼리
 * @param {Array} params - 쿼리 파라미터
 * @returns {Promise<Object>} - 단일 쿼리 결과
 */
const queryOne = async (text, params = []) => {
  const results = await executeQuery(text, params);
  return results[0];
};

module.exports = {
  query,
  queryOne,
  testConnection,
};