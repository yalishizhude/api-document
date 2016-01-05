/*global require,__dirname*/
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var api = require('./routes/api');
var hbs = require('hbs');
var log = require('./log');
var session = require('express-session');
var uuid = require('node-uuid');

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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//会话
app.use(session({
  genid: uuid.v1, 
  resave: false,
  saveUninitialized: true,
  secret: 'api-document-server'
}));
//登陆拦截
app.use(function (req, res, next) {
  'use strict';
  //根路径跳转
  if(/\/(index.html)?$/.test(req.path)||'/'===req.path) return res.redirect('/api/projects.html');
  if(!req.session.user && !/\/api\/login.*/.test(req.path)) {
    if(/(.html)$/.test(req.path)) return res.redirect("/api/login.html");
    else return res.send(401, {message:'请重新登陆'});
  } else if(req.session.user){
    app.locals.user = req.session.user;
  }
  next();
});
app.use('/api', api);

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
