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
