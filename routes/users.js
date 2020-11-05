var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// ------------ Create new user -------------------

router.post('/signup', (req, res, next) => {
  User.findOne({username: req.body.username})
  .then((user) => {
    if (user != null) {
      // user exists! send error
      var err = new Error('User ' + req.body.username + ' already exists!');
      err.status = 403;
      next(err);
    }
    else {
      // user doesnt exist! Make signup!
      return User.create({
        username: req.body.username,
        password: req.body.password});
    }
  })
  .then((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({status: 'Registration Successful!', user: user});
  }, (err) => next(err))
  .catch((err) => next(err));
});

// --------------- previous user login -------------------

router.post('/login', (req, res, next) => {
  // V if user is NOT authenticated:
  if (!req.session.user) {
    var authHeader = req.headers.authorization;
      if (!authHeader) {
        var err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        return next(err);
      }
        // If authorized -> split username and password 
        var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
        var username = auth[0];
        var password = auth[1];

      User.findOne({ username : username })
        .then((user) => {
          if (user === null) {
            var err = new Error('User ' + username + ' does not exist!');
            err.status = 403;
            return next(err);
          }
          else if (user.password !== password) {
            var err = new Error('Your password is incorrect!');
            err.status = 403;
            return next(err);
          }
          else if (user.username === username && user.password === password) {
            req.session.user = 'authenticated';
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('You are authenticated!');
          }
      })
      .catch((err) => next(err));
    }
    // if user is already authenticated:
    else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('You are already authenticated!');
    }
});

// ----------------- loggedin users to logout -------------------

router.get('/logout', (req, res) => {
  // check if user had a session
  if (req.session) {
    // on logout terminate the user session on server side
    req.session.destroy();
    // remove cookies on client side (so client cannot use expired session to try contact the server)
    res.clearCookie('session-id');
    // send user back to homepage --VV
    res.redirect('/');
  }
  // if user didnt have a session -> throw err
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

module.exports = router;
