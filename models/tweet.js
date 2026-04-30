const mongoose = require('mongoose');

const tweetSchema = mongoose.Schema({
  content: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  hashtags: [String],
  createdAt: { type: Date, default: Date.now },
});

const Tweet = mongoose.model('tweet', tweetSchema);

module.exports = Tweet;