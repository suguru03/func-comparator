#!/usr/bin/env node --stack-size=65536
'use strict';
var comparator = require('../../');
var _ = require('lodash');
var async = require('async');
var Promise = require('bluebird');
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
var promiseIterator = function(n) {
  c++;
  return n;
};
var funcs = {
  'async': function(callback) {
    c = 0;
    async.each(array, iterator, callback);
  },
  'neo-async': function(callback) {
    c = 0;
    neo_async.each(array, iterator, callback);
  },
  'bluebird': function() {
    c = 0;
    return Promise.map(array, promiseIterator);
  }
};

comparator
.set(funcs)
.times(times)
.async()
.concurrency(2)
.start()
.result(function(err, res) {
  console.log(res);
});


