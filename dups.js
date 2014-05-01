"use strict";

var clc = require('cli-color');
var moment = require('moment-timezone');
var zoneNames = require('./zones');

if (process.argv.length < 3) {
	console.log("For what timezone should we find duplicates?");
	process.exit(1);
}

var designator = process.argv[2];

var zones = moment.tz.zones();
var selectedZone = zones.filter(function(zone) { return zone.displayName == designator });
if (selectedZone.length == 0) {
	console.log("Could not find zone " + designator);
	process.exit(2);
}
selectedZone = selectedZone[0];
console.log(clc.red(formatOffset(selectedZone)));
var selectedZoneInfo = getZoneInfoString(selectedZone);

zones.forEach(function(zone) {
	var info = getZoneInfoString(zone);

	if (info == selectedZoneInfo) {
		var z = zoneNames[zone.displayName];

		if (z === false) {
			console.log(clc.white(zone.displayName));
		}
		else if (z !== undefined && z !== null) {
			console.log(clc.green(z.location) + ' (' + zone.displayName + ')');
		}
		else {
			console.log(zone.displayName);
		}
	}
});

function getZoneInfoString(zone) {
	var lastZone = zone.zones[zone.zones.length - 1];
	var ruleSetName = lastZone.ruleSet.name;
	var offset = lastZone.offset.toString();
	return ruleSetName + '/' + offset;
}

function formatOffset(zone) {
	function pad(n, l) {
		var s = n.toString();
		while (s.length < l) {
			s = '0' + s;
		}
		return s;
	}

	function formatOffsetNumber(n) {
		var offsetIsNeg = n < 0;
		var offsetSign = offsetIsNeg ? '-' : '+';
		var offset = Math.abs(n);
		var offsetHours = Math.floor(offset/60);
		var offsetMinutes = offset - (offsetHours * 60);

		return offsetSign + pad(offsetHours, 2) + ':' + pad(offsetMinutes, 2);
	}

	var lastZone = zone.zones[zone.zones.length - 1];
	var hasDST = lastZone.ruleSet.name !== '-';

	if (hasDST) {
		return formatOffsetNumber(lastZone.offset) + ' / ' + formatOffsetNumber(lastZone.offset + 60);
	}
	else {
		return formatOffsetNumber(lastZone.offset);
	}
}
