var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');



const mongoose = require('mongoose');

const Dishes = require('./models/dishes');

const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

connect.then((db) => {
    console.log("Connected correctly to server");
}, (err) => { console.log(err); });

// { useNewUrlParser: true, useUnifiedTopology: true }


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Note: app.use is middleware 

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser('12345-67890-09876-54321')); // <- signed cookies (any string as key value)

// Session middleware V
app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));

// Authorization middleware: Write basic auth function
function auth(req, res, next) {
  //console.log(req.signedCookies);
  console.log(req.session);

  //if (!req.signedCookies.user) {
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
        var userName = auth[0];
        var password = auth[1];
        // check if admin
      if (userName === 'admin' && password === 'password') {
        // setup cookie only if user is authorized
        //res.cookie('user', 'admin', {signed: true}); // <------ ;
        // Session cookie 
        req.session.user = 'admin';

        // allows for next middleware
        next();
      }
      else {
        // if NOT admin send Error
        var err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        return next(err);
      }
  }
  else {
    //if (req.signedCookies.user === 'admin') {
      if (req.session.user === 'admin') {
      next();
    }
    // extra error check
    else {
      var err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }
  }
}

// Implement basic auth function
app.use(auth);

// V-- allows us to serve static data from the public folder
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
// Adding three new routers
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
