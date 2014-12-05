# Comparator
Comparator is intended functions speed comparison.

Run functions on the random, it is possible to easily compare the average time, variance, standard deviation and versus.

## installation
```bash
npm install func-comparator
```

## samples

### for
```js
var comparator = require('../');

var time = 1000;
var funcs = {
  'for': function() {
    for(var i = 0; i < time; i++) {
      Math.floor(i);
    }
  },
  'for2': function() {
    for(var i = 0; i++ < time;) {
      Math.floor(i);
    }
  },
  'while': function() {
    var i = -1;
    while(++i < time) {
      Math.floor(i);
    }
  }
};

var res = comparator.set(funcs)
.option({
  times: 5000
})
.start()
.result();

console.log(res);
/*
{ for:
   { average: 1277.2882,
     variance: 3962201.3123407266,
     standard_deviation: 1990.5278979056602,
     vs: { for2: 120.68, while: 136.92 } },
  for2:
   { average: 1541.4366,
     variance: 3791341.3851804687,
     standard_deviation: 1947.1367145581917,
     vs: { for: 82.86, while: 113.46 } },
  while:
   { average: 1748.9676,
     variance: 161116851.53854847,
     standard_deviation: 12693.181300940614,
     vs: { for: 73.03, for2: 88.13 } } }
 */
```

### forEach
```js
var comparator = require('../');
var _ = require('lodash');
var time = 1000;
var array = _.sample(_.times(time), time);
var funcs = {
  'forEach': function() {
    array.forEach(function(n) {
      Math.floor(n);
    });
  },
  'while': function() {
    var i = -1;
    var l = array.length;
    while(++i < l) {
      Math.floor(array[i]);
    }
  },
  'for': function() {
    var l = array.length;
    for(var i = 0; i < l; i++) {
      Math.floor(array[i]);
    }
  }
};

var res = comparator
.set(funcs)
.option({
  times: 5000
})
.start()
.result();

console.log(res);
/*
{ forEach:
   { average: 36673.405,
     variance: 103011676.17817602,
     standard_deviation: 10149.466792801286,
     vs: { while: 6.8, for: 5.96 } },
  while:
   { average: 2496.8982,
     variance: 6197164.420636774,
     standard_deviation: 2489.410456440796,
     vs: { forEach: 1468.75, for: 87.66 } },
  for:
   { average: 2189.0212,
     variance: 3295823.0127505376,
     standard_deviation: 1815.4401705235393,
     vs: { forEach: 1675.33, while: 114.06 } } }
 */
```
