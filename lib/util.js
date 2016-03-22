'use strict';

exports.noop = noop;
exports.reverse = reverse;
exports.forEach = forEach;
exports.times = times;
exports.shuffle = shuffle;
exports.arrayMin = arrayMin;
exports.arrayMax = arrayMax;

function noop() {}

function reverse(func) {

  return function(value, key) {
    func(key, value);
  };
}

function forEach(object, iterator) {

  var i = -1;
  var l = 0;
  if (Array.isArray(object)) {
    l = object.length;
    while(++i < l) {
      if (iterator(object[i], i, object) === false) {
        break;
      }
    }
  } else if (typeof object == 'object') {
    var keys = Object.keys(object);
    l = keys.length;
    while(++i < l) {
      var key = keys[i];
      if (iterator(object[key], key, object) === false) {
        break;
      }
    }
  }
  return object;
}

function times(n, iterator) {

  var i = -1;
  while(++i < n) {
    iterator(i);
  }
}

function shuffle(array) {

  var index = -1;
  var result = Array(array.length);
  forEach(array, function(value) {
    var rand = Math.floor(Math.random() * (++index + 1));
    result[index] = result[rand];
    result[rand] = value;
  });
  return result;
}

function arrayMin(array) {
  var min = Infinity;
  forEach(array, function(num) {
    if (num < min) {
      min = num;
    }
  });
  return min;
}

function arrayMax(array) {
  var max = 0;
  forEach(array, function(num) {
    if (max < num) {
      max = num;
    }
  });
  return max;
}

