<team-admin-update-page>
  <div class="page page-admin">

    <admin-header title="{ opts.item && opts.item.id ? 'Update' : 'Create ' } Team" preview={ this.preview } on-preview={ onPreview }>
      <yield to="right">
        <a href="/admin/team" class="btn btn-lg btn-primary mr-2">
          Back
        </a>
        <button class={ 'btn btn-lg' : true, 'btn-primary' : opts.preview, 'btn-success' : !opts.preview } onclick={ opts.onPreview }>
          { opts.preview ? 'Alter Form' : 'Finish Altering' }
        </button>
      </yield>
    </admin-header>

    <form class="container-fluid" action="/admin/team/{ opts.item && opts.item.id ? opts.item.id + '/update' : 'create' }" method="post">
      <div class="card">
        <div class="card-body">
          <form-render ref="form" form={ opts.form } placement="team" positions={ this.positions } preview={ this.preview } class="d-block mb-3" />
          <div each={ key, i in Object.keys(opts.acls) } class="card mb-3">

            <div class="card-header" id={ key } data-toggle="collapse" data-target="#{ key }-body" aria-expanded="true" aria-controls="{ key }-body">
              <h5>
                { key }
              </h5>
              <p class="m-0">
                { Object.keys(opts.acls[key]).length } { Object.keys(opts.acls[key]).length === 1 ? 'Category' : 'Categories' }
              </p>
            </div>

            <div id="{ key }-body" class="collapse" aria-labelledby={ key }>
              <table class="table table-acl table-striped table-bordered">
                <tr class="acl-row" if={ getToggles(opts.acls[key]).length }>
                  <th>
                    General
                  </th>
                  <td each={ sub, a in getToggles(opts.acls[key], opts.acls[key]) } class="acl-section" data-toggle={ sub ? 'tooltip' : null } data-placement="top" title={ key + '.' + sub }>
                    { sub ? '' : '-' }
                    <label for={ key + '-' + sub } class="d-block mb-2" if={ sub }>
                      { sub }
                    </label>
                    <label class="switch" for={ key + '-' + sub } if={ sub }>
                      <input type="checkbox" name={ 'acl[' + key + '][' + sub + ']' } value="true" id={ key + '-' + sub } checked={ ((opts.item || {}).acls || []).includes(key + '.' + sub) }>
                      <span class="slider round"></span>
                    </label>
                  </td>
                </tr>

                <tr each={ section, a in getSubs(opts.acls[key]) } class="acl-row">
                  <th>
                    { section }
                  </th>
                  <td each={ item, b in getFlatten(opts.acls[key][section], opts.acls[key]) } class="acl-section" data-toggle={ item ? 'tooltip' : null } data-placement="top" title={ key + '.' + section + '.' + item }>
                    { item ? '' : '-' }
                    <label class="label-main mb-2" for={ key + '-' + section + '-' + item.split('.').join('-') } if={ item }>
                      { item }
                    </label>
                    <label class="switch" for={ key + '-' + section + '-' + item.split('.').join('-') } if={ item }>
                      <input type="checkbox" name={ 'acl[' + key + '][' + section + '][' + item.split('.').join('-') + ']' } value="true" id={ key + '-' + section + '-' + item.split('.').join('-') } checked={ ((opts.item || {}).acls || []).includes(key + '.' + section + '.' + item) }>
                      <span class="slider round"></span>
                    </label>
                  </td>
                </tr>
              </table>
            </div>

          </div>
        </div>

        <div class="card-footer text-right">
          <button type="submit" class={ 'btn btn-success' : true, 'disabled' : this.loading } disabled={ this.loading }>
            { this.loading ? 'Submitting...' : 'Submit' }
          </button>
        </div>
      </div>
    </form>

  </div>

  <script>
    // do mixin
    this.mixin('i18n');

    // set type
    this.type    = opts.item.type || 'raised';
    this.preview = true;

    // require uuid
    const uuid = require('uuid');

    // set placements
    this.positions = opts.positions || opts.fields.map((field) => {
      // return field
      return {
        'type'     : field.type,
        'uuid'     : uuid(),
        'name'     : field.name,
        'i18n'     : !!field.i18n,
        'label'    : field.label,
        'force'    : true,
        'multiple' : field.multiple,
        'children' : []
      };
    });

    /**
     * get max
     */
    getMax(subs) {
      // max
      return Object.keys(subs).reduce((accum, child) => {
        // check sub
        const itemSub = this.getFlatten(subs[child]);

        // return length
        itemSub.forEach((item) => {
          // includes
          if (!accum.includes(item)) accum.push(item);
        });

        // return top
        return accum;
      }, this.getToggles(subs)).sort((a, b) => a.localeCompare(b));
    }

    /**
     * gets toggles
     */
    getSubs(sub) {
      // return sub
      return Object.keys(sub).filter(s => sub[s] !== true).sort();
    }

    /**
     * gets toggles
     */
    getToggles(sub, withMax) {
      // all
      let all = [];

      // with max
      if (withMax) {
        // get all
        all = this.getMax(withMax);
      }

      // return sub
      const current = Object.keys(sub).filter(s => sub[s] === true).sort();

      // with max
      if (!withMax) return current;

      // return
      return all.map((item) => {
        // return
        if (current.includes(item)) return item;

        // return null
        return null;
      });
    }

    /**
     * get flatten
     */
    getFlatten(sub, withMax) {
      // all
      let all = [];

      // with max
      if (withMax) {
        // get all
        all = this.getMax(withMax);
      }

      // return reduce
      const current = Object.keys(sub).reduce((accum, item) => {
        // sub item
        if (sub[item] === true) {
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

      // return current
      if (!withMax) return current;

      // return
      return all.map((item) => {
        // return
        if (current.includes(item)) return item;

        // return null
        return null;
      });
    }

    /**
     * on submit
     *
     * @param  {Event} e
     *
     * @return {*}
     */
    async onSubmit (e) {
      // prevent default
      e.preventDefault();
      e.stopPropagation();

      // set loading
      this.loading = true;

      // update view
      this.update();

      // submit form
      await this.refs.form.submit();

      // set loading
      this.loading = false;

      // update view
      this.update();
    }

    /**
     * on preview
     *
     * @param  {Event} e
     *
     * @return {*}
     */
    onPreview (e) {
      // prevent default
      e.preventDefault();
      e.stopPropagation();

      // set loading
      this.preview = !this.preview;

      // update view
      this.update();
    }

    /**
     * get category
     *
     * @return {Object}
     */
    team () {
      // return category
      return opts.item;
    }

    /**
     * on language update function
     */
    this.on('mount', () => {
      // check frontend
      if (!this.eden.frontend) return;

      // tooltip
      jQuery('[data-toggle="tooltip"]', this.root).tooltip();
    });

    /**
     * on language update function
     */
    this.on('updated', () => {
      // check frontend
      if (!this.eden.frontend) return;

      // tooltip
      jQuery('[data-toggle="tooltip"]', this.root).tooltip();
    });

  </script>
</team-admin-update-page>
