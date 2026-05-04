const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstname: { type: String, required: true },
  password: String,
  url_profile: {type: String, default: '/profile_default.avif'},
});

const User = mongoose.model('users', userSchema);

module.exports = User;