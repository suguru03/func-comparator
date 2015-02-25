'use strict';

var statistic = require('../../../lib/statistic');
var _ = require('lodash');
var async = require('async');
var neo_async = require('neo-async');

var times = 100;
var create = function(count) {

  // sampling times
  var array = _.shuffle(_.times(count));
  var tasks = _.map(array, function(n, i) {
    if (i === 0) {
      return function(next) {
        next(null, n);
      };
    }
    return function(total, next) {
      next(null, total + n);
    };
  });
  var funcs = {
    'async': function(callback) {
      async.waterfall(tasks, callback);
    },
    'neo-async': function(callback) {
      neo_async.waterfall(tasks, callback);
    }
  };
  return funcs;
};

statistic
.create(create)
.times(times)
.async()
.count({
  lower: 10,
  upper: 1000,
  interval: 10
})
.start()
.result(function(err, res) {
  console.log(res);
})
.csv('waterfall_iojs_' + _.now());


