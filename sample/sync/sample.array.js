#!/usr/bin/env node --expose_gc
'use strict';
var comparator = require('../../');

// roop count
var count = 100;
// sampling times
var times = 1000;
var funcs = {
  'for': function() {
    var array = [];
    for(var i = 0; i < count; i++) {
      array[i] = i;
    }
  },
  'init-for': function() {
    var array = [];
    array = Array(count);
    for(var i = 0; i++ < count;) {
      array[i] = i;
    }
  },
  'while': function() {
    var i = -1;
    var array = [];
    while(++i < count) {
      array[i] = i;
    }
  },
  'init-while': function() {
    var i = -1;
    var array = [];
    array = Array(count);
    while(++i < count) {
      array[i] = i;
    }
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

