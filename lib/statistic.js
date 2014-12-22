var util = require('./util');
var comparator = require('./comparator');
for(var key in comparator) {
  if (/^start$|^result$/.test(key)) {
    Statistic.prototype['_' + key] = comparator[key];
  } else {
    Statistic.prototype[key] = comparator[key];
  }
}

function Statistic() {
}

Statistic.prototype.create = function(createFuncs) {
  this._createFuncs = createFuncs;
  return this;
};

/**
 * @param {Object} options
 * @param {Number} options.times - default 10
 * @param {Object} options.count
 * @param {Number} options.count.lower - default 1
 * @param {Number} options.count.upper - default 10
 * @param {Number} options.count.interval - default 1
 */
Statistic.prototype.option = function(options) {

  var self = this;
  util.forEach(options, function(value, key) {
    self._options[key] = value;
  });
  return this;
};

// TODO async only
Statistic.prototype.start = function() {

  var self = this;
  self._options.async = true;
  var createFuncs = self._createFuncs;
  if (typeof createFuncs != 'function') {
    throw new Error('create functions is required');
  }

  var count = self._options.count || {};
  var lower = count.lower || 1;
  var upper = count.upper || 10;
  var interval = count.interval || 1;
  var results = [];

  (function execute(count) {
    self._started = true;
    self._result(function(err, res) {
      if (err) {
        return self.emit('statistic_result', err);
      }
      res.count = count;
      results.push(res);
      count += interval;
      if (count > upper) {
        self._results = results;
        self.emit('statistic_result');
      } else {
        execute(count);
      }
    });
    self.set(createFuncs(count));
    self._start();
  })(lower);

  return this;
};

Statistic.prototype.result = function result(callback) {

  if (this._options.async && this._started)  {
    this.once('statistic_result', result.bind(this, callback));
    return this;
  }
  var results = {};
  util.forEach(this._results, function(result) {
    util.forEach(result, function(data, key) {
      results[key] = results[key] || [];
      if (key === 'count') {
        results[key].push(data);
      } else {
        results[key].push(data.average);
      }
    });
  });

  callback(null, results);

  return this;
};

var objectTypes = {
  'function': true,
  'object': true
};

(function() {
  var statistic = new Statistic();
  if (objectTypes[typeof module] && module && module.exports) {
    module.exports = statistic;
  } else {
    this.statistic = statistic;
  }
}).call(this);

