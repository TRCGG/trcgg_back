const BaseRouter = require("./core/baseRouter");
const eventService = require("../services/eventService");

/**
 * event Routes
 */
class eventRoutes extends BaseRouter {
	initializeRoutes() {
		this.router.get("/:year/:month/:guild_id", this.handle(this.processAlarm));
	}

  /**
   * @param {*} req 
   * @description 알람 이벤트 처리
   * @returns 
   */
	async processAlarm(req) {
		const { guild_id, year, month } = req.params;
		return await eventService.processAlarmEvent(guild_id, year, month);
	}

}
module.exports = eventRoutes;