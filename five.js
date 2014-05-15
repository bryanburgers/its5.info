"use strict";

var moment = require('moment-timezone');
var shuffle = require('./shuffle');
var zoneInfo = require('./zones');

function five(instant) {
	instant = instant || moment();
	// Clone it so we don't mess with the instant that the user passed in.
	instant = moment(instant);

	var zones = moment.tz.zones();
	var ret = {
		buckets: []
	};

	var locations = [];
	zones.forEach(function(zone) {
		var mtz = instant.tz(zone.displayName);

		// If the zone is marked in zoneInfo as false, don't include it.
		// Prefiltering the list means don't need to filter it later, and then
		// filter buckets that have no items.
		if (zoneInfo[zone.displayName] === false) {
			return;
		}

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
		var designator = thing[1];

		if (lastTimeBucket === null || lastTimeBucket.time !== thing[0]) {
			lastTimeBucket = {
				time: thing[0],
				offset: instant.tz(designator).format('Z'),
				zones: []
			};
			ret.buckets.push(lastTimeBucket);
		}

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

	// Shuffle
	ret.buckets.forEach(function(bucket) {
		// OK, so this is a little bit tricky. The order of locations within a
		// bucket should be randomized. However, it should stay consistent
		// throughout the entire 5pm hour, because the javascript might be
		// involved, so it should get the same result. So, use the
		// Moment.valueOf of the 5:00:00 pm instant of a bucket (regardless of
		// whether its 5:00pm or 5:37pm or 5:59:59pm) to seed a predictable
		// random generator (Merseinne Twister).
		var d = moment(bucket.time).zone(bucket.offset);
		d.minutes(0).seconds(0).milliseconds(0);
		bucket.zones = shuffle(bucket.zones, d.valueOf());
	});

	return ret;
}

module.exports = five;
