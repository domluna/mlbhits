var express = require('express');

var app = express();

app.use(express.static(__dirname + '/public'));

// Rendering engine
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/templates');
app.set('view engine', 'html');

app.route('/*')
.get(function(req, res, next) {
  res.render('index', {});
})

var port = 3000 || process.env.PORT;

console.log('Listening on port', port);
app.listen(port);
