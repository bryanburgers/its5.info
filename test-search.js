"use strict";

require('with-env')();
var tw = require('./tw');

var creds = {
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
};

var twit = tw(creds);

var x = twit.search('its 5 oclock somewhere');
//var x = twit.getTweet('464044657437970432');
//var x = twit.oembed('464044657437970432');
x.then(function(result) {
	console.log(result);
}).catch(function(err) {
	console.log("Error");
	console.log(err);
});