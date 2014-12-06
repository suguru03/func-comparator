/* global performance */
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
    _forEach(name, _reverse(set.bind(this)));
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
  _forEach(options, function(value, key) {
    self._options[key] = value;
  });
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
  _forEach(keys, function(key) {
    results[key] = Array(times);
  });

  // comparison
  var timer = getTimer();
  if (!timer) {
    throw new Error('timer can not use');
  }

  var gc = objectTypes[typeof global] && global && global.gc;
  if (self._options.async) {
    self._start = true;
    whilist();
    return self;
  }
  _times(times, function(i) {
    var sample = _shuffle(keys);
    _forEach(sample, function(key) {
      var func = funcs[key];
      timer.init().start();
      func();
      var diff = timer.diff();
      results[key][i] = diff;
      if (gc) {
        gc();
      }
    });
  });
  self._results = results;
  return self;

  function whilist() {

    var count = 0;
    var end = false;
    iterate();

    function iterator(callback) {

      var index = 0;
      var sample = _shuffle(keys);
      var iterate = function() {
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
          iterate();
        });
      };
    }

    function iterate() {

      if (!end) {
        iterator(function(err) {
          if (err) {
            return done(err);
          }
          if (count++ >= times) {
            return done();
          }
          iterate();
        });
      } else {
        done();
      }
    }

    function done(err) {
      self._start = false;
      self.emit('result', err);
    }
  }
};

Comparator.prototype.on = function on(key, callback) {

  if (typeof key == 'object') {
    _forEach(key, _reverse(on));
    return this;
  }
  this._events[key] = this._events[key] || [];
  this._events[key].push(callback);
  return this;
};

Comparator.prototype.once = function once(key, callback) {

  if (typeof key == 'object') {
    _forEach(key, _reverse(once));
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
  _forEach(events, function(func, index) {
    func(err, res);
    if (func._once) {
      deleteFlags.unshift(index);
    }
  });
  if (deleteFlags.length) {
    _forEach(deleteFlags, function(index) {
      events.splice(index, 1);
    });
  }
  return this;
};

Comparator.prototype.result = function(callback) {

  var results = {};
  var opts = this._options;
  var async = opts.async;
  if (async && this._start) {
    this.once('result', this.result.bind(this, callback));
    return 'calculating...';
  }

  var res = opts.result === true;
  var max = opts.max !== false;
  var min = opts.min !== false;
  var ave = opts.average !== false;
  var varia = opts.variance !== false;
  var dev = opts.standard_deviation !== false;
  var vs = !(opts.versus === false || opts.vs === false);
  _forEach(this._results, function(array, key) {
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
      _forEach(array, function(n) {
        sum += n;
      });
      var average = sum / array.length;
      if (min) {
        data.min = Math.min.apply(null, array);
      }
      if (max) {
        data.max = Math.max.apply(null, array);
      }
      if (ave || vs) {
        data.average = Math.floor(100 * average) / 100;
      }
      if (varia || dev) {
        var variance = (function() {
          var variance = 0;
          _forEach(array, function(value) {
            variance += Math.pow(value - average, 2);
          });
          return variance / l;
        })();
        variance = Math.floor(100 * variance) / 100;
        if (varia) {
          data.variance = Math.floor(100 * variance) / 100;
        }
        if (dev) {
          data.standard_deviation = Math.sqrt(variance, 2);
        }
      }
    }

    results[key] = data;
  });
  if (vs) {
    _forEach(results, function(data, key) {
      data.vs = {};
      _forEach(results, function(_data, _key) {
        if (key === _key) {
          return;
        }
        data.vs[_key] =  Math.floor(10000 * _data.average / data.average) / 100;
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

function _reverse(func) {

  return function(value, key) {
    func(key, value);
  };
}

function _forEach(object, iterator) {

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

function _times(n, iterator) {

  var i = -1;
  while(++i < n) {
    iterator(i);
  }
}

function _shuffle(array) {

  var index = -1;
  var result = Array(array.length);
  _forEach(array, function(value) {
    var rand = Math.floor(Math.random() * (++index + 1));
    result[index] = result[rand];
    result[rand] = value;
  });
  return result;
}

function getTimer() {

  if (objectTypes[typeof process] && process && process.hrtime) {
    return nodeTimer();
  }
  if (objectTypes[typeof performance] && performance && performance.now) {
    return performanceTimer();
  }
}

function nodeTimer() {

  // process.hrtime
  return {

    _startTime: null,
    _diff: null,

    init: function() {

      this._startTime = null;
      this._diff = null;
      return this;
    },

    start: function () {

      this._startTime = process.hrtime();
      return this;
    },

    diff: function() {

      var diff = process.hrtime(this._startTime);
      // ns
      this._diff = diff[0] * 1e9 + diff[1];
      return this._diff / 1000;
    }
  };
}

function performanceTimer() {

  // performance.now
  return {

    _startTime: null,
    _diff: null,

    init: function() {

      this._startTime = null;
      this._diff = null;
      return this;
    },

    start: function () {

      this._startTime = performance.now();
      return this;
    },

    diff: function() {

      // ms
      this._diff = performance.now() - this._startTime;
      return this._diff * 1000;
    }
  };
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

