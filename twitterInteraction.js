"use strict";

var moment = require('moment-timezone');
var Q = require('q');
var tweet = require('./tweet');

function TwitterInteraction(twitterApi) {
	this.twitterApi = twitterApi;
}

TwitterInteraction.prototype.getUrlLength = function() {
	var self = this;
	if (self._urlLength) {
		return Q.Promise(function(resolve) {
			resolve(self._urlLength);
		});
	}
	else {
		return self.twitterApi.getConfiguration().then(function(data) {
			var length = data.short_url_length;
			self._urlLength = length;
			return length;
		});
	}
};

TwitterInteraction.prototype.getLastTweetId = function() {
	var self = this;
	if (self._lastTweetId) {
		return Q.Promise(function(resolve, reject) {
			resolve(self._lastTweetId);
		});
	}
	else {
		return self.twitterApi.getTimeline().then(function(data) {
			var biggest = '';
			data.forEach(function(tweet) {
				var id = self._padId(tweet.id_str);

				if (tweet.in_reply_to_status_id_str) {
					id = self._padId(tweet.in_reply_to_status_id_str);
				}

				if (id > biggest) {
					biggest = id;
				}
			});

			biggest = biggest.replace(/^0+/, '');

			self._lastTweetId = biggest;
			return biggest;
		});
	}
};

TwitterInteraction.prototype._padId = function(id) {
	return '000000000000000000000000'.substring(0, 24-id.length) + id;
};

// Mark an ID as seen. This actually just conditionally increments the last
// tweet ID, if necessary.
TwitterInteraction.prototype._markId = function(id) {
	if (this._padId(id) > this._padId(this._lastTweetId)) {
		this._lastTweetId = id;
	}
};

TwitterInteraction.prototype.pump = function() {
	var self = this;
	var urlLength = self.getUrlLength();
	var lastId = self.getLastTweetId();

	return Q.all([urlLength, lastId]).spread(function(urlLength, lastId) {
		var search = self.twitterApi.search('it\'s 5 o\'clock somewhere', lastId);
		var found = search.then(function(data) {
			var result = [];
			data.statuses.forEach(function(tweetData) {
				var createdAt = tweetData.created_at;
				var id = tweetData.id_str;
				var username = tweetData.user.screen_name;
				var t = moment(createdAt, "ddd MMM DD HH:mm:ss ZZ YYYY");
				var availableLength = 160 - (username.length + 2) - (urlLength + 1);
				self._markId(id);

				var tweetContent = tweet(t, availableLength);

				result.push({
					id: id,
					username: username,
					content: tweetContent,
					time: t
				});
			});

			return result;
		});
		return found.then(function(list) {
			return Q.all(list.map(function(item) {
				return self.tweet(item);
			}));
		});
	});
};

TwitterInteraction.prototype.tweet = function(content) {
	var text = content.content;
	if (content.username) {
		text = '@' + content.username + ' ' + text;
	}
	if (content.id) {
		text += ' http://www.its5.info/t/' + content.id;
	}

	return this.twitterApi.postTweet(text, content.id);
};

module.exports = function(twitterApi) {
	return new TwitterInteraction(twitterApi);
};
