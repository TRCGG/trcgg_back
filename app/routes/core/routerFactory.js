/**
 * Router Factory
 */
class RouterFactory {
  static createRouter(type) {
    const routers = {
      account: require('../accountRoutes'),
      management: require('../managementRoutes'),
      record: require('../recordRoutes'),
      replay: require('../replayRoutes'),
      event: require('../eventRoutes'),
      guild: require('../guildRoutes'),
      championShip: require('../championShipRoutes'),
    };

    if (!routers[type]) {
      throw new Error(`Invalid router type: ${type}`);
    }

    return new routers[type]();
  }
}

module.exports = RouterFactory;
