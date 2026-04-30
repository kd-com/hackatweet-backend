var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
const jwt = require('jsonwebtoken');
const Tweet = require('../models/tweet');
const { checkBody } = require('../modules/checkBody');


function extractHashtags(text) {
  const pattern = /#[\w]+/g;
  return (text.match(pattern) || []).map(tag => tag.toLowerCase());
}

router.get('/', (req, res) => {
  Tweet.find()
    .sort({ createdAt: -1 }) // 🔥 plus récent en premier
    .populate('user', 'username firstname')
    .then(tweets => {
      res.json({ result: true, tweets });
    })
    .catch(error => {
      res.status(500).json({ result: false, error: 'Server error' });
    });
});

router.post('/', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ result: false, error: 'No token' });
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ result: false, error: 'Invalid token' });
  }

  const { content } = req.body;

  if (!checkBody(req.body, ['content'])) {
    return res.json({ result: false, error: 'Missing or empty fields' });
  }

  if (content.length > 280) {
    return res.json({ result: false, error: 'Max 280 characters' });
  }

  User.findById(decoded.userId).then(user => {
    if (!user) {
      return res.json({ result: false, error: 'User not found' });
    }

    const hashtags = extractHashtags(content);

    const newTweet = new Tweet({
      content,
      user: user._id,
      hashtags,
    });

    newTweet.save().then(savedTweet => {
      savedTweet.populate('user', 'username firstname')
        .then(populatedTweet => {
          res.json({
            result: true,
            tweet: populatedTweet,
          });
        })
        .catch(err => {
          res.status(500).json({ result: false, error: 'Populate error' });
        });
    }).catch(err => {
      res.status(500).json({ result: false, error: 'Save error' });
    });
  }).catch(err => {
    res.status(500).json({ result: false, error: 'Server error' });
  });
});

module.exports = router;