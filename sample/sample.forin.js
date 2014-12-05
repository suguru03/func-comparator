#!/usr/bin/env node --expose_gc

'use strict';
var comparator = require('../');
var _ = require('lodash');
var time = 1000;
var object = _.chain(_.times(time))
.sample(time)
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

