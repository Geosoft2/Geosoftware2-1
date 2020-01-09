// jshint esversion: 8
// jshint node: true
"use strict";

// server uses port 3000
var port = 3000;

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var flash = require('express-flash');
var session = require('express-session');
var JL = require('jsnlog').JL;
var jsnlog_nodejs = require('jsnlog-nodejs').jsnlog_nodejs;
var twit = require('twit');
var mongoose = require('mongoose');

var token = require('./config/token');
var dbconfig = require('./config/database');
var tweetModel = require('./models/tweet').tweetModel;

var app = express();

//create new TwitClient
var TwitClient = new twit({
  consumer_key: token.twitter_consumer_key,
  consumer_secret: token.twitter_consumer_secret,
  access_token: token.twitter_access_token,
  access_token_secret: token.twitter_access_token_secret
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// set public folder
app.use('/', express.static(__dirname + '/public'));

// make packages available for client using statics
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/mdbootstrap', express.static(__dirname + '/node_modules/mdbootstrap'));
app.use('/popper', express.static(__dirname + '/node_modules/popper.js/dist'));
app.use('/open-iconic', express.static(__dirname + '/node_modules/open-iconic/font'));
app.use("/leaflet", express.static(__dirname + "/node_modules/leaflet/dist"));
app.use("/leaflet-control-geocoder", express.static(__dirname + "/node_modules/leaflet-control-geocoder/dist"));
app.use('/turf', express.static(__dirname + '/node_modules/@turf/turf'));
app.use('/config', express.static(__dirname + '/config'));
app.use('/jsnlog', express.static(__dirname + "/node_modules/jsnlog"));
app.use('/fontawesome', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free'));
app.use("/leaflet-draw", express.static(__dirname + "/node_modules/leaflet-draw/dist"));
app.use("/flag-icon-css", express.static(__dirname + "/node_modules/flag-icon-css"));
app.use("/bootstrap-select", express.static(__dirname + "/node_modules/bootstrap-select/dist"));
app.use('/leaflet-extra-markers', express.static(__dirname + "/node_modules/leaflet-extra-markers/dist"));
app.use('/d3-geo', express.static(__dirname + '/node_modules/d3-geo/dist'));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.post('/jsnlog.logger', (req, res) => {
  // req.body.lg[0].m to get only the message
  jsnlog_nodejs(JL, req.body);
  // Send empty response. This is ok, because client side jsnlog does not use response from server.
  res.send('');
});

//Search API
app.post('/twitterapi', async (req, res) => {
  var query = req.body;
  TwitClient.get('search/tweets', query,
    await function (err, data, response) {
      processTweets(data);
    });
  res.send({});
});

/* //Streaming API
app.post('/twitterapi', async (req, res) => {
  var query = req.body;
  console.log(query.bbox);
  var stream = TwitClient.stream('statuses/filter', { locations: [query.bbox.sw_lng, query.bbox.sw_lat, query.bbox.ne_lng, query.bbox.ne_lat] });
  var count = 0;
  stream.on('tweet', (tweet) => {
    console.log(count++);
  });
}); */

function processTweets(tweets) {
  var raw = tweets.statuses;

  raw.forEach((tweet) => {
    if ((tweet.coordinates != null) || (tweet.geo != null) || (tweet.place != null)) {
      var dbtweet = {
        id: tweet.id_str,
        geo: JSON.stringify(tweet.geo),
        place: JSON.stringify(tweet.place)
      };

      //tweetModel.deleteMany({ id: dbtweet.id });

      tweetModel.create(dbtweet)
        .catch(error => console.log(error));
    }
  });
}

app.get('/tweetdb', async (request, response) => {
  try {
    var result = await tweetModel.find().exec();
    response.json(result);
  } catch (error) {
    console.log(error);
  }
});

// Express Validator Middleware
// @see https://github.com/VojtaStavik/GetBack2Work-Node/blob/master/node_modules/express-validator/README.md
app.use(validator({
  errorFormatter: function (param, msg, value) {
    var namespace = param.split('.'),
      root = namespace.shift(),
      formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

app.use(cookieParser());
app.use(logger('dev'));

// Express Session Middleware
// @see https://github.com/expressjs/session
app.use(session({
  secret: token.secretSession,
  resave: true,
  saveUninitialized: true
}));

// Express Messages Middleware
// @see https://gist.github.com/brianmacarthur/a4e3e0093d368aa8e423#file-flash-app-js-L44
app.use(flash());
app.use(function (req, res, next) {
  res.locals.sessionFlash = req.session.sessionFlash;
  delete req.session.sessionFlash;
  next();
});

app.get('*', function (req, res, next) {
  res.locals.user = req.user || null;
  //console.log('user', res.locals.user);
  next();
});

// route files
app.use('/', require('./routes/index'));
app.use('/impressum', require('./routes/impressum'));
app.use('/doku', require('./routes/doku'));
app.use('/api', require('./routes/api'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

async function connectDatabase() {
  mongoose.connection.on("connecting", () => {
    console.log("Connecting MongoDB database ...");
  });

  mongoose.connection.on("connected", () => {
    console.log("MongoDB database connected!");
  });

  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB database disconnected!");
  });

  mongoose.connection.on("error", (error) => {
    console.log("MongoDB connection error!", error);
  });

  mongoose.connect(dbconfig.localhost, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(error => console.log(error));
};

async function clearUpDatabase() {
  /* tweetModel.deleteMany({})
    .catch(error => console.log(error)); */
}
connectDatabase();
clearUpDatabase();

module.exports = app;