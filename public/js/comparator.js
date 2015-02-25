/* global performance */

var util = {
  reverse: reverse,
  forEach: forEach,
  times: times,
  shuffle: shuffle
};

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


function Comparator() {

  this._funcs = {};
  this._events = {};
  this._options = {};
}

/**
 * @param {String|Object} name
 * @param {Function} func
 */
Comparator.prototype.set = function set(name, func) {

  if (typeof name == 'object') {
    util.forEach(name, util.reverse(set.bind(this)));
  } else {
    this._funcs[name] = func;
  }
  return this;
};

/**
 * @param {String|String[]} name
 */
Comparator.prototype.get = function(name) {

  var self = this;
  if (Array.isArray(name)) {
    return name.reduce(name, function(memo, name) {
      memo[name] = self._funcs[name];
      return memo;
    }, {});
  }
  return this._funcs[name];
};

/**
 * @param {Object} options
 * @param {Number} options.times - default 10
 * @param {Boolean} options.result - display result array [μs] | default false
 * @param {Boolean} options.min - display min [μs] | default true
 * @param {Boolean} options.max - display max [μs] | default true
 * @param {Boolean} options.average - display average [μs] | default true
 * @param {Boolean} options.variance - display variance | default true
 * @param {Boolean} options.standard_deviation - display standard deviation [μs] | default true
 * @param {Boolean} options.versus - vs other functions [%] | default true
 * @param {Boolean} options.vs - alias
 * @param {Boolean} options.async - use asynchronous
 */
Comparator.prototype.option = function(options) {

  var self = this;
  util.forEach(options, function(value, key) {
    self._options[key] = value;
  });
  return this;
};

/**
 * use asynchronous
 * @param {Boolean} bool - option.async
 */
Comparator.prototype.async = function(bool) {

  this._options.async = bool === false ? false : true;
  return this;
};

/**
 * @param {Number} times - option.times
 */
Comparator.prototype.times = function(times) {

  if (times) {
    this._options.times = times;
  }
  return this;
};

Comparator.prototype.start = function() {

  var self = this;
  var funcs = self._funcs;
  var keys = Object.keys(funcs);
  var size = keys.length;
  if (!size) {
    throw new Error('function does not set yet');
  }

  var times = self._options.times || 10;
  var results = {};
  util.forEach(keys, function(key) {
    results[key] = Array(times);
  });

  // comparison
  var timer = getTimer();
  if (!timer) {
    throw new Error('timer can not use');
  }

  var count = 0;
  var end = false;
  var gc = objectTypes[typeof global] && global && global.gc;
  if (self._options.async) {
    self._started = true;
    iterate();
    return self;
  }
  util.times(times, function(i) {
    var sample = util.shuffle(keys);
    util.forEach(sample, function(key) {
      var func = funcs[key];
      timer.init().start();
      func();
      var diff = timer.diff();
      results[key][i] = diff;
    });
    if (gc) {
      gc();
    }
  });
  self._results = results;
  return self;

  function iterate() {

    if (!end) {
      iterator(function(err) {
        if (err) {
          return done(err);
        }
        if (count++ >= times) {
          return done();
        }
        setTimeout(iterate);
      });
    } else {
      done();
    }
  }

  function done(err) {
    self._started = false;
    self._results = results;
    self.emit('result', err);
  }

  function iterator(callback) {

    var index = 0;
    var sample = util.shuffle(keys);
    (function _iterate() {
      var key = sample[index++];
      if (!key) {
        return callback();
      }
      timer.init().start();
      funcs[key](function(err) {
        var diff = timer.diff();
        results[key][count] = diff;
        if (err) {
          return callback(err);
        }
        if (gc) {
          gc();
        }
        setTimeout(_iterate);
      });
    })();
  }
};

Comparator.prototype.on = function on(key, callback) {

  if (typeof key == 'object') {
    util.forEach(key, util.reverse(on));
    return this;
  }
  this._events[key] = this._events[key] || [];
  this._events[key].push(callback);
  return this;
};

Comparator.prototype.once = function once(key, callback) {

  if (typeof key == 'object') {
    util.forEach(key, util.reverse(once));
    return this;
  }
  callback._once = true;
  this._events[key] = this._events[key] || [];
  this._events[key].push(callback);
  return this;
};

Comparator.prototype.emit = function emit(key, err, res) {

  var events = this._events[key] || [];
  if (!events.length) {
    return this;
  }
  var deleteFlags = [];
  util.forEach(events, function(func, index) {
    func(err, res);
    if (func._once) {
      deleteFlags.unshift(index);
    }
  });
  if (deleteFlags.length) {
    util.forEach(deleteFlags, function(index) {
      events.splice(index, 1);
    });
  }
  return this;
};

Comparator.prototype.result = function result(callback) {

  var results = {};
  var opts = this._options;
  var async = opts.async;
  if (async && this._started) {
    this.once('result', result.bind(this, callback));
    return 'calculating...';
  }

  var res = opts.result === true;
  var max = opts.max !== false;
  var min = opts.min !== false;
  var ave = opts.average !== false;
  var varia = opts.variance !== false;
  var dev = opts.standard_deviation !== false;
  var vs = !(opts.versus === false || opts.vs === false);
  util.forEach(this._results, function(array, key) {
    var l = array.length;
    if (!l) {
      return;
    }
    var data = {};
    if (res) {
      data.result = array;
    }
    if (ave || varia || dev || vs) {
      var sum = 0;
      util.forEach(array, function(n) {
        sum += n;
      });
      var average = sum / array.length;
      if (min) {
        data.min = resolveDecimal(Math.min.apply(null, array));
      }
      if (max) {
        data.max = resolveDecimal(Math.max.apply(null, array));
      }
      if (ave || vs) {
        data.average = resolveDecimal(average);
      }
      if (varia || dev) {
        var variance = (function() {
          var variance = 0;
          util.forEach(array, function(value) {
            variance += Math.pow(value - average, 2);
          });
          return variance / l;
        })();
        variance = resolveDecimal(variance);
        if (varia) {
          data.variance = variance;
        }
        if (dev) {
          data.standard_deviation = resolveDecimal(Math.sqrt(variance, 2));
        }
      }
    }

    results[key] = data;
  });
  if (vs) {
    util.forEach(results, function(data, key) {
      data.vs = {};
      util.forEach(results, function(_data, _key) {
        if (key === _key) {
          return;
        }
        data.vs[_key] =  resolveDecimal(100 * _data.average / data.average);
      });
      if (!ave) {
        delete data.average;
      }
    });
  }

  if (callback) {
    callback(null, results);
  }
  return results;
};

function getTimer() {

  if (objectTypes[typeof process] && process && process.hrtime) {
    return new NodeTimer();
  }
  if (objectTypes[typeof performance] && performance && performance.now) {
    return new PerformanceTimer();
  }
}
Comparator.prototype.getTimer = getTimer;

// process.hrtime
function NodeTimer() {

  this._startTime = null;
  this._diff = null;
}

NodeTimer.prototype.init = function() {

  this._startTime = null;
  this._diff = null;
  return this;
};

NodeTimer.prototype.start = function () {

  this._startTime = process.hrtime();
  return this;
};

NodeTimer.prototype.diff = function() {

  var diff = process.hrtime(this._startTime);
  // ns
  this._diff = diff[0] * 1e9 + diff[1];
  // μs
  return this._diff / 1000;
};

// performance.now
function PerformanceTimer() {

  this._startTime = null;
  this._diff = null;
}

PerformanceTimer.prototype.init = function() {

  this._startTime = null;
  this._diff = null;
  return this;
};

PerformanceTimer.prototype.start = function () {

  this._startTime = performance.now();
  return this;
};

PerformanceTimer.prototype.diff = function() {

  // ms
  this._diff = performance.now() - this._startTime;
  // μs
  return this._diff * 1000;
};

function resolveDecimal(num) {

  return Math.floor(100 * num) / 100;
}

var objectTypes = {
  'function': true,
  'object': true
};

(function() {
  var comparator = new Comparator();
  if (objectTypes[typeof module] && module && module.exports) {
    module.exports = comparator;
  } else {
    this.comparator = comparator;
  }
}).call(this);

