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
				reject(result);
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

TwitterApi.prototype._post = function(uri, options) {
	var self = this;
	return Q.Promise(function(resolve, reject) {
		self.twit.post(uri, options, function(result) {
			if (result instanceof Error) {
				reject(result);
				return;
			}
			resolve(result);
		});
	});
};

TwitterApi.prototype.search = function(term, sinceId) {
	var data = {
		q: term,
		result_type: 'recent',
		count: 100
	};

	if (sinceId) {
		data.since_id = sinceId;
	}
	return this._get('/search/tweets.json', data);
};

TwitterApi.prototype.oembed = function(id) {
	return this._getCached('oembed:' + id, '/statuses/oembed.json', { id: id, align: 'center' });
};

TwitterApi.prototype.getTweet = function(id) {
	return this._getCached('tweet:' + id, '/statuses/show.json', { id: id });
};

TwitterApi.prototype.postTweet = function(text, replyId) {
	var data = {
		status: text
	};
	if (replyId) {
		data.in_reply_to_status_id = replyId;
	}
	return this._post('/statuses/update.json', data);
};

TwitterApi.prototype.getConfiguration = function() {
	return this._getCached('configuration:0', '/help/configuration.json');
};

TwitterApi.prototype.getTimeline = function() {
	return this._get('/statuses/user_timeline.json');
};

module.exports = function(creds) {
	return new TwitterApi(creds);
};
