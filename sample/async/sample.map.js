'use strict';
var comparator = require('../../');
var _ = require('lodash');
var async = require('async');
var neo_async = require('neo-async');

// roop count
var count = 100;
// sampling times
var times = 10000;
var array = _.sample(_.times(count), count);
var iterator = function(n, callback) {
  Math.floor(n);
  callback();
};

var funcs = {
  'async': function(callback) {
    async.each(array, iterator, callback);
  },
  'neo-async': function(callback) {
    neo_async.each(array, iterator, callback);
  }
};

comparator
.set(funcs)
.option({
  times: times
})
.start()
.result(function(err, res) {
  console.log(res);
});


