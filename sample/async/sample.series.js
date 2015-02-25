#!/usr/bin/env node --stack-size=65536
'use strict';
var comparator = require('../../');
var util = require('../../lib/util');
var _ = require('lodash');
var async = require('async');
var neo_async = require('neo-async');

// roop count
var count = 100;
// sampling times
var times = 1000;
var array = _.shuffle(_.times(count));
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
  },
  'iojs': function(callback) {
    total = 0;
    util.forEach(tasks, function *(task) {
      yield task;
    });
    callback();
  }
};
if (typeof process != 'object' || !process.execArgv || process.execArgv.indexOf('--harmony') < 0) {
  delete funcs.iojs;
}

comparator
.set(funcs)
.times(times)
.async()
.start()
.result(function(err, res) {
  console.log(res);
});


