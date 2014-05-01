"use strict";

var connect = require('connect');
var express = require('express');
var five = require('./five');
var hashdirectory = require('hashdirectory');
var moment = require('moment-timezone');
var mustacheExpress = require('mustache-express');

var zoneNames = require('./zones');

var app = express(express.logger());

// Set the mustache template engine for .mustache files.
app.engine('html', mustacheExpress());

// Set .mustache as the default extension.
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// Use this "asset version" to cache bust when we update any of the assets.
var assetVersion = hashdirectory.sync(__dirname + '/public');
var re = new RegExp('/' + assetVersion + '/');
app.use('/assets', function(req, res, next) {
	req.url = req.url.replace(re, '/');
	next();
});

// Static stuffs
var oneDay = 24 * 60 * 60;
var oneMonth = 30 * oneDay;
app.use(connect.compress());
app.use('/assets', express['static'](__dirname + '/public', { maxAge: oneMonth }));
app.use(express.errorHandler());
//app.use(express.bodyParser());

function getBuckets(time) {
	var data = five(time);
	data.buckets.forEach(function(bucket) {

		bucket.time = {
			'human': time.zone(bucket.offset).format('h:mm a'),
			'iso': time.zone(bucket.offset).format('YYYY[-]MM[-]DD[T]HH[:]mmZ')
		};

		bucket.zones.forEach(function(zone) {

			zone.time = {
				'human': time.tz(zone.designator).format('h:mm a'),
				'iso': time.tz(zone.designator).format('YYYY[-]MM[-]DD[T]HH[:]mmZ')
			};

			// If the zone doesn't have a location, use its designator.
			if (!zone.location) {
				zone.location = zone.designator;
			}
		});
	});

	return data.buckets;
}

app.get('/', function(req, res) {
	var data = {
		buckets: getBuckets(moment()),
		assetVersion: assetVersion,
		live: true
	}

	res.render('index', data);
});

app.get('/t/:time', function(req, res, next) {
	var t = req.params.time;
	var time = moment(t);

	if (!time.isValid()) {
		return next();
	}

	var data = {
		buckets: getBuckets(time),
		assetVersion: assetVersion,
		live: false
	};

	res.render('index', data);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on port " + port);
});
