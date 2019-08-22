
// import dependencies
const Daemon = require('daemon');

// require helpers
const teamHelper = helper('team');

/**
 * extend team Daemon
 *
 * @compute
 *
 * @extends {Daemon}
 */
class TeamDaemon extends Daemon {
  /**
   * construct Team Daemon
   */
  constructor() {
    // run super
    super();

    // bind build method
    this.build = this.build.bind(this);

    // build
    this.building = this.build();
  }

  /**
   * build Team Daemon
   */
  async build() {

  }
}

/**
 * export built team daemon
 *
 * @type {teamDaemon}
 */
module.exports = TeamDaemon;
