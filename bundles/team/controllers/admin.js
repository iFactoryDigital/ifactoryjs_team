
// Require dependencies
const Grid        = require('grid');
const config      = require('config');
const dotProp     = require('dot-prop');
const Controller  = require('controller');
const escapeRegex = require('escape-string-regexp');

// Require models
const Acl   = model('acl');
const Team  = model('team');
const Block = model('block');

// require helpers
const formHelper  = helper('form');
const teamHelper  = helper('team');
const fieldHelper = helper('form/field');
const blockHelper = helper('cms/block');

// get cache items
const calls  = cache('routes');
const routes = cache('calls');

/**
 * Build team controller
 *
 * @acl   admin
 * @fail  next
 * @mount /admin/team
 */
class TeamAdminController extends Controller {
  /**
   * Construct team Admin Controller
   */
  constructor() {
    // run super
    super();

    // bind build methods
    this.build = this.build.bind(this);

    // bind methods
    this.gridAction = this.gridAction.bind(this);
    this.indexAction = this.indexAction.bind(this);
    this.createAction = this.createAction.bind(this);
    this.updateAction = this.updateAction.bind(this);
    this.removeAction = this.removeAction.bind(this);
    this.createSubmitAction = this.createSubmitAction.bind(this);
    this.updateSubmitAction = this.updateSubmitAction.bind(this);
    this.removeSubmitAction = this.removeSubmitAction.bind(this);

    // bind private methods
    this._grid = this._grid.bind(this);

    // set building
    this.building = this.build();
  }


  // ////////////////////////////////////////////////////////////////////////////
  //
  // BUILD METHODS
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * build team admin controller
   */
  build() {
    //
    // REGISTER BLOCKS
    //

    // register simple block
    blockHelper.block('admin.team.grid', {
      acl         : ['admin.team'],
      for         : ['admin'],
      title       : 'Team Grid',
      description : 'Team Grid block',
    }, async (req, block) => {
      // get notes block from db
      const blockModel = await Block.findOne({
        uuid : block.uuid,
      }) || new Block({
        uuid : block.uuid,
        type : block.type,
      });

      // create new req
      const fauxReq = {
        query : blockModel.get('state') || {},
      };

      // return
      return {
        tag   : 'grid',
        name  : 'Team',
        grid  : await (await this._grid(req)).render(fauxReq),
        class : blockModel.get('class') || null,
        title : blockModel.get('title') || '',
      };
    }, async (req, block) => {
      // get notes block from db
      const blockModel = await Block.findOne({
        uuid : block.uuid,
      }) || new Block({
        uuid : block.uuid,
        type : block.type,
      });

      // set data
      blockModel.set('class', req.body.data.class);
      blockModel.set('state', req.body.data.state);
      blockModel.set('title', req.body.data.title);

      // save block
      await blockModel.save(req.user);
    });

    //
    // REGISTER FIELDS
    //

    // register simple field
    fieldHelper.field('admin.team', {
      for         : ['admin', 'frontend'],
      title       : 'Team',
      description : 'Team Field',
    }, async (req, field, value) => {
      // set tag
      field.tag = 'team';
      field.value = value ? (Array.isArray(value) ? await Promise.all(value.map(item => item.sanitise())) : await value.sanitise()) : null;
      // return
      return field;
    }, async (req, field) => {
      // save field
    }, async (req, field, value, old) => {
      // set value
      try {
        // set value
        value = JSON.parse(value);
      } catch (e) {}

      // check value
      if (!Array.isArray(value)) value = [value];

      // return value map
      return await Promise.all((value || []).filter(val => val).map(async (val, i) => {
        // run try catch
        try {
          // buffer team
          const team = await Team.findById(val);

          // check team
          if (team) return team;

          // return null
          return null;
        } catch (e) {
          // return old
          return old[i];
        }
      }));
    });
  }


  // ////////////////////////////////////////////////////////////////////////////
  //
  // CRUD METHODS
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * Index action
   *
   * @param {Request}  req
   * @param {Response} res
   *
   * @icon     fa fa-building
   * @menu     {ADMIN} Teams
   * @title    Team Administration
   * @route    {get} /
   * @layout   admin
   * @priority 10
   */
  async indexAction(req, res) {
    // Render grid
    res.render('team/admin', {
      grid : await (await this._grid(req)).render(req),
    });
  }

  /**
   * Add/edit action
   *
   * @param {Request}  req
   * @param {Response} res
   *
   * @route    {get} /create
   * @layout   admin
   * @return   {*}
   * @priority 12
   */
  createAction(req, res) {
    // Return update action
    return this.updateAction(req, res);
  }

  /**
   * Update action
   *
   * @param {Request} req
   * @param {Response} res
   *
   * @route   {get} /:id/update
   * @layout  admin
   */
  async updateAction(req, res) {
    // Set website variable
    let team = new Team();
    let create = true;

    // get acls
    const acls = [...calls, ...routes].reduce((accum, item) => {
      // return accumulator
      if (!item.acl || item.acl === true) return accum;

      // get acl
      let itemAcl = JSON.parse(JSON.stringify(item.acl));

      // check array
      if (!Array.isArray(itemAcl)) itemAcl = [itemAcl];

      // loop acl
      itemAcl.forEach((i) => {
        // add item
        if (!accum.includes(i)) accum.push(i);
      });

      // return accumulator
      return accum;
    }, []).reduce((accum, item) => {
      // set
      return dotProp.set(accum, item, true);
    }, {});

    // Check for website model
    if (req.params.id) {
      // Load by id
      team = await Team.findById(req.params.id);
      create = false;
    }

    // get form
    const form = await formHelper.get('admin.team');

    // digest into form
    const sanitised = await formHelper.render(req, form, await Promise.all(form.get('fields').map(async (field) => {
      // return fields map
      return {
        uuid  : field.uuid,
        value : await team.get(field.name || field.uuid),
      };
    })));

    // get form
    if (!form.get('_id')) res.form('admin.team');

    // Render page
    res.render('team/admin/update', {
      acls,
      item   : await team.sanitise(),
      form   : sanitised,
      title  : create ? 'Create team' : `Update ${team.get('_id').toString()}`,
      fields : config.get('team.fields') || [],
    });
  }

  /**
   * Create submit action
   *
   * @param {Request} req
   * @param {Response} res
   *
   * @route   {post} /create
   * @return  {*}
   * @layout  admin
   * @upload  {single} image
   */
  createSubmitAction(req, res) {
    // Return update action
    return this.updateSubmitAction(req, res);
  }

  /**
   * Add/edit action
   *
   * @param {Request}  req
   * @param {Response} res
   * @param {Function} next
   *
   * @route   {post} /:id/update
   * @layout  admin
   */
  async updateSubmitAction(req, res, next) {
    // Set website variable
    let create = true;
    let team = new Team();

    // Check for website model
    if (req.params.id) {
      // Load by id
      team = await Team.findById(req.params.id);
      create = false;
    }

    // get acls
    const acls = this.getFlatten(req.body.acl);

    // get form
    const form = await formHelper.get('admin.team');

    // digest into form
    const fields = await formHelper.submit(req, form, await Promise.all(form.get('fields').map(async (field) => {
      // return fields map
      return {
        uuid  : field.uuid,
        value : await team.get(field.name || field.uuid),
      };
    })));

    // loop fields
    for (const field of fields) {
      // set value
      team.set(field.name || field.uuid, field.value);
    }

    // set acls
    team.set('acls', acls);

    // Save team
    await team.save(req.user);

    // get acl
    const acl = await team.get('acl') || await Acl.findOne({
      'team.id' : team.get('_id').toString(),
    }) || new Acl({
      team,
      name  : team.get('name'),
      value : team.get('acls'),
    });

    // creating
    const creating = !acl.get('_id');

    // save acl
    await acl.save(req.user);

    // check acl
    if (creating) {
      // set acl
      team.set('acl', acl);

      // save team again
      await team.save();
    }

    // set id
    req.params.id = team.get('_id').toString();

    // return update action
    return this.updateAction(req, res, next);
  }

  /**
   * Delete action
   *
   * @param {Request} req
   * @param {Response} res
   *
   * @route   {get} /:id/remove
   * @layout  admin
   */
  async removeAction(req, res) {
    // Set website variable
    let team = false;

    // Check for website model
    if (req.params.id) {
      // Load user
      team = await Team.findById(req.params.id);
    }

    // Render page
    res.render('team/admin/remove', {
      item  : await team.sanitise(),
      title : `Remove ${team.get('_id').toString()}`,
    });
  }

  /**
   * Delete action
   *
   * @param {Request} req
   * @param {Response} res
   *
   * @route   {post} /:id/remove
   * @title   Remove Team
   * @layout  admin
   */
  async removeSubmitAction(req, res) {
    // Set website variable
    let team = false;

    // Check for website model
    if (req.params.id) {
      // Load user
      team = await Team.findById(req.params.id);
    }

    // Alert Removed
    req.alert('success', `Successfully removed ${team.get('_id').toString()}`);

    // Delete website
    await team.remove(req.user);

    // Render index
    return this.indexAction(req, res);
  }

  /**
   * get flattened subs
   *
   * @param {Object} sub 
   */
  getFlatten(sub) {
    // return reduce
    return Object.keys(sub).reduce((accum, item) => {
      // sub item
      if (sub[item] === 'true') {
        // push sub
        accum.push(item);

        // accumulator
        return accum;
      }

      // push
      accum.push(...(this.getFlatten(sub[item]).map(i => `${item}.${i}`)));

      // return accum
      return accum;
    }, []).sort();
  }


  // ////////////////////////////////////////////////////////////////////////////
  //
  // QUERY METHODS
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * index action
   *
   * @param req
   * @param res
   *
   * @acl   admin
   * @fail  next
   * @route {GET} /query
   */
  async queryAction(req, res) {
    // find children
    let teams = await Team;

    // set query
    if (req.query.q) {
      teams = teams.where({
        name : new RegExp(escapeRegex(req.query.q || ''), 'i'),
      });
    }

    // add roles
    teams = await teams.skip(((parseInt(req.query.page, 10) || 1) - 1) * 20).limit(20).sort('name', 1)
      .find();

    // get children
    res.json((await Promise.all(teams.map(team => team.sanitise()))).map((sanitised) => {
      // return object
      return {
        text  : sanitised.name,
        data  : sanitised,
        value : sanitised.id,
      };
    }));
  }


  // ////////////////////////////////////////////////////////////////////////////
  //
  // GRID METHODS
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * User grid action
   *
   * @param {Request} req
   * @param {Response} res
   *
   * @route  {post} /grid
   * @return {*}
   */
  async gridAction(req, res) {
    // Return post grid request
    return (await this._grid(req)).post(req, res);
  }

  /**
   * Renders grid
   *
   * @param {Request} req
   *
   * @return {grid}
   */
  async _grid(req) {
    // Create new grid
    const teamGrid = new Grid();

    // Set route
    teamGrid.route('/admin/team/team/grid');

    // get form
    const form = await formHelper.get('admin.team');

    // Set grid model
    teamGrid.id('admin.team');
    teamGrid.row('team-row');
    teamGrid.model(Team);
    teamGrid.models(true);

    // Add grid columns
    teamGrid.column('_id', {
      sort     : true,
      title    : 'Id',
      priority : 100,
    });

    // branch fields
    await Promise.all((form.get('_id') ? form.get('fields') : (config.get('team.fields') || []).slice(0)).map(async (field, i) => {
      // set found
      const found = (config.get('team.fields') || []).find(f => f.name === field.name);

      // add config field
      await formHelper.column(req, form, teamGrid, field, {
        hidden   : !(found && found.grid),
        priority : 100 - i,
      });
    }));

    // add extra columns
    teamGrid.column('updated_at', {
      tag      : 'grid-date',
      sort     : true,
      title    : 'Updated',
      priority : 4,
    }).column('created_at', {
      tag      : 'grid-date',
      sort     : true,
      title    : 'Created',
      priority : 3,
    }).column('actions', {
      tag      : 'team-actions',
      type     : false,
      width    : '1%',
      title    : 'Actions',
      priority : 1,
    });

    // branch filters
    (config.get('team.fields') || []).slice(0).filter(field => field.grid).forEach((field) => {
      // add config field
      teamGrid.filter(field.name, {
        type  : 'text',
        title : field.label,
        query : (param) => {
          // Another where
          teamGrid.match(field.name, new RegExp(escapeRegex(param.toString().toLowerCase()), 'i'));
        },
      });
    });

    // Set default sort order 
    teamGrid.sort('priority', 1);

    // Return grid
    return teamGrid;
  }
}

/**
 * Export team controller
 *
 * @type {TeamAdminController}
 */
module.exports = TeamAdminController;
