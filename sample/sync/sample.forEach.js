#!/usr/bin/env node --expose_gc

'use strict';
var comparator = require('../../');
var lodash = require('lodash');
var lodash_node = require('lodash-node');
var underscore = require('underscore');
var _ = lodash;

// roop count
var count = 100;
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
    lodash.forEach(array, function(n) {
      Math.floor(n);
    });
  },
  'lodash-one': function() {
    lodash.forEach(array, Math.floor);
  },
  'lodash-node': function() {
    lodash_node.forEach(array, function(n) {
      Math.floor(n);
    });
  },
  'lodash-node-one': function() {
    lodash_node.forEach(array, Math.floor);
  },
  'underscore': function() {
    underscore.forEach(array, function(n) {
      Math.floor(n);
    });
  },
  'underscore-one': function() {
    underscore.forEach(array, Math.floor);
  }
};

var res = comparator
.set(funcs)
.times(times)
.start()
.result();

console.log(res);

