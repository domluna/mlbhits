(function(d3, JQuery) {
  d3.select('body').append('p').text('New paragraph');
  d3.csv('data/baseball-pitches-clean.csv')
  .row(function(d) {
    return {
      pitchName: d.pitch_name,
      startSpeed: d.start_speed
    };
  })
  .get(function(err, rows) {
    if (err) {
      console.log(err);
      return;
    }
    console.log(rows);
  })

})(d3, $);
