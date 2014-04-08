"use strict";

var zoneInfo = require('./zones.json');
var moment = require('moment-timezone');

function five(instant) {
	instant = instant || moment();

	var zones = moment.tz.zones();
	var ret = {
		buckets: []
	};

	var locations = [];
	zones.forEach(function(zone) {
		var mtz = instant.tz(zone.displayName);

		var t = parseInt(mtz.format('HHmm'));
		if (1700 <= t && t < 1800) {
			locations.push([mtz.format('YYYY-MM-DD[T]HH:mm'), zone.displayName]);
		}
	});

	locations.sort(function(a, b) {
		var at = a[0];
		var bt = b[0];
		if (at < bt) {
			return -1;
		}
		if (at > bt) {
			return 1;
		}
		if (at === bt) {
			var atz = a[1];
			var btz = b[1];

			if (atz < btz) {
				return -1;
			}
			if (atz > btz) {
				return 1;
			}
			return 0;
		}
	});

	var lastTimeBucket = null;

	locations.forEach(function(thing) {
		if (lastTimeBucket === null || lastTimeBucket.time !== thing[0]) {
			lastTimeBucket = {
				time: thing[0],
				zones: []
			};
			ret.buckets.push(lastTimeBucket);
		}
		var designator = thing[1];

		var zone = {
			designator: designator
		};

		var zoneInfoEntry = zoneInfo[designator];
		if (zoneInfoEntry === false) {
			// If it's false, we don't want it.
			return;
		}

		if (zoneInfoEntry === null) {
			// If it's null, then there is no name.
		}

		if (zoneInfoEntry !== null && zoneInfoEntry.location) {
			zone.location = zoneInfoEntry.location;
		}

		lastTimeBucket.zones.push(zone);
	});

	return ret;
}

module.exports = five;
