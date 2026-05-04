var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
const jwt = require('jsonwebtoken');
const Tweet = require('../models/tweet');
const { checkBody } = require('../modules/checkBody');

function extractHashtags(text) {
  const pattern = /#[\w]+/g;
  return (text.match(pattern) || []).map(tag => tag.replace('#', '').toLowerCase());
}

// routes/tweets.js
router.get('/', (req, res) => {
  Tweet.find()
    .sort({ createdAt: -1 })
    .populate('user', 'username firstname') // <-- Seulement ces champs
    .then(tweets => {
      res.json({ result: true, tweets });
    })
    .catch(error => {
      res.status(500).json({ result: false, error: 'Server error' });
    });
});


//post Tweets
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

//delete tweets si on est le propriétaire
router.delete('/:id', (req, res) => {
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

    const tweetId = req.params.id;
    Tweet.findById(tweetId).then(tweet => {
        if (tweet.user.toString() !== decoded.userId) {
            return res.status(403).json({ result: false, error: 'You can\'t delete this tweet !' });
        }
        Tweet.deleteOne({ _id: tweetId }).then(() => {
            res.json({ result: true, message: 'Tweet deleted' })
        })
    })
})

//like ou unlike un tweet
router.put('/like/:id', (req, res) => {
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
    const userId = decoded.userId
    const tweetId = req.params.id
    Tweet.findById(tweetId).then(tweet => {
        const liked = tweet.likes.includes(userId)
        if (liked) {
            Tweet.updateOne({ _id: tweetId }, { $pull: { likes: userId } })
            .then(() => res.json({ result: true, message: 'Tweet unliked'}))
        } else {
            Tweet.updateOne({ _id: tweetId }, { $addToSet: { likes: userId } })
            .then(() => res.json({ result: true, message: 'Tweet liked'}))
        }
    })
})

module.exports = router;