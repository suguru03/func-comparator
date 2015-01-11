# Comparator
Comparator is intended functions speed comparison.

Run functions on the random, it is possible to easily compare the average time, variance, standard deviation and versus.

## installation
```bash
npm install func-comparator
```
## async samples

### async.waterfall

```bash
$ node sample/async/sample.waterfall.js
# using gc
$ node --expose_gc sample/async/sample.waterfall.js
```

```js
var comparator = require('func-comparator');
var _ = require('lodash');
var async = require('async');
var neo_async = require('neo-async');

// roop count
var count = 100;
// sampling times
var times = 1000;
var array = _.sample(_.times(count), count);
var tasks = _.map(array, function(n, i) {
  if (i === 0) {
    return function(next) {
      next(null, n);
    };
  }
  return function(total, next) {
    next(null, total + n);
  };
});

var funcs = {
  'async': function(callback) {
    async.waterfall(tasks, callback);
  },
  'neo-async': function(callback) {
    neo_async.waterfall(tasks, callback);
  }
};

comparator
.set(funcs)
.option({
  async: true,
  times: times
})
.start()
.result(function(err, res) {
  console.log(res);
});
/*
{ async:
   { min: 478.96,
     max: 8620.69,
     average: 733.06,
     variance: 318972.64,
     standard_deviation: 564.77,
     vs: { 'neo-async': 10.25 } },
  'neo-async':
   { min: 21.63,
     max: 8403.57,
     average: 75.19,
     variance: 204911.01,
     standard_deviation: 452.67,
     vs: { async: 974.94 } } }
 */
// using gc
/*
{ async:
   { min: 726.73,
     max: 3904.74,
     average: 1044.36,
     variance: 58954.15,
     standard_deviation: 242.8,
     vs: { 'neo-async': 17.03 } },
  'neo-async':
   { min: 44.85,
     max: 680.1,
     average: 177.95,
     variance: 18799.21,
     standard_deviation: 137.11,
     vs: { async: 586.88 } } }
*/
```


## sync samples
### Node.js

#### for

```bash
$ node samle/sync/sample.for.js
```

```js
// roop count
var count = 1000;
// sampling times
var times = 10000;
var funcs = {
  'for': function() {
    for(var i = 0; i < count; i++) {
      Math.floor(i);
    }
  },
  'for2': function() {
    for(var i = 0; i++ < count;) {
      Math.floor(i);
    }
  },
  'while': function() {
    var i = -1;
    while(++i < count) {
      Math.floor(i);
    }
  }
};

// get result
var result = comparator
.set(funcs)
.option({
  times: times
})
.start()
.result();

console.log(result);
/*
{ for:
   { min: 1.11,
     max: 78.15,
     average: 1.23,
     variance: 1.11,
     standard_deviation: 1.05,
     vs: { for2: 125.2, while: 128.45 } },
  for2:
   { min: 1.4,
     max: 113.01,
     average: 1.54,
     variance: 2.93,
     standard_deviation: 1.71,
     vs: { for: 79.87, while: 102.59 } },
  while:
   { min: 1.39,
     max: 439.58,
     average: 1.58,
     variance: 25.15,
     standard_deviation: 5.01,
     vs: { for: 77.84, for2: 97.46 } } }
 */
```

#### forEach

```bash
$ node sample/sync/sample.forEach.js
```

```js
/*
{ forEach:
   { min: 33.27,
     max: 990.1,
     average: 37.2,
     variance: 202.43,
     standard_deviation: 14.22,
     vs: { while: 6.61, for: 5.99 } },
  while:
   { min: 2.24,
     max: 134.94,
     average: 2.46,
     variance: 2.62,
     standard_deviation: 1.61,
     vs: { forEach: 1512.19, for: 90.65 } },
  for:
   { min: 1.96,
     max: 491.39,
     average: 2.23,
     variance: 30.4,
     standard_deviation: 5.51,
     vs: { forEach: 1668.16, while: 110.31 } } }
 */
```

### Chrome

```bash
$ node server.js
server started { port: 2000 }
```

* Access to http://localhost:2000
* Copy sample script to chrome console

```js
/* global comparator, _: lodash, __: underscore */
// roop count
var count = 100;
// sampling times
var times = 1000;
var funcs = {
  'for': function() {
    for(var i = 0; i < count; i++) {
      Math.floor(i);
    }
  },
  'for2': function() {
    for(var i = 0; i++ < count;) {
      Math.floor(i);
    }
  },
  'while': function() {
    var i = -1;
    while(++i < count) {
      Math.floor(i);
    }
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
/*
{
   "for":{
      "min":23.999993572942913,
      "max":188.99999849963933,
      "average":28.66,
      "variance":116.42,
      "standard_deviation":10.789810007595129,
      "vs":{
         "for2":100.27,
         "while":99.02
      }
   },
   "for2":{
      "min":23.999993572942913,
      "max":197.00000120792538,
      "average":28.74,
      "variance":97.1,
      "standard_deviation":9.85393322486001,
      "vs":{
         "for":99.72,
         "while":98.74
      }
   },
   "while":{
      "min":23.00000051036477,
      "max":151.99999324977398,
      "average":28.38,
      "variance":83.23,
      "standard_deviation":9.123047736365299,
      "vs":{
         "for":100.98,
         "for2":101.26
      }
   }
}
 */
```
