
// import dependencies
const Helper = require('helper');

/**
 * extend team helper
 *
 * @extends {helper}
 */
class TeamHelper extends Helper {
  /**
   * construct notification helper
   */
  constructor() {
    // run super
    super();
  }
}

/**
 * export built team helper
 *
 * @type {teamHelper}
 */
module.exports = new TeamHelper();
