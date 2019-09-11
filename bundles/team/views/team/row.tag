<team-row class="col-lg-3 col-md-4">
  <div class="card card-{ opts.row.get('color') || 'primary' }">
    <div class="card-header d-flex flex-row">
      <div class="input-group mr-3">
        <input class="form-control" ref="name" type="text" value={ opts.row.get('name') || opts.row.get('id') } onkeyup={ onHasEdit } />
        <div class="input-group-append" if={ this.hasEdit }>
          <button class="{ 'btn' : true, 'btn-success' : this.completeEdit, 'disabled' : loading() }{ !this.completeEdit ? 'btn-' + (opts.row.get('color') || 'primary') : '' }" onclick={ onSubmitEdit }>
            <i class={ 'fa' : true, 'fa-check' : !loading() || this.completeEdit, 'fa-spinner fa-spin' : loading() && !get('completeEdit') } />
          </button>
        </div>
      </div>

      <div class="card-header-action d-flex">
        <div class="btn-group">
          <button class="btn btn-moves btn-{ opts.row.get('color') || 'primary' }">
            <i class="fa fa-arrows" />
          </button>
          <div class="btn-group" role="group">
            <button id="color-pick-{ opts.row.get('id') }" class="btn btn-{ opts.row.get('color') || 'primary' } dropdown-toggle no-caret" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <i class="fa fa-eye-dropper" />
            </button>
            <div class="dropdown-menu" aria-labelledby="color-pick-{ opts.row.get('id') }">
              <button each={ color, i in colors } class="btn btn-{ color } mx-2" onclick={ onSetColor }>
                &nbsp;&nbsp;
              </button>
            </div>
          </div>
        </div>

        <a class="btn btn-{ opts.row.get('color') || 'primary' } ml-2" href="/admin/team/{ opts.row.get('id') }/update">
          <i class="fa fa-pencil" />
        </a>
      </div>
    </div>

    <div class="card-body">
      <span class="btn btn-secondary mb-2 mr-2" each={ acl, i in opts.row.get('acls') || [] }>
        { acl }
      </span>
    </div>

    <div class="card-footer">
      { (opts.row.get('members') || []).length } Member{ (opts.row.get('members') || []).length === 1 ? '' : 's' }

      <div class="member-images">
        <a each={ member, i in (opts.row.get('members') || []) } href="/admin/user/{ member.id }/update">
          <media-img image={ member.avatar } img-class="rounded-circle" />
        </a>
      </div>
    </div>
  </div>

  <script>
    // do mixins
    this.mixin('loading');

    // colors
    this.colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'white'];

    /**
      * on has edit
      *
      * @param {Event} e
      */
    onHasEdit(e) {
      // get keycode
      const keycode = (e.keyCode ? e.keyCode : e.which);

      // submit edit
      if (parseInt(keycode, 10) === 13) return this.onSubmitEdit(e);

      // set has edit
      this.hasEdit = true;

      // update view
      this.update();
    }

    /**
      * on has edit
      *
      * @param {Event} e
      */
    async onSubmitEdit(e) {
      // prevent default
      e.preventDefault();
      e.stopPropagation();

      // set has edit
      this.loading('name', true);

      // fetch new section
      await eden.router.post(`/api/team/${opts.row.get('id')}/update`, {
        name : this.refs.name.value,
      });

      // set name
      this.opts.row.set('name', this.refs.name.value);

      // has edit
      this.completeEdit = true;
      this.update();

      // timeout
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // update
      this.hasEdit = false;
      this.completeEdit = false;
      this.update();
      
      // set has edit
      this.loading('name', false);
    }

    /**
      * on set color
      *
      * @param {Event}  e
      * @param {String} color
      */
    async onSetColor(e) {
      // prevent default
      e.preventDefault();
      e.stopPropagation();

      // set has edit
      this.loading('color', true);

      // fetch new section
      await eden.router.post(`/api/team/${opts.row.get('id')}/update`, {
        color : e.item.color,
      });

      // set name
      this.opts.row.set('color', e.item.color);

      // set has edit
      this.loading('color', false);
    }
  </script>
</team-row>