"use strict";

var shuffle = require('../shuffle');
var assert = require('assert');
var should = require('should');

describe('shuffle', function() {
	it('shuffles an array', function() {
		var arr = shuffle([1, 2, 3], 42185);
		arr.should.be.instanceOf(Array).and.have.lengthOf(3);
		arr.should.containEql(1);
		arr.should.containEql(2);
		arr.should.containEql(3);

		arr[0].should.not.eql(1);
	});

	it('shuffles an array predictably', function() {
		var arr1 = shuffle([1, 2, 3], 73109);
		var arr2 = shuffle([1, 2, 3], 73109);

		arr1[0].should.eql(arr2[0]);
		arr1[1].should.eql(arr2[1]);
		arr1[2].should.eql(arr2[2]);
	});
});
