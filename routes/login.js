/*global require,module*/
var monk = require('monk');
var conf = require('./config');
var db = monk(conf.mongoUrl);
var cUsr = db.get('users');
var time = 0;

module.exports = function (req, res, next) {
  'use strict';
  //如果已登录，验证token
  if(!req.session.user&&req.cookies.token){
    try{
      var dec = decode(req.cookies.token);
      var user = JSON.parse(dec);
      cUsr.find(user, function(err, data){
        if(err){
          console.error(err);
          res.status(500).send(err);
        } else {
          if(data){
            req.session.user = data[0];
            res.app.locals.user = data[0];
            logined();
          }
        }
      });
    } catch(e){
      console.error(e);
      res.status(500).send(e);
    }
  } else {
    res.app.locals.user = req.session.user;
    logined();
  }
  function logined(){
    //跳转登陆页面
    if(!req.session.user && !/\/login*/.test(req.path) && '/'!== req.path) {
      if(/(.html)$/.test(req.path)) res.redirect("/login.html");
      else res.send(401, {message:'请重新登陆'});
    } else if('/login'===req.path){
      //登陆接口
      cUsr.find({
        name: req.body.name,
        password: req.body.password
      }, function(err, data) {
        if (err) {
          console.error(err);
          res.status(500).send(err);
        } else if (data.length) {
          var token = encode(JSON.stringify({name: req.body.name, password: req.body.password }));
          res.json({
            token: token,
            url: '/project/index.html'
          });
        } else {
          res.json({
            message: '登陆失败'
          });
        }
      });
    } else {
      next();
    }
  }
};

function encode(s) {
  'use strict';
  return s.replace(/[\d\D]/g, function($) {
      return ("000" + $.charCodeAt(0).toString(16)).slice(-4);
  });
}
function decode(s) {
  'use strict';
  return s.replace(/.{4}/g, function($) {
      return String.fromCharCode(parseInt($, 16));
  });
}
