'use strict';

var express = require('express');
var path = require('path');

var app = express();

app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 1 }));
app.get('/', function(req, res) {
  res.render('top', {
    version: require('./package.json').version
  });
});

var port = process.env.PORT || 2000;
app.listen(port);
console.info('server started', { port: port });
