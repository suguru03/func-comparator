#!/usr/bin/env node --expose_gc
'use strict';
var comparator = require('../../');
var lodash = require('lodash');

// roop count
// sampling times
var times = 100000;
var funcs = {
  'var-hoge': function() {
    var hoge = function(a, b) {
      return a + b;
    };
    hoge(1, 2);
  },
  'b-hoge': function() {
    hoge(1, 2);
    function hoge(a, b) {
      return a + b;
    }
  },
  'a-hoge': function() {
    function hoge(a, b) {
      return a + b;
    }
    hoge(1, 2);
  },
  'i-hoge': function() {
    (function hoge(a, b) {
      return a + b;
    })(1, 2);
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

