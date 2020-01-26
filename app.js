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
var mongoose = require('mongoose');

var tokens = require('./config/tokens.js');
var dbconfig = require('./config/database');
var tweetModel = require('./models/tweet').tweetModel;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// set public folder
app.use('/', express.static(__dirname + '/public'));

//import cache middleware
const cache = require('./middlewares/cache')

// make packages available for client using statics
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/mdbootstrap', express.static(__dirname + '/node_modules/mdbootstrap'));
app.use('/popper', express.static(__dirname + '/node_modules/popper.js/dist'));
app.use('/open-iconic', express.static(__dirname + '/node_modules/open-iconic/font'));
app.use("/leaflet", express.static(__dirname + "/node_modules/leaflet/dist"));
app.use("/leaflet-control-geocoder", express.static(__dirname + "/node_modules/leaflet-control-geocoder/dist"));
app.use('/config', express.static(__dirname + '/config'));
app.use('/jsnlog', express.static(__dirname + "/node_modules/jsnlog"));
app.use('/fontawesome', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free'));
app.use("/leaflet-draw", express.static(__dirname + "/node_modules/leaflet-draw/dist"));
app.use("/flag-icon-css", express.static(__dirname + "/node_modules/flag-icon-css"));
app.use("/bootstrap-select", express.static(__dirname + "/node_modules/bootstrap-select/dist"));
app.use('/leaflet-extra-markers', express.static(__dirname + "/node_modules/leaflet-extra-markers/dist"));


app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.post('/jsnlog.logger', (req, res) => {
  // req.body.lg[0].m to get only the message
  jsnlog_nodejs(JL, req.body);
  // Send empty response. This is ok, because client side jsnlog does not use response from server.
  res.send('');
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
  secret: tokens.secretSession,
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

//TODO: dasd muss noch dringend geändert werden weil wir weder die messegas noch den error haben oder verstehe iuch das falsch
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// connect to MongoDB
connectMongoDB();

/**
 * function to get a connection to the Database
 * depending on the type of connection chooses this function the 
 * @author Luc, Phil, Lukas (Geosoftware I)
 */
function connectMongoDB() {
  (async () => {
    // set up default ("Docker") mongoose connection
    await mongoose.connect(dbconfig.dbdocker, {
      useNewUrlParser: true,
      useCreateIndex: true,
      autoReconnect: true
    }).then(db => {
      console.log('Connected to MongoDB (databasename: "' + db.connections[0].name + '") on host "' + db.connections[0].host + '" and on port "' + db.connections[0].port + '""');
    }).catch(async err => {
      console.log('Connection to ' + dbconfig.dbdocker + ' failed, try to connect to ' + dbconfig.dblocalhost);
      // set up "local" mongoose connection
      await mongoose.connect(dbconfig.dblocalhost, {
        useNewUrlParser: true,
        useCreateIndex: true,
        autoReconnect: true
      }).then(db => {
        console.log('Connected to MongoDB (databasename: "' + db.connections[0].name + '") on host "' + db.connections[0].host + '" and on port "' + db.connections[0].port + '""');
      }).catch(err2 => {
        console.log('Error at MongoDB-connection with Docker: ' + err);
        console.log('Error at MongoDB-connection with Localhost: ' + err2);
        console.log('Retry to connect in 3 seconds');
        setTimeout(connectMongoDB, 3000); // retry until db-server is up
      });
    });
  })();
}

module.exports = app;