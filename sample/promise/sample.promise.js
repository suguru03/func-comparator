#!/usr/bin/env node --stack-size=65536
'use strict';
var comparator = require('../../');
var Bluebird = require('bluebird');
var Aigle = require('aigle');

// sampling times
var times = 1000000;
var handler = function(resolve) {
  resolve();
};
var funcs = {
  // 'promise': function() {
  //   return new Promise(handler);
  // },
  'bluebird': function() {
    return new Bluebird(handler);
  },
  'aigle': function() {
    return new Aigle(handler);
  }
};

comparator
.set(funcs)
.times(times)
.async()
.concurrency(2)
.start()
.result(function(err, res) {
  console.log(res);
});


