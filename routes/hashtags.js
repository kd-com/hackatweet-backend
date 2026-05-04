var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
const jwt = require('jsonwebtoken');
const Tweet = require('../models/tweet');
const { checkBody } = require('../modules/checkBody');

router.get('/:tag', (req, res) => {
    const tag = req.params.tag;
    Tweet.find({ hashtags: tag.toLowerCase() })
    .sort({ createdAt: -1 }) //à voir
    .populate('user', 'username firstname')
    .then(tweets => {
        console.log("TWEETS trouvés :", tweets);
        res.json({ result: true, tweets, nbTweets: tweets.length})
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ result: false, error: 'Server error' });
    });
})


module.exports = router;