#!/usr/bin/env node --stack-size=65536
'use strict';
var comparator = require('../../');
var util = require('../../lib/util');
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
    async.series(tasks, callback);
  },
  'neo-async': function(callback) {
    neo_async.series(tasks, callback);
  },
  //'iojs': function(callback) {
  //  util.forEach(tasks, function *(task) {
  //    yield task;
  //  });
  //  callback();
  //}
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


