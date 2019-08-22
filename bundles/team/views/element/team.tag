<element-team>
  <span each={ item, i in this.teams }>
    <a href="/admin//team/team/{ item.id }/update">{ item.name }</a>
    { i === this.teams.length - 1 ? '' : ', ' }
  </span>

  <script>
    // set teams
    this.teams = (Array.isArray(opts.data.value) ? opts.data.value : [opts.data.value]).filter(v => v);

  </script>
</element-team>
