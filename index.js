"use strict";

var connect = require('connect');
var express = require('express');
var five = require('./five');
var hashdirectory = require('hashdirectory');
var moment = require('moment-timezone');
var mustacheExpress = require('mustache-express');
var Q = require('q');
var tweet = require('./tweet');
var twitterApi = require('./twitterApi')({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});
var twitterInteraction = require('./twitterInteraction')(twitterApi);

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
		live: true,
		gaCode: process.env.GA_CODE,
		bitcoinAccount: process.env.BITCOIN_ACCOUNT
	};

	res.render('index', data);
});

app.get('/d/:time', function(req, res, next) {
	var t = req.params.time;
	var time = moment(t);

	if (!time.isValid()) {
		return next();
	}

	var data = {
		buckets: getBuckets(time),
		assetVersion: assetVersion,
		live: false,
		gaCode: process.env.GA_CODE,
		bitcoinAccount: process.env.BITCOIN_ACCOUNT
	};

	res.render('index', data);
});

app.get('/t/:tweet', function(req, res, next) {
	var t = req.params.tweet;

	var tweetPromise = twitterApi.getTweet(t);
	var oembedPromise = twitterApi.oembed(t);

	Q.all([tweetPromise, oembedPromise]).spread(function(tweetData, oembed) {
		var time = moment(tweetData.created_at);

		if (!time.isValid()) {
			return next();
		}

		var twitterMeta = {
			title: "It's 5 o'clock somewhere",
			description: tweet(time, 200),
			image: 'http://www.its5.info/assets/' + assetVersion + '/images/clocks/' + time.format('HHmm') + '-120x120.png'
		};

		var data = {
			verb: 'was', // Maybe, if it's recent enough, use 'is'.
			buckets: getBuckets(time),
			tweet: oembed.html,
			assetVersion: assetVersion,
			twitterMeta: twitterMeta,
			userName: tweetData.user.screen_name,
			userUrl: 'https://twitter.com/' + tweetData.user.screen_name,
			live: false,
			gaCode: process.env.GA_CODE,
			bitcoinAccount: process.env.BITCOIN_ACCOUNT
		};

		res.render('tweet', data);
	}).catch(function(e) {
		console.log(e);
		console.log(e.stack);
		next(e);
	});
});

// Triggered by an external service to run the Twitter searching and tweeting
// code.
app.get('/_/pump', function(req, res, next) {
	var tweets = twitterInteraction.pump();

	tweets.then(function(results) {
		res.set('Content-Type', 'text/plain');
		res.end('OK');
	}).catch(function(err) {
		console.log(err);
		console.log(err.stack);
		return next(err);
	});
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on port " + port);
});
