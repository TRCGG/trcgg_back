const BaseRouter = require("./core/baseRouter");
const ManagementService = require("../services/managementService");

/**
 * management routes
 */
class ManagementRoutes extends BaseRouter {
  initializeRoutes() {
    this.router.get("/doc", this.handle(this.getDoc));
    this.router.get("/sublist/:guild_id", this.handle(this.getSublist));
    this.router.post("/subaccount/:guild_id", this.handle(this.postSubAccount));
    this.router.put("/accountstatus/:guild_id", this.handle(this.putAccountStatus));
    this.router.put("/accountname/:guild_id", this.handle(this.putAccountName));
    this.router.delete("/subaccount/:guild_id", this.handle(this.deleteSubAccount));
  }

  /**
   * @description !설명
   * @returns Embed format Json
   */
  async getDoc() {
    return await ManagementService.getDocEmbed();
  }

  /**
   * @param {*} req
   * @description !부캐목록
   * @returns {Object} Embed format Json
   */
  async getSublist(req) {
    const { guild_id } = req.params;
    return await ManagementService.getSubAccountListEmbed(guild_id);
  }

  /**
   * @param {*} req 
   * @description !부캐저장
   * @returns {string} message
   */
  async postSubAccount(req) {
    const { guild_id } = req.params;
    const { sub_name, sub_name_tag, main_name, main_name_tag } = req.body;
    return await ManagementService.postSubAccount(sub_name, sub_name_tag, main_name, main_name_tag, guild_id);
  }

  /**
   * @param {*} req 
   * @description !탈퇴, !복귀
   * @returns {string} message
   */
  async putAccountStatus(req) {
    const { guild_id } = req.params;
    const { delete_yn, riot_name, riot_name_tag } = req.body;
    return await ManagementService.putAccountDeleteYn(delete_yn, riot_name, riot_name_tag, guild_id);
  }

  /**
   * @param {*} req 
   * @description !닉변
   * @returns {string} message
   */
  async putAccountName(req) {
    const { guild_id } = req.params;
    const { old_name, old_name_tag, new_name, new_name_tag } = req.body;
    return await ManagementService.putAccountName(old_name, old_name_tag, new_name, new_name_tag, guild_id);
  }
  
  /**
   * @param {*} req 
   * @description !부캐삭제
   * @returns {string} message
   */
  async deleteSubAccount(req) {
    const { guild_id } = req.params;
    const { sub_name, sub_name_tag } = req.body;
    return await ManagementService.deleteSubAccount(sub_name, sub_name_tag, guild_id);
  }
}

module.exports = ManagementRoutes;
