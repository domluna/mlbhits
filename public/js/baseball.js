(function(d3, JQuery) {

var svg = d3.select('svg');

// baseball field
var home = {
  x: 300,
  y: 500
};
var hitDescription = ['Single', 'Double', 'Triple', 'Home Run', 
  'Error', 'Groundout', 'Flyout', 'Lineout'];
var descriptionColors = d3.scale.category10().domain(hitDescription);
var hitType = ['H', 'O', 'E'];
var typeColors = d3.scale.category10().domain(hitType);

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
      type: d.type,
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
    throw new Error('Problem occured loading the hits data...');
  }

  data = parseData(hits);
  originalData = parseData(hits);
  console.log(data);
  // Initialize the event handlers
  init();
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
 * Draw the hits 
 */

function drawhits(disp) {
  var circles = svg.selectAll('circle').data(data);

  circles.transition()
    .attr('cx', function(d) {
      return xscale(d.x);
    })
    .attr('cy', function(d) {
      return xscale(d.y);
    });

  circles.enter()
    .append('svg:circle')
    .attr('class', 'hit')
    .attr('fill', function(d) {
      return disp(d);
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
      d3.select('.info').text('Description: ' + d.description + ' Type: ' + d.type); 
    });

  circles.exit().remove();
}


/**
 * Initialize the event handlers
 */

function init() {
  drawhits(displayer('description'));
  // d3.select('.hit-options select')
  //   .on('change', function() {
  //     var temp = [];
  //     for (var i = 0; i < data.length; i++) {
  //       temp.push(data[i]);
  //     }
  //     data = [];
  //     for (var i = 0; i < temp.length; i++) {
  //       data.push(temp[i]);
  //     }
  //     drawhits(displayer(this.value));
  //   });

  d3.select('.player-options input[name="pitcher"]')
  .on('change', function() {
    var pitcher = this.value;
    for (var i = 0; i < originalData.length; i++) {
      var d = originalData[i];
      if (pitcher === d.pitcher) {
        data.push(d);
      }
    }
    drawhits(displayer('type'));
  })
  d3.select('.player-options input[name="hitter"]')
  .on('change', function() {
    var hitter = this.value;
    data = [];
    for (var i = 0; i < originalData.length; i++) {
      var d = originalData[i];
      if (hitter === d.hitter) {
        data.push(d);
      }
    }
    drawhits(displayer('type'));
    console.log(data);
  })

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

/**
 * @param {string} displayOption
 *
 * Returns a function which display hits
 * on the field, based on the option based
 */
function displayer(option) {
  if (option === 'description') {
    return function(d) {
      return descriptionColors(d.description);
    }
  } else {
    return function(d) {
      return typeColors(d.type);
    }
  }
}

function resetData() {
}

  drawfield();
  // drawlegend({});
  load('data/newhits.tsv', baseball);
})(d3, $);
