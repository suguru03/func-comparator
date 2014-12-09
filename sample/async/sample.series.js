#!/usr/bin/env node --stack-size=65536
'use strict';
var comparator = require('../../');
var _ = require('lodash');
var async = require('async');
var neo_async = require('neo-async');

// roop count
var count = 10;
// sampling times
var times = 500;
var array = _.sample(_.times(count), count);
var total = 0;
var tasks = _.map(array, function(n) {
  return function(next) {
    total += n;
    next();
  };
});
var funcs = {
  'async': function(callback) {
    total = 0;
    async.series(tasks, callback);
  },
  'neo-async': function(callback) {
    total = 0;
    neo_async.series(tasks, callback);
  }
};

comparator
.set(funcs)
.option({
  async: true,
  times: times
})
.start()
.result(function(err, res) {
  console.log(res);
});


