#!/usr/bin/env node --stack-size=65536
'use strict';
var comparator = require('../../');
var _ = require('lodash');
var async = require('async');
var neo_async = require('neo-async');

// roop count
var count = 100;
// sampling times
var times = 1000;
var array = _.shuffle(_.times(count));
var c = 0;
var iterator = function(n, callback) {
  c++;
  callback();
};
var funcs = {
  'async': function(callback) {
    c = 0;
    async.each(array, iterator, callback);
  },
  'neo-async': function(callback) {
    c = 0;
    neo_async.each(array, iterator, callback);
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


