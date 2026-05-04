const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  firstname: String,
  username: String,
  password: String,
  url_profile: String,
});

const User = mongoose.model('users', userSchema);

module.exports = User;