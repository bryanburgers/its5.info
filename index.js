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
app.use('/js', express['static'](__dirname + '/public/js', { maxAge: oneMonth }));
app.use(express.errorHandler());
//app.use(express.bodyParser());

function renderTime(time, res) {
	var data = {};
	data.zones = [];

	var zones = five(time);
	zones.buckets.forEach(function(bucket) {
		bucket.zones.forEach(function(zone) {

			zone.time = {
				'human': time.tz(zone.designator).format('h:mm a'),
				'iso': time.tz(zone.designator).format('YYYY[-]MM[-]DD[T]HH[:]MMZ')
			};

			// If the zone doesn't have a location, use its designator.
			if (!zone.location) {
				zone.location = zone.designator;
			}

			data.zones.push(zone);
		});
	});

	res.render('index', data);
}

app.get('/', function(req, res) {
	return renderTime(moment(), res);
});

app.get('/t/:time', function(req, res, next) {
	var t = req.params.time;
	var time = moment(t);

	if (!time.isValid()) {
		return next();
	}

	renderTime(time, res);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on port " + port);
});
