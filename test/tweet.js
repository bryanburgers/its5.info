"use strict";

var tweet = require('../tweet');
var assert = require('assert');
var should = require('should');
var moment = require('moment-timezone');

describe('tweet', function() {
	it('returns a nice tweet (5:19 pm CDT)', function() {
		var t = moment('2014-04-02T17:19:01-0500');
		var result = tweet(t, 122);

		result.length.should.not.be.above(122);
		result.should.containEql('5:19 pm');
	});

	it('returns a nice tweet in fewer characters (5:19 pm CDT)', function() {
		var t = moment('2014-04-02T17:19:01-0500');
		var result = tweet(t, 70);

		result.length.should.not.be.above(70);
		result.should.containEql('5:19 pm');
	});

	it('returns a nice tweet in even fewer characters (5:19 pm CDT)', function() {
		var t = moment('2014-04-02T17:19:01-0500');
		var result = tweet(t, 48);

		result.length.should.not.be.above(48);
		result.should.containEql('5:19 pm');
	});

	it('returns a single location if necessary (1:15 pm CDT)', function() {
		var t = moment('2014-04-02T13:15:02-0500');
		var result = tweet(t, 122);

		result.length.should.not.be.above(122);
		result.should.containEql('5:15 pm');
		result.should.containEql('Praia, Cape Verde');
	});
});
