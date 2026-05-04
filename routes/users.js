var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

/*router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['firstname', 'username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Check if the user has not already been registered
  User.findOne({ username: req.body.username }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        firstname: req.body.firstname,
        username: req.body.username,
        password: hash,
        token: uid2(32),
        canBookmark: true,
      });

      newUser.save().then(newDoc => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: 'User already exists' });
    }
  });
});

router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ username: req.body.username }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});
*/

router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['firstname', 'username', 'password'])) {
    return res.json({ result: false, error: 'Missing or empty fields' });
  }

  User.findOne({ username: req.body.username }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        firstname: req.body.firstname,
        username: req.body.username,
        password: hash,
      });

      newUser.save().then(newDoc => {
        const token = jwt.sign(
          { userId: newDoc._id, username: newDoc.username },
          SECRET_KEY,
          { expiresIn: '24h' }
        );

        res.json({ result: true, token });
      });
    } else {
      res.json({ result: false, error: 'User already exists' });
    }
  });
});


// SIGNIN
router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    return res.json({ result: false, error: 'Missing or empty fields' });
  }

  User.findOne({ username: req.body.username }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      
      const token = jwt.sign(
        { userId: data._id, username: data.username },
        SECRET_KEY,
        { expiresIn: '24h' }
      );

      res.json({ result: true, token, firstname: data.firstname });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});

//Changer l'image de profil
router.put('/profile-image', (req, res) => {
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
  const { url_profile } = req.body;
  User.findByIdAndUpdate(
    decoded.userId,
    { url_profile },
    { new: true }
  )
  .then(updatedUser => {
    if (!updatedUser) {
      return res.json({ result: false, error: 'User not found' });
    }
    res.json({
      result: true,
      user: updatedUser
    });
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({ result: false, error: 'Server error' });
  });
});


module.exports = router;