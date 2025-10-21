const e = require("express");
const BaseRouter = require("./core/baseRouter");
const nodeEnv = process.env.NODE_ENV || 'development';

/**
 * health Routes
 */

class healthRoutes extends BaseRouter {
  initializeRoutes(){
    this.router.get("/", (req, res) => this.handle(this.getHealth(req, res)));
  }

  /**
   * @desc 헬스 체크 엔드포인트
   */
  async getHealth(req, res) {
    const message = `${nodeEnv} status ok`;

    res.status(200).json({
      status: 'success',
      message: message
    });
  }
}


module.exports = healthRoutes;