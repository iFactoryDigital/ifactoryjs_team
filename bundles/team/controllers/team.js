
// Require dependencies
const Controller = require('controller');

// Require models
const Team = model('team');

// require helpers
const modelHelper = helper('model');
const teamHelper = helper('team');

/**
 * Build team controller
 *
 * @acl   admin
 * @fail  next
 * @mount /
 */
class TeamController extends Controller {
  /**
   * Construct team controller
   */
  constructor() {
    // Run super
    super();

    // bind build methods
    this.build = this.build.bind(this);

    // set building
    this.building = this.build();
  }

  // ////////////////////////////////////////////////////////////////////////////
  //
  // BUILD METHODS
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * builds team controller
   */
  build() {

  }

  // ////////////////////////////////////////////////////////////////////////////
  //
  // TEAM METHODS
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * Index action
   *
   * @param {Request}  req
   * @param {Response} res
   *
   * @route {post} /api/team/create
   */
  async teamCreateAction(req, res) {
    // return section update action
    return this.teamUpdateAction(req, res);
  }

  /**
   * Index action
   *
   * @param {Request}  req
   * @param {Response} res
   *
   * @route {post} /api/team/:id/update
   */
  async teamUpdateAction(req, res) {
    // set section
    const team = req.params.id ? await Team.findById(req.params.id) : new Team({
      user : req.user,
    });

    // set fields
    if (req.body.name) team.set('name', req.body.name);
    if (req.body.type) team.set('type', req.body.type);
    if (req.body.icon) team.set('icon', req.body.icon);
    if (req.body.color) team.set('color', req.body.color);
    if (typeof req.body.order !== 'undefined') team.set('order', req.body.order);

    // save section
    await team.save();

    // return section update action
    return res.json({
      result  : await team.sanitise(),
      success : true,
    });
  }

  // ////////////////////////////////////////////////////////////////////////////
  //
  // MODEL LISTEN METHODS
  //
  // ////////////////////////////////////////////////////////////////////////////


  /**
   * socket listen action
   *
   * @param  {String} id
   * @param  {Object} opts
   *
   * @call   model.listen.team
   * @return {Async}
   */
  async listenAction(id, uuid, opts) {
    // / return if no id
    if (!id) return;

    // join room
    opts.socket.join(`team.${id}`);

    // add to room
    return await modelHelper.listen(opts.sessionID, await Team.findById(id), uuid, true);
  }

  /**
   * socket listen action
   *
   * @param  {String} id
   * @param  {Object} opts
   *
   * @call   model.deafen.team
   * @return {Async}
   */
  async deafenAction(id, uuid, opts) {
    // / return if no id
    if (!id) return;

    // join room
    opts.socket.leave(`team.${id}`);

    // add to room
    return await modelHelper.deafen(opts.sessionID, await Team.findById(id), uuid, true);
  }
}

/**
 * Export team controller
 *
 * @type {TeamController}
 */
module.exports = TeamController;
