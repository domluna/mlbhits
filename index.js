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

app.set('port', (process.env.PORT || 3000))

app.listen(app.get('port'), function() {
  console.log('Node app is running at localhost:' + app.get('port'))
})
