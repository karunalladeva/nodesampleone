var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
var passport= require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var LocalStrategy = require('passport-local').Strategy;

var index = require('./routes/index');
var users = require('./routes/users');
var catalog = require('./routes/catalog'); // Import routes for "catalog" area of site
var compression = require('compression');
var helmet = require('helmet');

// Create the Express application object
var app = express();
app.use(helmet());

// Set up mongoose connection
var mongoose = require('mongoose');
var dev_db_url = 'mongodb://admin:admin123@ds249128.mlab.com:49128/locallib'
var mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: '2C44-4D44-WppQ38S-deva',
    resave: true,
    saveUninitialized: true,
}));

app.use(compression()); // Compress all routes

var User = require('./models/user')
var async = require('async')

function extractProfile (profile) {
  let imageUrl = '';
  if (profile.photos && profile.photos.length) {
    imageUrl = profile.photos[0].value;
  }
  return {
    googleid: profile.id,
    first_name: profile.name.givenName,
    family_name : profile.name.familyName,
    image: imageUrl,
    email: profile.emails[0].value
  };
}
passport.use(new GoogleStrategy({
  clientID: '988007128942-0a4j4m36rn1cviio7bo2crapbd948iue.apps.googleusercontent.com',
  clientSecret: 'BBSWRuBFkqgvH-bOodUjfJXm',
  callbackURL: 'https://nodesampleone.herokuapp.com/auth/callback/google',
  accessType: 'offline'
}, (accessToken, refreshToken, profile, cb) => {
  cb(null, extractProfile(profile));
}));
passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});

passport.use(new FacebookStrategy({
    clientID: '119759488713668',
    clientSecret: 'f38e8632d7ad05bf5ac73ea07801ee79',
    callbackURL: "https://nodesampleone.herokuapp.com/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    cb(null, profile);
  }
));

passport.use(new LocalStrategy(
  function(email, password, done) {
    User.findOne({ email : email ,password : password }, function (err, user) {
      if (err) { return done(err); }
      // if (!user) {
      //   return done(null, false, { message: 'Incorrect username.' });
      // }
      // if (!user.validPassword(password)) {
      //   return done(null, false, { message: 'Incorrect password.' });
      // }
      return done(null, user);
    });
  }
));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());

app.use('/', index);
app.use('/users', users);
app.use('/catalog', catalog); // Add catalog routes to middleware chain.

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.sucess_msg=req.flash('sucess_msg');
  res.locals.err_msg=req.flash('err_msg');
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
