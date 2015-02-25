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
    async.parallel(tasks, callback);
  },
  'neo-async': function(callback) {
    total = 0;
    neo_async.parallel(tasks, callback);
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


