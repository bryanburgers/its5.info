"use strict";

var five = require('./five');
var moment = require('moment-timezone');
var shuffle = require('./shuffle');

var THREE = "It's {TIME} in {L1}; {L2}; and {L3}.";
var TWO = "It's {TIME} in {L1} and {L2}.";
var ONE = "It's {TIME} in {L1}.";

function replace(string, searchFor, value) {
	return string.replace('{' + searchFor + '}', value);
}

function createThree(time, zones) {
	if (zones.length < 3) {
		return null;
	}
	var s = THREE;
	s = replace(s, 'TIME', time);
	s = replace(s, 'L1', zones[0].location);
	s = replace(s, 'L2', zones[1].location);
	s = replace(s, 'L3', zones[2].location);

	return s;
}
function createTwo(time, zones) {
	if (zones.length < 2) {
		return null;
	}
	var s = TWO;
	s = replace(s, 'TIME', time);

	// It's 5:19 pm in Lima, Peru, and Panama City, Panama.
	//
	// In the above, if "Lima, Peru" includes a comma, we should add a comma
	// after the location.
	var l1 = zones[0].location;
	if (/,/.test(l1)) {
		l1 = l1 + ',';
	}
	s = replace(s, 'L1', l1);
	s = replace(s, 'L2', zones[1].location);

	return s;
}
function createOne(time, zones) {
	if (zones.length < 1) {
		return null;
	}
	var s = ONE;
	s = replace(s, 'TIME', time);
	s = replace(s, 'L1', zones[0].location);

	return s;
}

module.exports = function(t, len) {
	var result = five(t);
	var bucket = result.buckets[0];
	var shuffled = shuffle(bucket.zones, t.valueOf());
	var time = t.zone(bucket.offset).format('h:mm a');

	var three = createThree(time, shuffled);
	if (three !== null && three.length <= len) {
		return three;
	}
	var two = createTwo(time, shuffled);
	if (two !== null && two.length <= len) {
		return two;
	}
	var one = createOne(time, shuffled);
	if (one !== null && one.length <= len) {
		return one;
	}

	return null;
}
