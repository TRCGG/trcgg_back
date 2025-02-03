/**
 * DB Connection
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DBS_PATH;


/**
 * SQLite 데이터베이스 연결
 */
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

/**
 * 데이터베이스 연결 테스트
 */
const testConnection = async () => {
  db.get('SELECT 1', (err, row) => {
    if (err) {
      console.error('Database connection error:', err.message);
    } else {
      console.log('Database connection successful!');
    }
  })
};

/**
 * 데이터베이스 쿼리 실행
 * @param {string} text - SQL 쿼리
 * @param {Array} params - 쿼리 파라미터
 * @returns {Promise} - 쿼리 결과
 */
const query = (text, params = []) => {
  return new Promise((resolve, reject) => {

    //  console.log('Executing Query:', {
    //   text: text,
    //   params: params
    // });

    db.all(text, params, (err, rows) => {
      if (err) {
        console.error('Database query error:', err.message);
        reject({ status: 500, message: 'Internal Server Error' });
      } else {
        console.log('Query Results:', rows);
        resolve(rows);
      }
    });
  });
};

// 단건 조회
const queryOne = (text, params = []) => {
  return new Promise((resolve, reject) => {

    db.get(text, params, (err, row) => {
      if (err) {
        console.error('Database query error:', err.message);
        reject({ status: 500, message: 'Internal Server Error' });
      } else {
        console.log('Query Result:', row);
        resolve(row);
      }
    });
  });
};

// delete, update
const queryUpdate = (text, params = []) => {
  return new Promise((resolve, reject) => {

    db.run(text, params, function(err) {
      if (err) {
        console.error('Database update/delete error:', err.message);
        reject({ status: 500, message: 'Internal Server Error' });
      } else {
        console.log('Affected Result:', this.changes);
        resolve(this.changes);
      }
    });
  });
};

// db.close((err) => {
//   if (err) {
//     console.error("❌ Error closing database:", err.message);
//   } else {
//     console.log("✅ Database connection closed.");
//   }
// });

module.exports = {
  query,
  queryOne,
  queryUpdate,
  testConnection, // 연결 테스트 함수 내보내기
}; 