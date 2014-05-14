(function(d3, JQuery) {

var svg = d3.select('svg');

// baseball field
var home = {
  x: 300,
  y: 500
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

var originalData;
var data;
  
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
      description: d.description,
      class: d.class,
      x: d.x,
      y: d.y,
      id: d.id
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


function init(err, hits) {
  if (err) {
    throw new Error('Problem occured loading the hits data...');
    return;
  }

  console.log('Dataset Loaded ... ');

  data = parseData(hits);
  originalData = parseData(hits);

  // drawhits();
  // Pitcher
  d3.selectAll('.player-options input')
  .on('change', function() {
    var pitcher = $('.player-options input[name="pitcher"]').val();
    var hitter = $('.player-options input[name="hitter"]').val();

    // filtering function
    var fn = function(pitcher, hitter) {
      if (hitter && pitcher) {
        return function(d) {
          return d.pitcher === pitcher && d.hitter === hitter;
        }
      } else if (hitter) {
        return function(d) {
          return d.hitter === hitter;
        }
      } else if (pitcher) {
        return function(d) {
          return d.pitcher === pitcher;
        }
      }
    }(pitcher, hitter)

    // refresh
    drawhits(fn);
  })
}

/**
 * @param {object}  data
 *
 * Draw the legend
 */

function drawlegend() {
  svg.selectAll('.legend')
    .data(hitTypes).enter().append('text')
    .attr('class', 'legend-text')
    .attr('dy', function(d, i) {
      return 20 + i * 10;
    })
    .text(function(d, i) { 
      return d; 
    });
}

/**
 *  Draw the baseball field
 */

function drawfield() {
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

/**
 * Draw the hits. 
 *
 * @param {function} fn The filtering function
 */

function drawhits(fn) {
  fn = fn || function(d) { return true; }

  // if the key is the index, everything gets messed up
  var keyFn = function(d, i) { return d.id; }

  var colorMapping = {
    'H': 'hit',
    'O': 'out',
    'E': 'error'
  };
  var circles = svg.selectAll('circle').data(data.filter(fn), keyFn);

  circles.enter()
    .append('svg:circle')
    .attr('class', function(d) {
      return colorMapping[d.class];
    })
    .attr('cx', function(d) {
      return xscale(d.x);
    })
    .attr('cy', function(d) {
      return yscale(d.y);
    })
    .attr('r', function(d) {
      return 4.0;
    })
    .on('click', function(d) {
      d3.select('.info').text('Description: ' + d.description 
                              + ' Type: ' + d.class
                              + ' X: ' + d.x
                              + ' Y: ' + d.y); 
    });

  circles.transition()
    .attr('cx', function(d) {
      return xscale(d.x);
    })
    .attr('cy', function(d) {
      return xscale(d.y);
    });

  circles.exit().remove();
}

/**
 * @param {array} hits
 */

function parseData(hits) {
  var data = [];
  for (var i = 0; i < hits.length; i++) {
    hits[i].x = parseFloat(hits[i].x);
    hits[i].y = parseFloat(hits[i].y);
    data.push(hits[i]);
  }
  return data;
}

  drawfield();
  // drawlegend({});
  load('data/newhits.tsv', init);
})(d3, $);
