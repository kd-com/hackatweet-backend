const mongoose = require('mongoose');

const tweetSchema = mongoose.Schema({
  content: { type: String, maxlength: 280 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  hashtags: [String],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  createdAt: { type: Date, default: Date.now },
});

const Tweet = mongoose.model('tweet', tweetSchema);

module.exports = Tweet;