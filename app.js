settings = require('./settings');
var express = module.exports.express = require('express');

var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var fs = require('fs');

var redis = require('redis');
var app = module.exports.app = express();
global.appserver = http.createServer(app);
global.io = require('socket.io').listen(global.appserver, {
  log: true
});
var port = process.env.PORT || 3000;
socket = io.sockets.on('connection', function(socket) {
  console.log('#### Socket.io Connected. Port ' + port);
  return socket;
});

var mongoose = require('mongoose');
var Account = require('./models/account');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');

var routes = require('./routes/index');

var user = require('./api/user');

var router = express.Router();

mongoose.set('debug', true);
// app.use(logfmt.requestLogger());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({
  secret: 'my secret',
  saveUninitialized: true,
  resave: true,
  cookie: {
    maxAge: 6000000
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  // Production
  // res.setHeader('Access-Control-Allow-Origin', 'https://pinpoint-ionic.herokuapp.com');
  // Development
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

/// Routes ///
app.use('/', routes);

/// Apis ///
app.use('/api/user', user);


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers
// development error handler
// will print stacktrace

if (!process.env.NODE_ENV) {
  globalEnv = 'development';
  console.log('#### Pyar in development ####');
  console.log('Server listening to port ' + 3000);
  console.log('Using dev database - "pyar-dev"')
  appserver.listen(process.env.PORT || 3000);
  // mongoose.connect('mongodb://pinpoint-founder:kobefederer1qaz@ds049170.mongolab.com:49170/pinpoint');
  mongoose.connect('mongodb://localhost:27017/pyar-dev');
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

if (process.env.NODE_ENV === 'production') {
  globalEnv = 'production';
  console.log('#### Pyar in production ####');
  console.log('Using production database - "pinpoint-dev"')
  var port = process.env.PORT || 3000;
  appserver.listen(port);
  console.log('Server listening to port ' + port);
  mongoose.connect('mongodb://pinpoint-founder:kobefederer1qaz@ds049170.mongolab.com:49170/pinpoint');
  // mongoose.connect('mongodb://localhost:27017/pinpoint-dev');
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// passport config
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.use(express.static(__dirname + 'public'));
module.exports = app;
