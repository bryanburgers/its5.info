"use strict";

var LRU = require('lru-cache');
var Q = require('q');
var twitter = require('twitter');

function TwitterApi(creds) {
	this.creds = creds;
	this.twit = new twitter(creds);
	this.cache = LRU({
		max: 20,
		maxAge: 60 * 60 * 1000
	});
}

TwitterApi.prototype._get = function(uri, options) {
	var self = this;
	return Q.Promise(function(resolve, reject) {
		self.twit.get(uri, options, function(result) {
			if (result instanceof Error) {
				reject(Error);
				return;
			}
			resolve(result);
		});
	});
};

TwitterApi.prototype._getCached = function(key, uri, options) {
	var self = this;
	if (self.cache.has(key)) {
		return Q.Promise(function(resolve) {
			resolve(self.cache.get(key));
		});
	}
	else {
		var promise = self._get(uri, options);
		promise.then(function(data) {
			self.cache.set(key, data);
		});
		return promise;
	}
};

TwitterApi.prototype.search = function(term) {
	return this._get('/search/tweets.json', { q: term, result_type: 'recent', count: 100 });
};

TwitterApi.prototype.oembed = function(id) {
	return this._getCached('oembed:' + id, '/statuses/oembed.json', { id: id, align: 'center' });
};

TwitterApi.prototype.getTweet = function(id) {
	return this._getCached('tweet:' + id, '/statuses/show.json', { id: id });
};

module.exports = function(creds) {
	return new TwitterApi(creds);
};