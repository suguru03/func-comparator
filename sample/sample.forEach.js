#!/usr/bin/env node --expose_gc

'use strict';
var comparator = require('../');
var _ = require('lodash');
var __ = require('underscore');

// roop count
var count = 1000;
// sampling times
var times = 10000;
var array = _.sample(_.times(count), count);
var funcs = {
  'forEach': function() {
    array.forEach(function(n) {
      Math.floor(n);
    });
  },
  'while': function() {
    var i = -1;
    var l = array.length;
    while(++i < l) {
      Math.floor(array[i]);
    }
  },
  'for': function() {
    var l = array.length;
    for(var i = 0; i < l; i++) {
      Math.floor(array[i]);
    }
  },
  'lodash': function() {
    _.forEach(array, function(n) {
      Math.floor(n);
    });
  },
  'lodash-one': function() {
    _.forEach(array, Math.floor);
  },
  'underscore': function() {
    __.forEach(array, function(n) {
      Math.floor(n);
    });
  },
  'underscore-one': function() {
    __.forEach(array, Math.floor);
  }
};

var res = comparator
.set(funcs)
.option({
  times: times
})
.start()
.result();

console.log(res);

