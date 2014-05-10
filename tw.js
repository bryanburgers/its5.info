"use strict";

var Q = require('q');
var twitter = require('twitter');

function TwitterApi(creds) {
	this.creds = creds;
	this.twit = new twitter(creds);
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

TwitterApi.prototype.search = function(term) {
	return this._get('/search/tweets.json', { q: term, result_type: 'recent', count: 100 });
};

TwitterApi.prototype.oembed = function(id) {
	return this._get('/statuses/oembed.json', { id: id, align: 'center' });
};

TwitterApi.prototype.getTweet = function(id) {
	return this._get('/statuses/show.json', { id: id });
};

module.exports = function(creds) {
	return new TwitterApi(creds);
};