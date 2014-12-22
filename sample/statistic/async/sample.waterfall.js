'use strict';

var statistic = require('../../../lib/statistic');
var _ = require('lodash');
var async = require('async');
var neo_async = require('neo-async');

var times = 1000;
var create = function(count) {

  // sampling times
  var array = _.sample(_.times(count), count);
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
.option({
  async: true,
  times: times,
  count: {
    lower: 1,
    upper: 50,
    interval: 1
  }
})
.start()
.result(function(err, res) {
  console.log(res);
});


