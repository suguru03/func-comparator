#!/usr/bin/env node --expose_gc
'use strict';
var comparator = require('../');
var _ = require('lodash');
var __ = require('underscore');

// roop count
var count = 1000;
// sampling times
var times = 1000;
var funcs = {
  'for': function() {
    for(var i = 0; i < count; i++) {
      Math.floor(i);
    }
  },
  'for2': function() {
    for(var i = 0; i++ < count;) {
      Math.floor(i);
    }
  },
  'while': function() {
    var i = -1;
    while(++i < count) {
      Math.floor(i);
    }
  },
  'lodash': function() {
    _.times(count, function(n) {
      Math.floor(n);
    });
  },
  'lodash-one': function() {
    _.times(count, Math.floor);
  },
  'underscore': function() {
    __.times(count, function(n) {
      Math.floor(n);
    });
  },
  'underscore-one': function() {
    __.times(count, Math.floor);
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

