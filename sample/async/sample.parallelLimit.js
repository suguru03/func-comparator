#!/usr/bin/env node --stack-size=65536
'use strict';
var comparator = require('../../');
var _ = require('lodash');
var async = require('async');
var neo_async = require('neo-async');

// roop count
var count = 1000;
// sampling times
var times = 1000;
var array = _.shuffle(_.times(count));
var tasks = _.map(array, function(n) {
  return function(next) {
    next(null, n);
  };
});
var funcs = {
  'async': function(callback) {
    async.parallelLimit(tasks, 4, callback);
  },
  'neo-async': function(callback) {
    neo_async.parallelLimit(tasks, 4, callback);
  }
};

comparator
.set(funcs)
.times(times)
.async()
.start()
.result(function(err, res) {
  console.log(res);
});


