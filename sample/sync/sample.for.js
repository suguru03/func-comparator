#!/usr/bin/env node --expose_gc
'use strict';
var comparator = require('../../');
var lodash = require('lodash');
var lodash_node = require('lodash-node');
var underscore = require('underscore');

// roop count
var count = 100;
// sampling times
var times = 100000;
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
    lodash.times(count, function(i) {
      Math.floor(i);
    });
  },
  'lodash-one': function() {
    lodash.times(count, Math.floor);
  },
  'lodash-node': function() {
    lodash_node.times(count, function(i) {
      Math.floor(i);
    });
  },
  'lodash-node-one': function() {
    lodash_node.times(count, Math.floor);
  },
  'underscore': function() {
    underscore.times(count, function(i) {
      Math.floor(i);
    });
  },
  'underscore-one': function() {
    underscore.times(count, Math.floor);
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

