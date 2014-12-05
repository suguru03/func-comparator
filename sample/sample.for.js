#!/usr/bin/env node --expose_gc
'use strict';
var comparator = require('../');

var time = 1000;
var funcs = {
  'for': function() {
    for(var i = 0; i < time; i++) {
      Math.floor(i);
    }
  },
  'for2': function() {
    for(var i = 0; i++ < time;) {
      Math.floor(i);
    }
  },
  'while': function() {
    var i = -1;
    while(++i < time) {
      Math.floor(i);
    }
  }
};

var res = comparator
.set(funcs)
.option({
  times: 5000
})
.start()
.result();

console.log(res);

