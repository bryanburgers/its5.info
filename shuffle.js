"use strict";

var Random = require('random-js');

module.exports = function shuffle(arr, seed) {
	var mt = Random.engines.mt19937();
	mt.seed(seed);
	var newarr = arr.slice(0);
	Random.shuffle(mt, newarr);
	return newarr;
};
