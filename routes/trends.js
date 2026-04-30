var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
const jwt = require('jsonwebtoken');
const Tweet = require('../models/tweet');
const { checkBody } = require('../modules/checkBody');

router.get('/', (req, res) => {
  Tweet.find().then(tweets => {
    const trends = {};
    tweets.forEach(tweet => {
      tweet.hashtags.forEach(tag => {
        trends[tag] = (trends[tag] || 0 ) + 1;
      });
    });
    const result = Object.keys(trends).map(tag => ({
      hashtag: tag,
      count: trends[tag],
    })); 
    //result.sort((a, b) => b.count - a.count); à voir
    res.json({ result: true, trends: result });
  })
  .catch(() => {
    res.status(500).json({ result: false });
  });
});


module.exports = router;