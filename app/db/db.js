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

// /**
//  * 데이터베이스 쿼리 결과값중 숫자 형태의 문자열을 숫자로 변환
//  * @param {Array} data - 쿼리 결과
//  * @returns {Array} - 숫자로 변환된 데이터
//  */
// const jsonify = (data) => {
//   return data.map(row => {
//     Object.keys(row).forEach(key => {
//       if (typeof row[key] === "string") {
//         const num = Number(row[key]);
//         row[key] = isNaN(num) ? row[key] : num;
//       }
//     });
//     return row;
//   });
// };

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
        // console.log('Query Result:', rows);
        resolve(rows);
      }
    });
  });
};

(async () => {

  // 예제: 새로운 플레이어 추가
  // await query("INSERT INTO Player (player_id, main_riot_name, main_riot_name_tag, guild_id, puuid) VALUES (?, ?, ?, ?, ?)", ["PLR_1", "TestPlayer","TestTag","01001","puu-id-efg"]);
  const aa = await query("SELECT COUNT(*) from LEAGUE");
  console.log('aa',aa);

  // 예제: 플레이어 조회
  const players = await query("SELECT * FROM Player");
  console.log("LOGS",players);
})();

// db.close((err) => {
//   if (err) {
//     console.error("❌ Error closing database:", err.message);
//   } else {
//     console.log("✅ Database connection closed.");
//   }
// });

module.exports = {
  query,
  testConnection, // 연결 테스트 함수 내보내기
}; 