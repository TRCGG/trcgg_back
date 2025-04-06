/**
 * 특별한 이벤트 mapper
*/
const db = require('../db');


/**
 * @param {} guild_id 
 * @param {*} games_threshold_met 
 * @param {*} wins_threshold_met 
 * @description 알람한 인원 조회
 * @returns 
 */
const getEventAlarm = async (guild_id, games_threshold_met, wins_threshold_met) => {

  let query = 
	`
		SELECT
					 p.player_id,
			     p.riot_name,
					 p.riot_name_tag,
					 ea.games_threshold_met,
					 ea.wins_threshold_met,
					 ea.create_date,
					 ea.update_date
		  FROM event_alarm_log ea
			JOIN Player p on ea.player_id = p.player_id
		 WHERE p.guild_id = $1
       AND ea.create_year_month = (SELECT DATE_TRUNC('month', now()))
	`;

	if (games_threshold_met) {
		query += ` AND ea.games_threshold_met = true `;
	} 
	if (wins_threshold_met) {
		query += ` AND ea.wins_threshold_met = true `;
	}

	const params = [guild_id];
	const result = await db.query(query, params);
	return result;
} 

/**
 * 
 * @param {*} params 
 * @description 150판 이상 알람 등록
 * @returns 
 */
const postEventAlarmGames = async (params) => {
	const result = await db.query(
	`
		INSERT
		  INTO event_alarm_log
			   (
			     player_id,
					 games_threshold_met,
           create_year_month,
					 create_date,
					 update_date,
					 delete_yn
 			   )  
		VALUES 
		     (
					 $1,
					 $2,
           (SELECT DATE_TRUNC('month', now())),
					 now(),
					 now(),
					 'N'
				 )
	      ON CONFLICT (player_id, create_year_month)
				DO UPDATE SET
				   games_threshold_met = EXCLUDED.games_threshold_met,
				 	 update_date = now()
	`,
		params
	);
	return result;
}

/**
 * 
 * @param {*} params 
 * @description 50승 이상 알람 등록
 * @returns 
 */
const postEventAlarmWins = async (params) => {
	const result = await db.query(
	`
		INSERT
		  INTO event_alarm_log
			   (
			     player_id,
					 wins_threshold_met,
           create_year_month,
					 create_date,
					 update_date,
					 delete_yn
 			   )  
		VALUES 
		     (
					 $1,
					 $2,
           (SELECT DATE_TRUNC('month', now())),
					 now(),
					 now(),
					 'N'
				 )
	      ON CONFLICT (player_id, create_year_month)
				DO UPDATE SET
				 	 wins_threshold_met = EXCLUDED.wins_threshold_met,
				 	 update_date = now()
	`,
		params
	);
	return result;
}

module.exports = {
	getEventAlarm,
	postEventAlarmGames,
  postEventAlarmWins
}