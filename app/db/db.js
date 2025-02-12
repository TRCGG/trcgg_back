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
  max: 50,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false // AWS RDS는 SSL 필요할 수 있음
  }
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
  return new Promise((resolve, reject) => {

    // console.log('Executing Query:', {
    //   text: text,
    //   params: params
    // });
    pool.query(text, params, (err, res) => {
      if (err) {
        console.error('Database query error:', err);
        reject({ status: 500, message: 'Internal Server Error' });
      } else {

        // UPDATE, DELETE 쿼리의 경우 rowCount 반환
        if (['DELETE', 'UPDATE'].includes(res.command)) {
          const rows = res.rowCount;
          // console.log("update", rows);
          resolve(rows);
        }

        const rows = res.rows;
        // console.log('Query Result' , jsonify(rows));
        resolve(jsonify(rows));
      }
    });
  });
};

// 데이터베이스 쿼리 실행 (결과값이 하나인 경우)
const queryOne = (text, params = []) => {
  return new Promise((resolve, reject) => {
    pool.query(text, params, (err, res) => {
      if (err) {
        console.error('Database query error:', err);
        reject({ status: 500, message: 'Internal Server Error' });
      } else {
        // console.log(jsonify(res.rows)[0]);
        resolve(jsonify(res.rows)[0]); 
      }
    });
  });
};

module.exports = {
  query,
  queryOne,
  testConnection, // 연결 테스트 함수 내보내기
}; 