<team-admin-page>
  <div class="page page-fundraiser">

    <admin-header title="Manage Teams">
      <yield to="right">
        <a href="/admin/team/create" class="btn btn-lg btn-success">
          <i class="fa fa-plus ml-2"></i> Create Team
        </a>
      </yield>
    </admin-header>

    <div class="container-fluid">

      <grid ref="grid" grid={ opts.grid } title="Team Grid" rows-class="row row-eq-height" />

    </div>
  </div>
</team-admin-page>
