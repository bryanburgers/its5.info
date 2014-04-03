"use strict";

var moment = require('moment-timezone');
var zones = moment.tz.zones();

var things = {
};

zones = zones.filter(function(zone) { return /^America\//.test(zone.displayName); });
zones.forEach(function(zone) {
	var lastZone = zone.zones[zone.zones.length - 1];

	var ruleSetName = lastZone.ruleSet.name;
	var offset = lastZone.offset.toString();

	var key = ruleSetName + '/' + offset;
	if (!things[key]) {
		things[key] = [];
	}

	things[key].push(zone.displayName);
});

Object.keys(things).forEach(function(key) {
	var items = things[key];
	if (items.length > 1) {
		console.log(key);
		items.forEach(function(item) {
			console.log('   ' + item);
		});
	}
});
