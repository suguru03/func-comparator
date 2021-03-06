#!/usr/bin/env node --stack-size=65536
'use strict';
var _ = require('lodash');
var comparator = require('../../');
var Bluebird = require('bluebird');
var Aigle = require('aigle');

// sampling times
var count = 100;
var times = 100000;
var tasks = _.times(count, function() {
  return new Aigle(function(resolve) {
    resolve();
  });
});
var bluebirdTasks = _.times(count, function() {
  return new Bluebird(function(resolve) {
    resolve();
  });
});
var aigleTasks = _.times(count, function() {
  return new Aigle(function(resolve) {
    resolve();
  });
});

var funcs = {
  // 'promise': function() {
  //   return Promise.all(tasks);
  // },
  'bluebird': function() {
    return Bluebird.race(bluebirdTasks);
  },
  'aigle': function() {
    return Aigle.race(aigleTasks);
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


