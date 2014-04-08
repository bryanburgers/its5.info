"use strict";

var connect = require('connect');
var express = require('express');
var five = require('./five');
var moment = require('moment-timezone');
var mustacheExpress = require('mustache-express');

var zoneNames = require('./zones.json');

var app = express(express.logger());

// Set the mustache template engine for .mustache files.
app.engine('html', mustacheExpress());

// Set .mustache as the default extension.
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// Static stuffs
var oneDay = 24 * 60 * 60;
var oneMonth = 30 * oneDay;
app.use(connect.compress());
//app.use('/assets', express['static'](__dirname + '/assets', { maxAge: oneMonth }));
app.use(express.errorHandler());
//app.use(express.bodyParser());

app.get('/', function(req, res) {
	var data = {};
	data.zones = [];

	var now = moment();
	var zones = five(now);
	zones.buckets.forEach(function(bucket) {
		bucket.zones.forEach(function(zone) {

			zone.time = {
				'human': now.tz(zone.designator).format('h:mm a'),
				'iso': now.tz(zone.designator).format('YYYY[-]MM[-]DD[T]HH[:]MMZ')
			};

			// If the zone doesn't have a location, use its designator.
			if (!zone.location) {
				zone.location = zone.designator;
			}

			data.zones.push(zone);
		});
	});

	res.render('index', data);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on port " + port);
});


/*
var moment = require('moment-timezone');
var zones = moment.tz.zones();

function f() {
	var m = moment();
	var locations = [];
	zones.forEach(function(zone) {
		var mtz = m.tz(zone.displayName);

		var t = parseInt(mtz.format('HHmm'));
		if (1630 <= t && t < 1800) {
			locations.push([mtz.format('YYYY-MM-DD[T]HH:mm'), zone]);
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

	locations.forEach(function(thing) {
		var zone = thing[1];
		console.log(m.tz(zone.displayName).format('h:mm[pm]') + ' ' + zone.displayName);
	});

	console.log();
}

setInterval(f, 30000);
f();


*/
