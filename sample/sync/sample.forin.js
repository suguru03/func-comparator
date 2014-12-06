#!/usr/bin/env node --expose_gc
'use strict';
var comparator = require('../');
var _ = require('lodash');
var __ = require('underscore');

// roop count
var count = 10000;
// sampling times
var times = 10000;
var object = _.chain(_.times(count))
.sample(count)
.reduce(function(memo, value, index) {
  memo['_' + index] = value;
  return memo;
}, {})
.value();

var funcs = {
  'for-in': function() {
    for (var key in object) {
      Math.floor(object[key]);
    }
  },
  'while': function() {
    var i = -1;
    var keys = Object.keys(object);
    var l = keys.length;
    while(++i < l) {
      Math.floor(object[keys[i]]);
    }
  },
  'for': function() {
    var keys = Object.keys(object);
    var l = keys.length;
    for(var i = 0; i < l; i++) {
      Math.floor(object[keys[i]]);
    }
  },
  'lodash': function() {
    _.forEach(object, function(n) {
      Math.floor(n);
    });
  },
  'lodash-one': function() {
    _.forEach(object, Math.floor);
  },
  'underscore': function() {
    __.forEach(object, function(n) {
      Math.floor(n);
    });
  },
  'underscore-one': function() {
    __.forEach(object, Math.floor);
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

