"use strict";

var five = require('./five');
var moment = require('moment-timezone');

var last = null;

function updateBuckets(now) {
	now = now || moment();

	if (last === now.format('YYYY[-]MM[-]DD[T]HH[:]mmZ')) {
		return;
	}
	last = now.format('YYYY[-]MM[-]DD[T]HH[:]mmZ');

	var offsets = {};
	var bucketsToRemove = [];
	var bucketsToAdd = [];

	// Take an inventory of the current buckets.
	var bucketEls = document.querySelectorAll('.bucket');
	for (var i = 0; i < bucketEls.length; i++) {
		var bucketEl = bucketEls[i];
		var offset = bucketEl.getAttribute('data-offset');
		offsets[offset] = bucketEl;
	}

	// Generate the data.
	var data = five(now);

	// Go through the data.
	for (var i = 0; i < data.buckets.length; i++) {
		var bucket = data.buckets[i];
		var bucketEl;

		if (offsets[bucket.offset]) {
			bucketEl = offsets[bucket.offset];
			delete offsets[bucket.offset];
		}
		else {
			bucketEl = generateBucketElement(bucket, now);
			bucketsToAdd.push(bucketEl);
		}
		updateBucketTime(bucketEl, now);
	}

	// Marked buckets to remove.
	for (var key in offsets) {
		bucketsToRemove.push(offsets[key]);
	}

	// Add and remove buckets.
	var body = document.body;
	for (var i = 0; i < bucketsToRemove.length; i++) {
		var el = bucketsToRemove[i];
		el.parentNode.removeChild(el);
	}
	for (var i = 0; i < bucketsToAdd.length; i++) {
		body.appendChild(bucketsToAdd[i]);
	}
}

function generateBucketElement(bucket) {
	var section = document.createElement('section');
	section.setAttribute('class', 'bucket');
	section.setAttribute('data-offset', bucket.offset);

	var header = document.createElement('header');
	section.appendChild(header);

	var h2 = document.createElement('h2');
	header.appendChild(h2);

	var time = document.createElement('time');
	h2.appendChild(document.createTextNode("It's "));
	h2.appendChild(time);
	h2.appendChild(document.createTextNode(" in…"))
	time.setAttribute('datetime', '');
	time.textContent = '';

	var content = document.createElement('div');
	content.setAttribute('class', 'bucketcontent');
	section.appendChild(content);

	var ul = document.createElement('ul');
	content.appendChild(ul);

	for (var i = 0; i < bucket.zones.length; i++) {
		var zone = bucket.zones[i];
		var li = document.createElement('li');
		ul.appendChild(li);
		li.textContent = zone.location || zone.designator;
	}

	return section;
}

function updateBucketTime(bucketEl, now) {
	var timeEl = bucketEl.querySelector('time');
	var offset = bucketEl.getAttribute('data-offset');
	now.zone(offset);

	timeEl.setAttribute('datetime', now.format('YYYY[-]MM[-]DD[T]HH[:]mmZ'));
	timeEl.textContent = now.format('h:mm a');
}

// If we're in the live view, then keep things up to date.
if (document.body.getAttribute('data-live') !== null) {
	setInterval(updateBuckets, 1000);
}
