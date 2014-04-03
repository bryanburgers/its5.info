"use strict";

var five = require('../five');
var assert = require('assert');
var moment = require('moment-timezone');

describe('five', function() {
	it('returns the correct zones (5:00 pm CDT)', function() {
		var result = five(moment('2014-04-02T17:00:00-0500'));
		result.should.be.instanceOf(Array).and.have.lengthOf(2);
		result[0].should.have.property('zones');
		result[0].zones.should.containEql('America/Chicago'); // 5pm
		result[0].zones.should.containEql('Pacific/Easter'); // 5pm
		result[1].should.have.property('zones');
		result[1].zones.should.containEql('America/Caracas'); // 5:30pm
	});

	it('returns the correct zones (5:59 PM CDT)', function() {
		var result = five(moment('2014-04-02T17:59:00-0500'));
		result.should.be.instanceOf(Array).and.have.lengthOf(1);
		result[0].should.have.property('zones');
		result[0].zones.should.containEql('America/Chicago'); // 5:59pm
		result[0].zones.should.containEql('Pacific/Easter'); // 5:59pm

		result[0].should.not.containEql('America/Caracas'); // 6:29pm
	});

	it('returns the correct zones (2:30 PM CDT)', function() {
		var result = five(moment('2014-04-02T14:30:00-0500'));
		result.should.be.instanceOf(Array).and.have.lengthOf(2);
		result[0].zones.should.containEql('America/St_Johns'); // 5pm
		result[1].zones.should.containEql('America/Godthab'); // 5:30pm

		result[0].zones.should.not.containEql('America/Chicago');
		result[1].zones.should.not.containEql('America/Chicago');
	});

	it('returns the correct zones (4:00 PM CDT)', function() {
		var result = five(moment('2014-04-02T16:00:00-0500'));
		result.should.be.instanceOf(Array).and.have.lengthOf(1);
		result[0].zones.should.containEql('America/New_York'); // 5:00pm
		result[0].zones.should.not.containEql('America/Chicago'); // 4:00pm
	});

	it('returns time zones for the current time', function() {
		var result = five();
		assert(result.length > 0, 'At least one entry should be returned, no matter what time the tests are run.');
	});

	it.skip('at any given point on December 21, there is at least one timezone where it is 5:00 PM', function() {
		var prefix = '2014-12-21T';
		for (var h = 0; h < 24; h++) {
			for (var m = 0; m < 60; m += 15) {
				var hs = h.toString();
				if (hs.length < 2) {
					hs = '0' + hs;
				}

				var ms = m.toString();
				if (ms.length < 2) {
					ms = '0' + ms;
				}

				var t = prefix + hs + ':' + ms + 'z';
				var instant = moment(t);
				var result = five(instant);
				assert(result.length !== 0, t + ' should return at least one entry');
				assert(result[0].zones.length !== 0, t + ' should return at least one zone');
			}
		}
	});

	it.skip('at any given point on June 21, there is at least one timezone where it is 5:00 PM', function() {
		var prefix = '2014-06-21T';
		for (var h = 0; h < 24; h++) {
			for (var m = 0; m < 60; m += 15) {
				var hs = h.toString();
				if (hs.length < 2) {
					hs = '0' + hs;
				}

				var ms = m.toString();
				if (ms.length < 2) {
					ms = '0' + ms;
				}

				var t = prefix + hs + ':' + ms + 'z';
				var instant = moment(t);
				var result = five(instant);
				assert(result.length !== 0, t + ' should return at least one entry');
				assert(result[0].zones.length !== 0, t + ' should return at least one zone');
			}
		}
	});
});
