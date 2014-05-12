(function(d3, JQuery) {

  var svg = d3.select('body')
    .append('svg')
    .attr('width', 600)
    .attr('height', 600);

  // location of the bottom tip of the
  // baseball field
  var home = {
    x: 300,
    y: 500
  };

/**
 *  @param {string} filepath
 *  @param {function} cb
 *
 *  Loads the baseball data from the filepath then
 *  calls the passed callback.
 */

function load(filepath, cb) {
  d3.tsv(filepath)
  .row(function(d) {
    return {
      pitcher: d.pitcher,
      hitter: d.hitter,
      type: d.type,
      hit: d.hit,
      x: d.x,
      y: d.y
    };
  })
  .get(function(err, rows) {
    if (err) {
      cb(err, rows);
    }
    cb(null, rows);
  })
}

/**
 *  Stuff with baseball data
 */


function baseball(err, hits) {
  if (err) {
    throw err;
  }
  var data = [];
  for (var i = 0; i < 100; i++) {
    hits[i].x = parseFloat(hits[i].x);
    hits[i].y = parseFloat(hits[i].y);
    data.push(hits[i]);
  }

  var classMapping = {
    'Single': 'single',
    'Double': 'double',
    'Triple': 'triple',
    'Home Run': 'home-run',
    'Error': 'out'
  };

  // The x, y coord are given to us on a 250 x 250 scale
  // so we need to translate it to appropriate coords
  // given the scale of the our baseball svg where feet
  // are measured in pixels.
  var xscale = d3.scale.linear()
    .domain([0, 250])
    .range([0, 600]);
  var yscale = d3.scale.linear()
    .domain([0, 250])
    .range([0, 600]);
  console.log(data);

  svg.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', function(d) {
      return classMapping[d.type];
    })
    .attr('cx', function(d) {
      return xscale(d.x);
    })
    .attr('cy', function(d) {
      return yscale(d.y);
    })
    .attr('r', function(d) {
      return 3;
    });
  console.log('Done drawing');
}

/**
 *  Draw the baseball field
 */

function drawfield(svg) {
  var toMound = 60.0;
  var betweenBases = 90.0;
  var moundToBase = 127.28 / 2;
  var distToCenter = 405.36;
  var cornerToCenter = 573 / 2;
  var moundToOutfield = 95.0;

  // The corners of the field
  var leftCorner = {
    x: home.x - cornerToCenter,
    y: home.y - cornerToCenter
  };

  var rightCorner = {
    x: home.x + cornerToCenter,
    y: home.y - cornerToCenter
  };

  var outfield = [leftCorner, home, rightCorner];
  var center = [home, {
    x: home.x,
    y: home.y - distToCenter
  }];
  var bases = [{
    x: home.x - moundToBase,
    y: home.y - toMound
  }, {
    x: home.x,
    y: home.y - moundToBase * 2
  }, {
    x: home.x + moundToBase,
    y: home.y - toMound
  }];


  // line function
  var line = d3.svg.line()
    .x(function(d) { 
    return d.x; 
    })
    .y(function(d) { 
    return d.y; 
    })
    .interpolate('linear');

  var arc = d3.svg.arc()
    .innerRadius(function(d) {
      return d.radius; 
    })
    .outerRadius(function(d) {
      return d.radius;
    })
    .startAngle(0)
    .endAngle(function(d) {
      return d.perimeter;
    })

  svg.append('svg:path')
    .attr('d', line(outfield));

  svg.append('svg:path')
    .attr('d', line(bases));


  svg.append('svg:path')
    .attr('d', arc({
      radius: toMound + moundToOutfield,
      perimeter: Math.PI * 1/2
    }))
    .attr('transform', 'translate(' + home.x + ',' + home.y + 
          ')rotate(-45)');

  svg.append('svg:path')
    .attr('d', arc({
      radius: distToCenter,
      perimeter: Math.PI * 1/2
    }))
    .attr('transform', 'translate(' + home.x + ',' + home.y + 
          ')rotate(-45)');

}

  drawfield(svg);
  load('data/hits.tsv', baseball);
})(d3, $);
