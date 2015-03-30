#!/usr/bin/env node --expose_gc
'use strict';
var _ = require('lodash');
var comparator = require('../../');

// roop count
var count = 100;
// sampling times
var times = 10000;
var array = _.times(count, function(n) {
  return {
    id: n,
    text: n + ''
  };
});
var findList = _.shuffle(_.times(count));

var funcs = {
  'find': function() {
    _.forEach(findList, function(n) {
      _.find(array, 'id', n);
    });
  },
  'map': function() {
    var map = {};
    _.forEach(array, function(data) {
      map[data.id] = data;
    });
    _.forEach(findList, function(n) {
      map[n];
    });
  }
};

var res = comparator
.set(funcs)
.times(times)
.start()
.result();

console.log(res);

