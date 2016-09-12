#!/usr/bin/env node --stack-size=65536
'use strict';
var _ = require('lodash');
var comparator = require('../../');
var Bluebird = require('bluebird');
var Aigle = require('aigle');

// sampling times
var count = 100;
var times = 30000;
var funcs = {
  // 'promise': function() {
  //   var p = new Promise(function(resolve) {
  //     resolve(0);
  //   });
  //   _.times(count, function() {
  //     p = p.then(function(value) {
  //       return ++value;
  //     });
  //   });
  //   return p;
  // },
  'bluebird': function() {
    var sync;
    var p = new Bluebird(function(resolve) {
      resolve(0);
    });
    _.times(count, function() {
      p = p.then(function(value) {
        return ++value;
      });
    });
    return p;
  },
  'aigle': function() {
    var p = new Aigle(function(resolve) {
      resolve(0);
    });
    _.times(count, function() {
      p = p.then(function(value) {
        return ++value;
      });
    });
    return p;
  }
};

comparator
.set(funcs)
.times(times)
.async()
.concurrency(1)
.start()
.result(function(err, res) {
  console.log(res);
});


