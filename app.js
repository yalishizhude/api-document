/*global require,__dirname*/
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var hbs = require('hbs');
var log = require('./log');
var session = require('express-session');
var uuid = require('node-uuid');
var login = require('./routes/login');
var app = express();

// view engine setup
hbs.registerPartials(__dirname + '/views/partials');
hbs.localsAsTemplateData(app);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//记录日志
log.use(app);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '100000kb'}));
app.use(bodyParser.urlencoded({ extended: false , limit: '100000kb'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//会话
app.use(session({
  genid: uuid.v1,
  resave: false,
  saveUninitialized: true,
  secret: 'api-document-server'
}));
//路由
app.use(login);
app.use('/', require('./routes/index'));
app.use('/project', require('./routes/project'));
app.use('/module', require('./routes/module'));
app.use('/interface', require('./routes/interface'));
app.use('/user', require('./routes/user'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  'use strict';
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
