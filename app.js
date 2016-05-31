/*global module,require,__dirname*/
var express = require('express'),
  path = require('path'),
  favicon = require('serve-favicon'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  hbs = require('hbs'),
  hbsutils = require('hbs-utils')(hbs),
  log = require('./log'),
  session = require('express-session'),
  sessionstore = require('sessionstore'),
  uuid = require('node-uuid'),
  login = require('./routes/login'),
  app = express();
// view engine setup
hbsutils.registerWatchedPartials(__dirname + '/views/partials');
hbs.localsAsTemplateData(app);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerHelper('js', function(str, option) {
  this.jsList = this.jsList || [];
  this.jsList.push(str);
});
hbs.registerHelper('css', function(str, option) {
  this.cssList = this.cssList || [];
  this.cssList.push(str);
});
//记录日志
log.use(app);
// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({
  limit: '100000kb'
}));
app.use(bodyParser.urlencoded({
  extended: false,
  limit: '100000kb'
}));
app.use(cookieParser());
app.use(express['static'](path.join(__dirname, 'public')));
//会话
app.use(session({
  genid: uuid.v1,
  resave: false,
  saveUninitialized: true,
  store: sessionstore.createSessionStore(),
  secret: 'api-document-server'
}));
//路由
app.use(login);
app.use('/', require('./routes/index'));
app.use('/project', require('./routes/project'));
app.use('/module', require('./routes/module'));
app.use('/interface', require('./routes/interface'));
app.use('/user', require('./routes/user'));
app.use('/api',require('./routes/api'));
app.use('/readme.html', function (req, res) {
  res.render('readme', {
    static: true
  });
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
module.exports = app;
