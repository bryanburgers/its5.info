"use strict";

var five = require('../five');
var assert = require('assert');
var should = require('should');
var moment = require('moment-timezone');

should.use(function(should, Assertion) {
	Assertion.add('containObj', function(obj, description) {
		var i = should.format;

		if(!Array.isArray(this.obj)) {
			this.params = { operator: 'to contain an object like ' + i(obj), message: description };
			this.assert(false);
		} else {
			this.params = { operator: 'to contain an object like ' + i(obj), message: description };

			var match = false;
			this.obj.forEach(function(subObj) {
				var subMatch = true;
				for (var key in obj) {
					try {
						should.equal(subObj[key], obj[key]);
					}
					catch (exception) {
						subMatch = false;
					}
				}
				match = match || subMatch;
			});

			this.assert(match);
		}
	});
});

describe('five', function() {
	it('returns the correct zones (5:00 pm CDT)', function() {
		var result = five(moment('2014-04-02T17:00:00-0500'));
		result.should.have.property('buckets').instanceOf(Array).and.have.lengthOf(2);
		result.buckets[0].should.have.property('zones');
		result.buckets[0].zones.should.containObj({ designator: 'America/Chicago' }); // 5pm
		result.buckets[0].zones.should.containObj({ designator: 'Pacific/Easter' }); // 5pm
		result.buckets[1].should.have.property('zones');
		result.buckets[1].zones.should.containObj({ designator: 'America/Caracas' }); // 5:30pm
	});

	it('does not return an ETC designator (5:00 pm CDT)', function() {
		var result = five(moment('2014-04-02T17:00:00-0500'));
		result.should.have.property('buckets').instanceOf(Array).and.have.lengthOf(2);
		result.buckets[0].should.have.property('zones');
		result.buckets[0].zones.should.not.containObj({ designator: 'Etc/GMT+5' }); // 5pm
		result.buckets[0].zones.should.not.containObj({ designator: 'EST' }); // 5pm
		result.buckets[0].zones.should.not.containObj({ designator: 'CST6CDT' }); // 5pm
	});

	it('returns the correct zones (5:59 PM CDT)', function() {
		var result = five(moment('2014-04-02T17:59:00-0500'));
		result.should.have.property('buckets').instanceOf(Array).and.have.lengthOf(1);
		result.buckets[0].should.have.property('zones');
		result.buckets[0].zones.should.containObj({ designator: 'America/Chicago' }); // 5:59pm
		result.buckets[0].zones.should.containObj({ designator: 'Pacific/Easter' }); // 5:59pm

		result.buckets[0].should.not.containObj({ designator: 'America/Caracas' }); // 6:29pm
	});

	it('returns the correct zones (2:30 PM CDT)', function() {
		var result = five(moment('2014-04-02T14:30:00-0500'));
		result.should.have.property('buckets').instanceOf(Array).and.have.lengthOf(2);
		result.buckets[0].zones.should.containObj({ designator: 'America/St_Johns' }); // 5pm
		result.buckets[1].zones.should.containObj({ designator: 'America/Godthab' }); // 5:30pm

		result.buckets[0].zones.should.not.containObj({ designator: 'America/Chicago' });
		result.buckets[1].zones.should.not.containObj({ designator: 'America/Chicago' });
	});

	it('returns the correct zones (4:00 PM CDT)', function() {
		var result = five(moment('2014-04-02T16:00:00-0500'));
		result.should.have.property('buckets').instanceOf(Array).and.have.lengthOf(1);
		result.buckets[0].zones.should.containObj({ designator: 'America/New_York' }); // 5:00pm
		result.buckets[0].zones.should.not.containObj({ designator: 'America/Chicago' }); // 4:00pm
	});

	it('returns the name for Hong Kong (5:00 PM China Standard Time)', function() {
		var result = five(moment('2014-04-02T17:00:00+0800'));
		result.buckets[0].zones.should.containObj({ designator: 'Asia/Hong_Kong', location: "Hong Kong" }); // 5:00pm
	});

	it('returns time zones for the current time', function() {
		var result = five();
		assert(result.buckets.length > 0, 'At least one entry should be returned, no matter what time the tests are run.');
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
				var result = five.old(instant);
				assert(result.buckets.length !== 0, t + ' should return at least one entry');
				assert(result.buckets[0].zones.length !== 0, t + ' should return at least one zone');
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
				assert(result.buckets.length !== 0, t + ' should return at least one entry');
				assert(result.buckets[0].zones.length !== 0, t + ' should return at least one zone');
			}
		}
	});
});
