var Timer = require('neo-timer').Timer;

var util = require('./util');
var nextTick = /^0.10/.test(process.versions.node) ? setImmediate : process.nextTick;

function Comparator() {
  this._funcs = {};
  this._events = {};
  this._options = {
    result: false,
    adjustment: 10e5,
    min: true,
    max: true,
    average: true,
    variance: true,
    standard_deviation: true,
    versus: true,
    vs: undefined,
    times: 10,
    skip: 0.5,
    concurrency: 1,
    async: false
  };
}

/**
 * @param {string|Object} name
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
 * @param {string|string[]} name
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
 * @param {number} options.times - default 10
 * @param {number} option.skip - skip rate is to wait for the optimization | default 0.5
 * @param {number} options.concurrency - default 1 (async only)
 * @param {boolean} options.adjustment - default [μs] (10e-6)
 * @param {boolean} options.result - display result array [μs] | default false
 * @param {boolean} options.min - display min [μs] | default true
 * @param {boolean} options.max - display max [μs] | default true
 * @param {boolean} options.average - display average [μs] | default true
 * @param {boolean} options.variance - display variance | default true
 * @param {boolean} options.standard_deviation - display standard deviation [μs] | default true
 * @param {boolean} options.versus - vs other functions [%] | default true
 * @param {boolean} options.vs - alias
 * @param {boolean} options.async - use asynchronous | default false
 * @param {boolean} options.error - default true
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
 * @param {boolean} bool - option.async
 */
Comparator.prototype.async = function(bool) {
  this._options.async = bool === false ? false : true;
  return this;
};

/**
 * @param {number} concurrency - option.concurrency
 */
Comparator.prototype.concurrency = function(concurrency) {
  this._options.concurrency = concurrency;
  return this;
};


/**
 * @param {number} times - option.times
 */
Comparator.prototype.times = function(times) {
  if (times) {
    this._options.times = times;
  }
  return this;
};

/**
 * @param {number} skip - option.skip
 */
Comparator.prototype.skip = function(skip) {
  if (typeof skip === 'number') {
    this._options.skip = skip;
  }
  return this;
};

/**
 * @param {Function|boolean} func
 */
Comparator.prototype.error = function(func) {
  if (typeof func !== 'undefined') {
    this._options.error = typeof func === 'function' ? func : util.noop;
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

  var times = self._options.times;
  var error = self._options.error;
  var skip = Math.floor(times * self._options.skip);
  var results = {};
  util.forEach(keys, function(key) {
    results[key] = Array(times - skip);
  });

  var timer = getTimer();
  if (!timer) {
    throw new Error('timer can not use');
  }
  var gc = objectTypes[typeof global] && global && global.gc;
  if (self._options.async) {
    self._started = true;
    whilist();
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

  function whilist() {
    var started = 0;
    var called = 0;
    var end = false;
    var concurrency = self._options.concurrency;
    util.times(Math.min(concurrency, times), function() {
      nextTick(iterate);
    });

    function done(err) {
      self._started = false;
      self._err = err;
      self._results = results;
      self.emit('result');
    }

    function iterate() {
      if (!end && started < times) {
        iterator(started++, iteratee);
      }
    }

    function iteratee(err) {
      if (err) {
        return done(err);
      }
      if (++called >= times) {
        return done();
      }
      nextTick(iterate);
    }

    function iterator(count, callback) {
      var index = 0;
      var called = 0;
      var sample = util.shuffle(keys);
      _iterate();

      function _iterate() {
        var key = sample[index++];
        timer.init().start();
        var p = funcs[key](_done);
        if (p && p.toString() === '[object Promise]') {
          return p.then(function() {
            _done();
          }, function(err) {
            _done(err);
          });
        }

        function _done(err) {
          // s -> μs
          var diff = timer.diff();
          if (count >= skip) {
            results[key][count - skip] = diff;
          }
          if (err) {
            if (!error) {
              return callback(err);
            }
            error();
          }
          if (gc) {
            global.gc();
          }
          if (++called === size) {
            callback();
          } else {
            nextTick(_iterate);
          }
        }
      }
    }

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

  var adjustment = opts.adjustment;
  var res = opts.result === true;
  var max = opts.max !== false;
  var min = opts.min !== false;
  var ave = opts.average !== false;
  var varia = opts.variance !== false;
  var dev = opts.standard_deviation !== false;
  var vs = !(opts.vs === false || opts.versus === false);
  util.forEach(this._results, function(array, key) {
    var l = array.length;
    if (!l) {
      return;
    }
    if (adjustment) {
      util.forEach(array, function(value, index) {
        array[index] = value * adjustment;
      });
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
        data.min = util.arrayMin(array);
      }
      if (max) {
        data.max = util.arrayMax(array);
      }
      if (ave || vs) {
        data.average = average;
      }
      if (varia || dev) {
        var variance = (function() {
          var variance = 0;
          util.forEach(array, function(value) {
            variance += Math.pow(value - average, 2);
          });
          return variance / l;
        })();
        variance = variance;
        if (varia) {
          data.variance = variance;
        }
        if (dev) {
          data.standard_deviation = Math.sqrt(variance, 2);
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
    callback(this._err, results);
  }
  return results;
};

function getTimer() {
  return new Timer();
}
Comparator.prototype.getTimer = getTimer;

function resolveDecimal(num) {
  return Math.floor(100 * num) / 100;
}

var objectTypes = {
  'function': true,
  'object': true
};

(function() {

  'use strict';

  var comparator = new Comparator();
  if (objectTypes[typeof module] && module && module.exports) {
    module.exports = comparator;
    module.exports.Comparator = Comparator;
  } else {
    this.comparator = comparator;
  }
}).call(this);

