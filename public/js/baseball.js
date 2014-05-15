(function(d3, JQuery) {

var svg = d3.select('svg');

// Baseball field home plate
// location
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

var data;
  
/**
 *  Loads the baseball data from the filepath then
 *  calls the passed callback.
 *
 *  @param {string} filepath
 *  @param {function} cb
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


  var hitters = {};
  var pitchers = {};
  // fill autocomplete lists
  var pitcherList = d3.select('datalist#pitchers')
  var hitterList = d3.select('datalist#hitters')
  for (var i = 0; i < data.length; i++) {
    var d = data[i];
    if (!pitchers[d.pitcher]) {
      pitchers[d.pitcher] = true
    }

    if (!hitters[d.hitter]) {
      hitters[d.hitter] = true
    }
  }

  $('#hitters').autocomplete({
    source: Object.keys(hitters)
  })

  $('#pitchers').autocomplete({
    source: Object.keys(pitchers)
  })


  // Initialize input fields
  $('input')
    .on('autocompletechange', function() {
      console.log('New player ... ');
      var pitcher = $('#pitchers').val();
      var hitter = $('#hitters').val();

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
    legend();
  })

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

  // third base length
  svg.append('svg:text')
    .attr('transform', 'translate(' + (home.x - moundToBase - 15) + ',' + (home.y +
          - toMound - 4) + ')rotate(45)')
    .attr('font-size', '14')
    .attr('dy', '0.35em')
    .text(function(d) { return '90 feet' });

  // center field
  svg.append('svg:text')
    .attr('transform', 'translate(' + (home.x - 15) + ',' + (home.y +
          - distToCenter - 15) + ')rotate(0)')
    .attr('font-size', '14')
    .attr('dy', '0.35em')
    .text(function(d) { return Math.round(distToCenter)  + ' feet' });

}

/**
 * Draw the legend. 
 * 
 * Mapping between hit classification and 
 * display color.
 * 
 */

function drawlegend() {
  var called = false;
  return function() {
    if (called) { return; }
    console.log('Legend drawn ... ');
    called = true;
    svg.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(30, 30)')
      .call(d3.legend);
  }
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
      return 5.0;
    })
    .attr('data-legend', function(d) {
      return colorMapping[d.class];
    })
    .on('click', function(d) {
      d3.select('.info').text('Description: ' + d.description 
                              + ' X: ' + d.x
                              + ' Y: ' + d.y); 
    })
    .on('dblclick', function(d) {
      d3.select('.info').text('This hit was a : ' + d.description) 
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
 * Converts x,y co-ords from string
 * to numbers
 *
 * @param {array} hits
 * @return {array}
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

  // Start it up
  var legend = drawlegend();
  drawfield();
  load('data/newhits.tsv', init);
})(d3, jQuery);
